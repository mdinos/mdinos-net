import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../components/layout'
import BlogCard from '../components/blogCard'
import Date from '../components/date'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData,
    },
  }
}

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>Home {siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>
          I'm a Cloud Engineer, but I do other things too!
        </p>
      </section>
      <h2 className={utilStyles.headingXl}>Blog</h2>
      {allPostsData.map(({ id, date, title }) => (
        <>
          <Link href={`/posts/${id}`}>
            <a className={utilStyles.blogCardLink}>
              <BlogCard>
                <h1 className={utilStyles.paragraphTextBig} key={id}>
                  {title}
                </h1>
                <p className={utilStyles.lightText}>
                  <Date dateString={date} />
                </p>
              </BlogCard>
            </a>
          </Link>
        </>
      ))}
    </Layout>
  )
}
