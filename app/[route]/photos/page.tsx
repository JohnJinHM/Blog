import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allPhotos } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { genPageMetadata } from 'app/seo'
import ListLayoutPhotos from '@/layouts/ListLayoutPhotos'
import { isRoute, postsForRoute, routeMeta, routes, Route } from '@/data/routes'
import { Metadata } from 'next'

const PHOTOS_PER_PAGE = 8

export const generateStaticParams = async () => routes.map((route) => ({ route }))

export async function generateMetadata(props: {
  params: Promise<{ route: string }>
}): Promise<Metadata> {
  const { route } = await props.params
  const label = isRoute(route) ? routeMeta[route].label : ''
  return genPageMetadata({ title: `${label} Photos` })
}

export default async function PhotosPage(props: { params: Promise<{ route: string }> }) {
  const { route } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  const photos = allCoreContent(sortPosts(postsForRoute(allPhotos, route as Route)))
  const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE)
  const initialDisplayPhotos = photos.slice(0, PHOTOS_PER_PAGE)
  const pagination = { currentPage: 1, totalPages }

  return (
    <ListLayoutPhotos
      photos={photos}
      route={route as Route}
      initialDisplayPhotos={initialDisplayPhotos}
      pagination={pagination}
      title={routeMeta[route as Route].photosTitle}
    />
  )
}
