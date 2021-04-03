/* eslint-disable require-jsdoc */
const functions = require('firebase-functions')
const {Firestore} = require('@google-cloud/firestore')
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager')
const fetch = require('node-fetch')
const {bgRuntimeOpts, region} = require('./runtime.js')

const firestore = new Firestore()
const secretsClient = new SecretManagerServiceClient()

const [fixerVersion] = await secretsClient.accessSecretVersion({
  name: `projects/${functions.config().projectId}/secrets/fixer-api/versions/latest`,
})
const fixerAPIKey = fixerVersion.payload.data.toString('utf8')

const [avVersion] = await secretsClient.accessSecretVersion({
  name: `projects/${functions.config().projectId}/secrets/alphavantage-api/versions/latest`,
})
const alphaVantageAPIKey = avVersion.payload.data.toString('utf8')

const got = require('got')
const jsdom = require('jsdom')
const {JSDOM} = jsdom

const alpha = require('alphavantage')({key: alphaVantageAPIKey})
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

async function getExchangeRates() {
  const baseUrl = `http://data.fixer.io/api/latest?access_key=${fixerAPIKey}&symbols=GBP,USD`
  const response = await fetch(baseUrl)
  const data = await response.json()
  const exchangeRates = {}
  exchangeRates['EUR'] = 1 / data.rates.GBP
  exchangeRates['USD'] = exchangeRates['EUR'] * data.rates.USD
  return exchangeRates
}

async function pushToFirestore(collection, data) {
  const dateString = new Date().toISOString().substr(0, 10)
  const documentReference = firestore
    .collection(collection)
    .doc(dateString)
  await documentReference.set(data)
    .then((res) => {
      functions.logger.info(`Set ${dateString} document in collection ${collection} successfully`, res)
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
      await pushToFirestore('stockTimeSeries', prices)
      const exchangeRates = getExchangeRates()
      await pushToFirestore('exchangeRates', exchangeRates)
    } catch (err) {
      functions.logger.error(err)
    }
  })
