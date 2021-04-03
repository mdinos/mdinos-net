/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
const functions = require('firebase-functions')
const {Firestore} = require('@google-cloud/firestore')
const {callableRuntimeOpts, region} = require('./runtime.js')

const firestore = new Firestore()

const availableColours = ['#003f5c', '#2f4b7c', '#665191', '#a05195',
  '#d45087', '#f95d6a', '#ff7c43', '#ffa600']

const ukStocks = [
  'RDSB.LON', 'LLOY.LON', 'AV.LON', 'BP.LON', 'NWG.LON', 'IMB.LON', 'HSBA.LON']

const usaStocks = ['WFC', 'MSFT', 'VMW', 'LMT', 'BUD', 'GOOGL', 'MRK']

const euStocks = ['DAI.DEX', 'BMW.DEX', 'RNO.PAR', 'TEF']

function sortByDate(a, b) {
  if (a.date < b.date) {
    return 1
  }
  if (a.date > b.date) {
    return -1
  }
  return 0
}

function selectLatest(docs) {
  const documentIds = []
  for (const doc of docs) {
    const id = doc.id
    documentIds.push(id)
  }
  const latestDocument = documentIds.sort(sortByDate)[documentIds.length - 1]
  return latestDocument
}

async function getLatestDocFromCollection(collection) {
  let data
  try {
    const collectionReference = firestore.collection(collection)
    const snapshot = await collectionReference.get()
    const docs = snapshot.docs
    const latestDocumentId = selectLatest(docs)
    const documentReference = await collectionReference.doc(latestDocumentId)
      .get()
    data = documentReference.data()
  } catch (err) {
    functions.logger.error(err)
  }
  return data
}

exports.main = functions
  .runWith(callableRuntimeOpts)
  .region(region)
  .https.onCall(async (data, context) => {
    const portfolio = await getLatestDocFromCollection('portfolioData')
    const stockTimeSeries = await getLatestDocFromCollection('stockTimeSeries')
    const exchangeRates = await getLatestDocFromCollection('exchangeRates')
    const response = {
      age: Date.now(),
      configs: {},
    }
    for (const chartName of data.charts) {
      let stockList
      switch (chartName) {
      case 'uk':
        stockList = ukStocks
        break
      case 'usa':
        stockList = usaStocks
        break
      case 'eu':
        stockList = euStocks
        break
      default:
        throw new Error('Failed to find stockList with matching identifier')
      }
      const currentHoldingValues = {}
      for (const stock of stockList) {
        let value = portfolio[stock].qty * stockTimeSeries[stock]
        if (portfolio[stock].currency === 'GBX') {
          value = value / 100
        } else {
          value = (1 / exchangeRates[portfolio[stock].currency]) * value
        }
        currentHoldingValues[stock] = value
      }
      const config = {
        type: 'doughnut',
        data: {
          datasets: [
            {
              data: Object.values(currentHoldingValues),
              backgroundColor: availableColours
                .sort(() => Math.random() - 0.5)
                .slice(0, stockList.length),
              label: `${chartName.toUpperCase()} Stocks`,
            },
          ],
          labels: Object.keys(currentHoldingValues),
        },
        options: {
          cutout: '65%',
          plugins: {
            legend: {
              display: false,
            },
          },
          responsive: true,
          animation: {
            animateScale: false,
            animateRotate: true,
          },
        },
      }
      response.configs[chartName] = config
    }
    return response
  })
