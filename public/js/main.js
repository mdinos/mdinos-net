import { Chart, registerables } from './dist/chart.esm.js'
Chart.register(...registerables)

const firebaseConfig = { projectId: 'mdinos-net' }
const firebaseFunctionsRegion = 'europe-west2'

if (document.readyState !== 'loading') {
  console.log('document ready')
  init()
} else {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('domcontentloaded')
    init()
  })
}

async function generateStockChart(functions, canvasContext) {
  let config
  await functions
    .httpsCallable('getChartConfig-main')()
    .then((res) => {
      config = res.data
    })
    .catch((err) => {
      console.error(err)
    })

  let chart = new Chart(canvasContext, config)
}

function init() {
  let myApp
  let functions
  try {
    firebase.initializeApp(firebaseConfig)
    myApp = firebase.app()
    functions = myApp.functions(firebaseFunctionsRegion)
    if (window.location.hostname == 'localhost') {
      functions.useEmulator('localhost', 5001)
    }
  } catch (e) {
    console.error(e)
  }

  const chartNames = ['uk', 'usa', 'eu']
  chartNames.forEach((chartName) => {
    let chart = document.getElementById(chartName).getContext('2d')
    generateStockChart(functions, chart)

    // Animate enlargening on click
    let card = document.getElementById(`${chartName}-card`)
    card.addEventListener('click', () => {
      let otherChartNames = []
      chartNames.forEach((_chartName) => {
        if (_chartName != chartName) {
          otherChartNames.push(_chartName)
        }
      })
      card.classList.toggle('clickStockBox')
      otherChartNames.forEach((_chartName) => {
        let c = document.getElementById(`${_chartName}-card`)
        c.classList.remove('clickStockBox')
      })
    })
  })
}
