import styles from './stockCard.module.css'
import utilStyles from '../styles/utils.module.css'

// @refresh reset

export default function StockCard({ uk, usa, eu }) {
  let name
  name = !uk ? null : 'uk'
  name = !usa && name != null ? name : 'usa'
  name = !eu && name != null ? name : 'eu'
  return (
    <a className={styles.chartBoxLink} href="##">
      <section className={styles.chart} id={`${name}-card`}>
        <canvas id={name}></canvas>
        <h2 className={utilStyles.paragraphTextBig}>
          {name.toUpperCase()} Stock allotment
        </h2>
      </section>
    </a>
  )
}
