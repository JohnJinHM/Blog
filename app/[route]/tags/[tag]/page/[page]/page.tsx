import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { isRoute, postsForRoute, routes, Route } from '@/data/routes'
import tagData from 'app/tag-data.json'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  return routes.flatMap((route) => {
    const tagCounts = (tagData as Record<string, Record<string, number>>)[route] || {}
    return Object.keys(tagCounts).flatMap((tag) => {
      const count = postsForRoute(allBlogs, route).filter(
        (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)
      ).length
      const totalPages = Math.ceil(count / POSTS_PER_PAGE)
      return Array.from({ length: totalPages }, (_, i) => ({
        route,
        tag: encodeURI(tag),
        page: (i + 1).toString(),
      }))
    })
  })
}

export default async function TagPage(props: {
  params: Promise<{ route: string; tag: string; page: string }>
}) {
  const { route, tag: rawTag, page } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  const tag = decodeURI(rawTag)
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)

  const filteredPosts = allCoreContent(
    sortPosts(
      postsForRoute(allBlogs, route as Route).filter(
        (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)
      )
    )
  )
  const pageNumber = parseInt(page)
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = { currentPage: pageNumber, totalPages }

  return (
    <ListLayout
      posts={filteredPosts}
      route={route as Route}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={title}
    />
  )
}
