import Head from 'next/head'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import Prism from 'Prismjs'
import 'prismjs/components/prism-hcl.min'
import { useEffect } from 'react'

const name = '@mdinos'
export const siteTitle = '@mdinos'

export default function Layout({ children, home, blog, blogPost, stocks }) {
  useEffect(() => {
    Prism.highlightAll()
  }, [])
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="A website about @mdinos" />
        <meta name="og:title" content={siteTitle} />
        <script defer src="/__/firebase/8.2.7/firebase-app.js"></script>
        <script defer src="/__/firebase/8.2.7/firebase-functions.js"></script>
      </Head>
      <header className={styles.header}>
        <>
          <h1 className={utilStyles.heading2Xl}>{name}</h1>
        </>
        <h2 className={`${utilStyles.lightText} ${styles.tagLineHeading}`}>
          code snippets and side projects
        </h2>
        <section className={styles.navBar}>
          <Link href="/">
            <a className={`${styles.navElem} ${home ? styles.active : ''}`}>
              Home
            </a>
          </Link>
          <Link href="/blog/">
            <a className={`${styles.navElem} ${blog ? styles.active : ''}`}>
              Blog
            </a>
          </Link>
          <Link href="/stocks/">
            <a className={`${styles.navElem} ${stocks ? styles.active : ''}`}>
              Stocks
            </a>
          </Link>
        </section>
      </header>
      <main>{children}</main>
      {blogPost && (
        <div className={styles.backToHome}>
          <Link href="/blog/">
            <a>← Back to blog home</a>
          </Link>
        </div>
      )}
      <footer className={styles.footer}>
        <section className={`${utilStyles.lightText}`}>
          <a href="https://github.com/mdinos">GitHub</a>
        </section>
      </footer>
    </div>
  )
}
