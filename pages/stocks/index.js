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
      <section id="charts">
        <StockCard uk />
        <StockCard usa />
        <StockCard eu />
      </section>
    </Layout>
  )
}
