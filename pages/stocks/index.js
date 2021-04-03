import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import StockCard from '../../components/stockCard'
import utilStyles from '../../styles/utils.module.css'

export default function Stocks() {
  return (
    <Layout stocks>
      <Head>
        <title>Stocks {siteTitle}</title>
        <script
          type="text/javascript"
          type="module"
          src="/js/dist/chart.esm.js"
        ></script>
        <script type="text/javascript" type="module" src="/js/main.js"></script>
      </Head>
      <h1 className={utilStyles.headingXl}>Stocks</h1>
      <section id='information'>
        <p>
          This is my stocks portfolio. The prices are in GBP, 
          updated every 24 hours at 11PM London time.
          <br/><br/>
          I plan to add more detail to this page, more charts, such as profit/losses, 
          initial investment quantites and suchlike, but for now, just current values and tickers.
        </p>
      </section>
      <section id="charts">
        <StockCard uk />
        <StockCard usa />
        <StockCard eu />
      </section>
    </Layout>
  )
}
