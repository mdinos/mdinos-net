const functions = require('firebase-functions')
const { bgRuntimeOpts, region} = require('./runtime.js')

const got = require('got');
const jsdom = require("jsdom");
const { firebaseConfig } = require('firebase-functions');
const { JSDOM } = jsdom;

const alpha = require('alphavantage')({ key: 'HKT1QPUKJ9X8WGFU' })
const outputSize = 'compact'
const interval = '60min'
const dataType = 'json'

const symbols = ['RDSB.LON', 'LLOY.LON', 'AV.LON', 'BP.LON', 'NWG.LON', 
  'IMB.LON', 'HSBA.LON', 'WFC', 'MSFT', 'VMW', 'LMT', 'BUD', 'GOOGL', 
  'MRK', 'DAI.DEX', 'BMW.DEX', 'RNO.PAR']

const awkwardSymbols = ['TEF']

async function getAwkwardSymbols(symbol) {
  if (symbol !== 'TEF') {
    return new Error('unsupported awkward symbol')
  }
  const bolsaMadridTEFUrl = 'https://www.bolsamadrid.es/ing/aspx/Empresas/FichaValor.aspx?ISIN=ES0178430E18'
  const eodValue = got(bolsaMadridTEFUrl).then(response => {
    const dom = new JSDOM(response.body);
    const htmlCollection = dom.window.document.getElementsByTagName('td')
    const elements = [].slice.call(htmlCollection)
    let eligibleElements = []
    elements.forEach((tag) => { 
      if (
        tag.classList.length === 0 && 
        tag.childElementCount === 0 && 
        Number(tag.innerHTML)) {
          eligibleElements.push(tag) 
        }
      })
      return eligibleElements[0]
  }).catch((err) => {
    return new Error(err)
  })
  return eodValue
}

exports.main = functions
  .region(region)
  .runWith(bgRuntimeOpts)
  .pubsub.schedule('every day 23:00')
  .onRun(async (context) => {
    const data = async () => {
      let prices = {}
      symbols.forEach(async (symbol, index) => {
        functions.logger.info(`Going to grab: ${symbol}, idx: ${index}`)
        if (index < 5) {
          functions.logger.info(`Not waiting before grabbing ${symbol}, as index is ${index}`)
        } else if (index >= 5 && index < 10) {
          functions.logger.info(`Waiting  61s before grabbing ${symbol}, as index is ${index}`)
          await new Promise(r => setTimeout(r, 61000))
        } else if (index >= 10 && index < 15) {
          functions.logger.info(`Waiting  122s before grabbing ${symbol}, as index is ${index}`)
          await new Promise(r => setTimeout(r, 122000))
        } else if (index >= 15 && index < 20) {
          functions.logger.info(`Waiting  183s before grabbing ${symbol}, as index is ${index}`)
          await new Promise(r => setTimeout(r, 183000))
        } else {
          functions.logger.info(`need more sleep options! ${symbol}, ${index}`)
        }
        prices[symbol] = await alpha.data.quote(
          symbol,
          outputSize,
          dataType,
          interval)
          .then((res) => { 
            functions.logger.info(symbol, res['Global Quote']['05. price'])
            return res['Global Quote']['05. price'] 
          })
          .catch((err) => {
            functions.logger.error(err)
            return 0
          })
        })
      awkwardSymbols.forEach(async (symbol) => {
        prices[symbol] = await getAwkwardSymbols(symbol)
        functions.logger.info('prices: ', prices)
      })
      return prices
    }
    data().then((res) => {
      functions.logger.info('prices @end: ', res)
    })
  })