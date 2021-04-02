/* eslint-disable require-jsdoc */
const functions = require('firebase-functions')
const {Firestore} = require('@google-cloud/firestore')
const {bgRuntimeOpts, region} = require('./runtime.js')

const got = require('got')
const jsdom = require('jsdom')
const {JSDOM} = jsdom

const alpha = require('alphavantage')({key: 'HKT1QPUKJ9X8WGFU'})
const outputSize = 'compact'
const interval = '60min'
const dataType = 'json'

const symbols = ['RDSB.LON', 'LLOY.LON', 'AV.LON', 'BP.LON', 'NWG.LON',
  'IMB.LON', 'HSBA.LON', 'WFC', 'MSFT', 'VMW', 'LMT', 'BUD', 'GOOGL',
  'MRK', 'DAI.DEX', 'BMW.DEX', 'RNO.PAR']

async function getAwkwardSymbol(symbol) {
  if (symbol !== 'TEF') {
    return new Error('unsupported awkward symbol')
  }
  const bolsaMadridTEFUrl = 'https://www.bolsamadrid.es/ing/aspx/Empresas/FichaValor.aspx?ISIN=ES0178430E18'
  const eodValue = got(bolsaMadridTEFUrl).then((response) => {
    const dom = new JSDOM(response.body)
    const htmlCollection = dom.window.document.getElementsByTagName('td')
    const elements = [].slice.call(htmlCollection)
    const eligibleElements = []
    elements.forEach((tag) => {
      if (
        tag.classList.length === 0 &&
        tag.childElementCount === 0 &&
        Number(tag.innerHTML)) {
        eligibleElements.push(tag)
      }
    })
    return eligibleElements[0].innerHTML
  }).catch((err) => {
    return new Error(err)
  })
  return eodValue
}

async function getPrices(tickers) {
  const prices = {}
  for (const [index, ticker] of tickers.entries()) {
    let sleepTime = 0
    const remainder = index % 5
    if (remainder === 0 && index !== 0) {
      sleepTime = 61000
    }
    functions.logger.info(
      `Waiting ${sleepTime / 1000} seconds 
      before grabbing next ticker ${ticker}, index is ${index}`)
    await new Promise((r) => setTimeout(r, sleepTime))
    prices[ticker] = await alpha.data.quote(
      ticker,
      outputSize,
      dataType,
      interval)
      .then((res) => {
        functions.logger.info(ticker, res['Global Quote']['05. price'])
        return res['Global Quote']['05. price']
      })
      .catch((err) => {
        functions.logger.error(err)
        return 0
      })
  }
  return prices
}

async function pushToFirestore(prices) {
  const firestore = new Firestore()
  const dateString = new Date().toISOString().substr(0, 10)
  const documentReference = firestore
    .collection('stockTimeSeries')
    .doc(dateString)
  await documentReference.set(prices)
    .then((res) => {
      functions.logger.info(`Set ${dateString} document successfully`, res)
    })
    .catch((err) => {
      functions.logger.error(err)
    })
}

exports.main = functions
  .region(region)
  .runWith(bgRuntimeOpts)
  .pubsub
  .schedule('every day 23:00')
  .timeZone('Europe/London')
  .onRun(async (context) => {
    try {
      const telefonicaPrice = await getAwkwardSymbol('TEF')
      const prices = await getPrices(symbols)
      prices['TEF'] = telefonicaPrice
      functions.logger.info(`Prices: ${JSON.stringify(prices)}`)
      await pushToFirestore(prices)
    } catch (err) {
      functions.logger.error(err)
    }
  })
