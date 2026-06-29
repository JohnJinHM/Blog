import { MetadataRoute } from 'next'
import { allBlogs, allPhotos } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { routes } from '@/data/routes'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const contentRoutes = [...allBlogs, ...allPhotos]
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const lastModified = new Date().toISOString().split('T')[0]
  const routePages = routes.flatMap((route) =>
    ['', 'blog', 'photos', 'tags'].map((page) => ({
      url: `${siteUrl}/${route}${page ? `/${page}` : ''}`,
      lastModified,
    }))
  )

  return [{ url: siteUrl, lastModified }, ...routePages, ...contentRoutes]
}
