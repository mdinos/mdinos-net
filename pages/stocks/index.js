import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import StockCard from '../../components/stockCard'
import utilStyles from '../../styles/utils.module.css'
import { functions } from '../../lib/firebase'
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js'
import React, { useEffect, useRef } from 'react'

Chart.register(DoughnutController, ArcElement, Tooltip)

const charts = ['uk', 'usa', 'eu']

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

async function callGetChartConfig(functions, chart) {
  let config

  await functions
    .httpsCallable('getChartConfig-main')({
      chart,
    })
    .then((res) => {
      config = res.data
    })
    .catch((err) => {
      console.error(err)
    })
  return config
}

export default function Stocks() {
  const chartContainers = {}
  for (const chart of charts) {
    chartContainers[chart] = useRef(null)

    useEffect(async () => {
      /** 
       * Create charts, either use local storage data if it's younger than 10 minutes, 
       * else refresh data from Cloud Function call
       */
      if (window.location.hostname == 'localhost') {
        functions.useEmulator('localhost', 5001)
      }
      const localStorageKey = `mdinosNetStockChartConfig-${chart}`
      const timeNow = Date.now()
      const tenMinutes = 1000 * 60 * 10
      const localStorageData = JSON.parse(localStorage.getItem(localStorageKey))
      let config

      const refreshData = async () => {
        const response = await callGetChartConfig(functions, chart)
        localStorage.setItem(localStorageKey, JSON.stringify(response))
        config = response.config
      }

      if (localStorageData !== 'undefined' && localStorageData !== null) {
        if (
          timeNow - localStorageData.age > tenMinutes ||
          !arraysMatch(Object.keys(localStorageData.config), ['type', 'data', 'options'])
        ) {
          await refreshData()
        } else {
          config = localStorageData.config
        }
      } else {
        await refreshData()
      }

      if (chartContainers[chart] && chartContainers[chart].current) {
        new Chart(chartContainers[chart].current, config)
      }

      /**
       * Creat event listeners for card enlargening on double click.
       */
      let card = document.getElementById(`${chart}-card`)
      card.addEventListener('dblclick', () => {
        let otherCards = []
        charts.forEach((_chart) => {
          if (_chart != chart) {
            let _card = document.getElementById(`${_chart}-card`)
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
    }, [chartContainers[chart]])
  }
  
  return (
    <Layout stocks>
      <Head>
        <title>Stocks {siteTitle}</title>
      </Head>
      <h1 className={utilStyles.headingXl}>Stocks</h1>
      <section id='information'>
        <p>
          This is my stocks portfolio. The prices are in GBP, 
          updated every 24 hours at 11PM London time.
          <br/><br/>
          I plan to add more detail to this page, more charts, such as profit/losses, 
          initial investment quantites and suchlike, but for now, just current values and tickers.
          <br/><br/>
          Double click on any chart to enlargen it!
        </p>
      </section>
      <section id="charts">
        <StockCard uk>
          <canvas id="uk" ref={chartContainers['uk']}></canvas>
        </StockCard>
        <StockCard usa>
          <canvas id="usa" ref={chartContainers['usa']}></canvas>
        </StockCard>
        <StockCard eu>
          <canvas id="eu" ref={chartContainers['eu']}></canvas>
        </StockCard>
      </section>
    </Layout>
  )
}
