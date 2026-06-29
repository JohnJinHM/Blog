import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { isRoute, postsForRoute, routeMeta, routes, Route } from '@/data/routes'
import { Metadata } from 'next'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => routes.map((route) => ({ route }))

export async function generateMetadata(props: {
  params: Promise<{ route: string }>
}): Promise<Metadata> {
  const { route } = await props.params
  const label = isRoute(route) ? routeMeta[route].label : ''
  return genPageMetadata({ title: `${label} Blog` })
}

export default async function BlogPage(props: { params: Promise<{ route: string }> }) {
  const { route } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  const posts = allCoreContent(sortPosts(postsForRoute(allBlogs, route as Route)))
  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
  const pagination = { currentPage: pageNumber, totalPages }

  return (
    <ListLayout
      posts={posts}
      route={route as Route}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={routeMeta[route as Route].blogTitle}
    />
  )
}
