import styles from './blogCard.module.css'

export default function BlogCard({ children }) {
  return <div className={styles.card}>{children}</div>
}
