import Link from 'next/link'
import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import { getSortedPostsData } from '../../lib/posts'
import utilStyles from '../../styles/utils.module.css'
import BlogCard from '../../components/blogCard'
import Date from '../../components/date'

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData,
    },
  }
}

export default function Blog({ allPostsData }) {
  return (
    <Layout blog>
      <Head>
        <title>Blog {siteTitle}</title>
      </Head>
      <h1 className={utilStyles.headingXl}>Blog</h1>
      {allPostsData.map(({ id, date, title }) => (
        <>
          <Link href={`/blog/posts/${id}`}>
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
