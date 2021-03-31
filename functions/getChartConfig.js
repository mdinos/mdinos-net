const functions = require('firebase-functions')
const { callableRuntimeOpts, region } = require('./runtime.js')

const availableColours = [
  '#003f5c',
  '#2f4b7c',
  '#665191',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
]

const usaStocks = () => {
  return {
    WFC: {
      currency: 'usd',
      avgBuy: 39.29,
      qty: 0.60423,
      prevClose: finnhubClient.quote("WFC", dealWithFinnhubResponse(error, data, response))
    },
    VMW: {
      currency: 'usd',
      avgBuy: 146.97,
      qty: 0.1590161,
      prevClose: finnhubClient.quote("VMW", dealWithFinnhubResponse(error, data, response))
    },
    MSFT: {
      currency: 'usd',
      avgBuy: 239.24,
      qty: 0.1002765,
      prevClose: finnhubClient.quote("MSFT", dealWithFinnhubResponse(error, data, response))
    },
    MRK: {
      currency: 'usd',
      avgBuy: 76.43,
      qty: 0.310613,
      prevClose: finnhubClient.quote("MRK", dealWithFinnhubResponse(error, data, response))
    },
    LMT: {
      currency: 'usd',
      avgBuy: 347.67,
      qty: 0.0910634,
      prevClose: finnhubClient.quote("LMT", dealWithFinnhubResponse(error, data, response))
    },
    BUD: {
      currency: 'usd',
      avgBuy: 62.57,
      qty: 0.381025,
      prevClose: finnhubClient.quote("BUD", dealWithFinnhubResponse(error, data, response))
    },
    GOOGL: {
      currency: 'usd',
      avgBuy: 2097.04,
      qty: 0.114018,
      prevClose: finnhubClient.quote("GOOGL", dealWithFinnhubResponse(error, data, response))
    }
  }
}

const ukStocks = ['RDSB', 'LLOY', 'AV', 'BP', 'NWG', 'IMB']
//const usaStocks = ['WFC', 'MSFT', 'VMW', 'LMT', 'BUD', 'GOOGL', 'JNJ', 'MRK']
const euStocks = ['DAI', 'BMW', 'RNO', 'TEF']
const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

exports.main = functions
  .runWith(callableRuntimeOpts)
  .region(region)
  .https.onCall((data, context) => {
    const response = {
      age: Date.now(),
      configs: {},
    }
    data.charts.forEach((chartName) => {
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
      let config
      if (chartName != 'usa') {
        const randData = []
        stockList.forEach(() => {
          randData.push(getRandomInt(30))
        })
        config = {
          type: 'doughnut',
          data: {
            datasets: [
              {
                data: randData,
                backgroundColor: availableColours
                  .sort(() => Math.random() - 0.5)
                  .slice(0, stockList.length),
                label: `${chartName.toUpperCase()} Stocks`,
              },
            ],
            labels: stockList,
          },
          options: {
            cutout: "65%",
            plugins: {
              legend: {
                display: false
              },
            },
            responsive: true,
            animation: {
              animateScale: false,
              animateRotate: true,
            },
          },
        }
      } else {
        let data = []
        functions.logger.info(stockList())
        Object.keys(stockList()).forEach((stock) => {
          functions.logger.info(stockList[stock])
          data.push(stockList[stock].qty * stockList[stock].prevClose)
        })
        config = {
          type: 'doughnut',
          data: {
            datasets: [
              {
                data: data,
                backgroundColor: availableColours
                  .sort(() => Math.random() - 0.5)
                  .slice(0, stockList.length),
                label: `${chartName.toUpperCase()} Stocks`,
              },
            ],
            labels: Object.keys(stockList),
          },
          options: {
            cutout: "65%",
            plugins: {
              legend: {
                display: false
              },
            },
            responsive: true,
            animation: {
              animateScale: false,
              animateRotate: true,
            },
          },
        }
      }
      response.configs[`${chartName}`] = config
    })
    functions.logger.info(response)
    return response
  })
