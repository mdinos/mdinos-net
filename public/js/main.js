import { Chart, registerables } from './dist/chart.esm.js'
Chart.register(...registerables)

const firebaseConfig = { projectId: 'mdinos-net' }
const firebaseFunctionsRegion = 'europe-west2'

if (document.readyState !== 'loading') {
  init()
} else {
  document.addEventListener('DOMContentLoaded', function () {
    init()
  })
}

function arraysMatch(a, b) {
  if (a.length !== b.length) {
    return false
  }
  a.forEach((v) => {
    if (!b.includes(v)) {
      return false
    }
  })
  return true
}

async function callGetChartConfigs(functions, chartNames) {
  let config
  await functions
    .httpsCallable('getChartConfig-main')({
      charts: chartNames,
    })
    .then((res) => {
      config = res.data
    })
    .catch((err) => {
      console.error(err)
    })
  return config
}

async function init() {
  // dismiss disclaimer button
  const dissmissCacheKey = 'shouldDismissCardImmediately'
  let button = document.getElementById('dismiss')
  let checkbox = document.getElementById('neverShowAgain')
  let shouldDismissCardImmediately = localStorage.getItem(dissmissCacheKey)
  if (shouldDismissCardImmediately === 'true') {
    button.parentNode.remove()
  } else {
    button.addEventListener('click', () => {
      let checkboxValue = checkbox.checked
      button.parentNode.remove()
      if (checkboxValue) {
        localStorage.setItem(dissmissCacheKey, true)
      }
    })
  }

  // Initialise firebase
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

  // get chart configs
  const chartNames = ['uk', 'usa', 'eu']
  const localStorageKey = 'mdinosNetStockChartConfigs'
  const timeNow = Date.now()
  const fiveMinutes = 1000 * 60 * 5
  const localStorageData = JSON.parse(localStorage.getItem(localStorageKey))
  let configs

  // decide whether to use cache data or renew with API call
  const refreshData = async () => {
    const response = await callGetChartConfigs(functions, chartNames)
    localStorage.setItem(localStorageKey, JSON.stringify(response))
    configs = response.configs
  }

  if (localStorageData !== 'undefined' && localStorageData !== null) {
    if (
      timeNow - localStorageData.age > fiveMinutes ||
      !arraysMatch(Object.keys(localStorageData.configs), chartNames)
    ) {
      await refreshData()
    } else {
      configs = localStorageData.configs
    }
  } else {
    await refreshData()
  }

  chartNames.forEach((chartName) => {
    // create chart with data
    let canvas = document.getElementById(chartName)
    let canvasContext = canvas.getContext('2d')
    // generate error message on failure to load
    if (!configs[chartName]) {
      let parent = canvas.parentNode
      canvas.remove()
      let errorMsg = document.createElement('p')
      parent.prepend(errorMsg)
      errorMsg.innerHTML =
        "Failed to retrieve chart data, it's probably not your fault."
      parent.classList.add('errorMsg')
    }
    new Chart(canvasContext, configs[chartName])

    // Animate enlargening on double click
    let card = document.getElementById(`${chartName}-card`)
    card.addEventListener('dblclick', () => {
      let otherCards = []
      chartNames.forEach((_chartName) => {
        if (_chartName != chartName) {
          let _card = document.getElementById(`${_chartName}-card`)
          otherCards.push(_card)
        }
      })
      if (card.classList.contains('clickStockBox')) {
        card.classList.remove('clickStockBox')
        otherCards.forEach((_card) => {
          _card.classList.remove('clickStockBox')
          _card.classList.remove('isInvisible')
        })
      } else {
        card.classList.add('clickStockBox')
        otherCards.forEach((_card) => {
          _card.classList.remove('clickStockBox')
          _card.classList.add('isInvisible')
        })
      }
    })
  })
}
