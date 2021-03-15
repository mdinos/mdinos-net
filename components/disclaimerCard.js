import styles from './disclaimerCard.module.css'
import utilStyles from '../styles/utils.module.css'

export default function DisclaimerCard({ children }) {
  return (
    <section id="disclaimer" className={styles.card}>
      <h4 className={utilStyles.cardHeading}>Disclaimer: prices aren't live</h4>
      {children}
      <form action="##" className={styles.neverShowAgainCheckbox}>
        <input type="checkbox" id="neverShowAgain"></input>
        <label
          for="neverShowAgain"
          className={`${utilStyles.lightText} ${styles.checkboxLabel}`}
        >
          Don't show me this again!
        </label>
      </form>
      <button
        id="dismiss"
        className={`${styles.dismissBtn} ${utilStyles.paragraphTextLessBig}`}
      >
        Go away!
      </button>
    </section>
  )
}
