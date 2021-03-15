const functions = require('firebase-functions')
const runtimeOpts = require('./runtime.js')

const region = 'europe-west2'
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
const ukStocks = ['RDSB', 'LLOY', 'AV', 'BP', 'NWG', 'IMB']
const usaStocks = ['JPM', 'MSFT', 'VMW', 'ATVI', 'BUD', 'GOOGL', 'JNJ']
const euStocks = ['DAI', 'BMW', 'RNO', 'TEF']
const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

exports.main = functions
  .runWith(runtimeOpts)
  .region(region)
  .https.onCall((data, context) => {
    response = {
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
      let randData = []
      stockList.forEach(() => {
        randData.push(getRandomInt(30))
      })
      const config = {
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
          responsive: true,
          animation: {
            animateScale: false,
            animateRotate: true,
          },
        },
      }
      response.configs[`${chartName}`] = config
    })
    functions.logger.info(response)
    return response
  })
