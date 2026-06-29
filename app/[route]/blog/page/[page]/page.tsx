import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { isRoute, postsForRoute, routeMeta, routes, Route } from '@/data/routes'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  return routes.flatMap((route) => {
    const count = postsForRoute(allBlogs, route).length
    const totalPages = Math.ceil(count / POSTS_PER_PAGE)
    return Array.from({ length: totalPages }, (_, i) => ({ route, page: (i + 1).toString() }))
  })
}

export default async function Page(props: { params: Promise<{ route: string; page: string }> }) {
  const { route, page } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  const posts = allCoreContent(sortPosts(postsForRoute(allBlogs, route as Route)))
  const pageNumber = parseInt(page)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
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
