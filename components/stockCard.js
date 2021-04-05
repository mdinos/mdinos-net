import styles from './stockCard.module.css'
import utilStyles from '../styles/utils.module.css'

export default function StockCard({ children, uk, usa, eu }) {
  let name
  name = !uk ? null : 'uk'
  name = !usa && name != null ? name : 'usa'
  name = !eu && name != null ? name : 'eu'
  return (
    <a className={styles.chartBoxLink} href="##">
      <section className={styles.chart} id={`${name}-card`}>
        {children}
        <h2 className={utilStyles.paragraphTextBig}>
          {name.toUpperCase()} stock allocation
        </h2>
      </section>
    </a>
  )
}
