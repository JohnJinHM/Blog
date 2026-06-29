import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs, allPhotos } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { PhotoGrid } from '@/layouts/ListLayoutPhotos'
import siteMetadata from '@/data/siteMetadata'
import { isRoute, postsForRoute, routes, Route } from '@/data/routes'
import tagData from 'app/tag-data.json'
import { Metadata } from 'next'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ route: string; tag: string }>
}): Promise<Metadata> {
  const { route, tag: rawTag } = await props.params
  const tag = decodeURI(rawTag)
  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/${route}/tags/${tag}/feed.xml`,
      },
    },
  })
}

export const generateStaticParams = async () => {
  return routes.flatMap((route) => {
    const tagCounts = (tagData as Record<string, Record<string, number>>)[route] || {}
    return Object.keys(tagCounts).map((tag) => ({ route, tag: encodeURI(tag) }))
  })
}

export default async function TagPage(props: { params: Promise<{ route: string; tag: string }> }) {
  const { route, tag: rawTag } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  const tag = decodeURI(rawTag)
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)

  const hasTag = (item: { tags?: string[] }) =>
    item.tags && item.tags.map((t) => slug(t)).includes(tag)

  const filteredPosts = allCoreContent(
    sortPosts(postsForRoute(allBlogs, route as Route).filter(hasTag))
  )
  const filteredPhotos = allCoreContent(
    sortPosts(postsForRoute(allPhotos, route as Route).filter(hasTag))
  )

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = filteredPosts.slice(0, POSTS_PER_PAGE)
  const pagination = { currentPage: 1, totalPages }

  return (
    <div>
      <ListLayout
        posts={filteredPosts}
        route={route as Route}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title={title}
      />
      {filteredPhotos.length > 0 && (
        <div className="pt-10">
          <h2 className="pb-6 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Photos
          </h2>
          <PhotoGrid photos={filteredPhotos} route={route as Route} />
        </div>
      )}
    </div>
  )
}
