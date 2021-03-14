const functions = require('firebase-functions')
const runtimeOpts = require('./runtime.js')

exports.main = functions
  .runWith(runtimeOpts)
  .region('europe-west2')
  .https.onCall((data, context) => {
    functions.logger.info(data, context)
    const config = {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [1.0, 2.0, 3.0, 4.0, 5.0],
            backgroundColor: [
              '#2183b1',
              '#2F8FFD',
              '#2183b1',
              '#2ffd83',
              '#21b15b',
            ],
            label: 'UK Stocks',
          },
        ],
        labels: ['RDSB', 'LLOY', 'AV', 'BP', 'NWG'],
      },
      options: {
        responsive: true,
        animation: {
          animateScale: false,
          animateRotate: true,
        },
      },
    }
    return config
  })
