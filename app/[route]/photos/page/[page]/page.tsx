import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allPhotos } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import ListLayoutPhotos from '@/layouts/ListLayoutPhotos'
import { isRoute, postsForRoute, routeMeta, routes, Route } from '@/data/routes'

const PHOTOS_PER_PAGE = 8

export const generateStaticParams = async () => {
  return routes.flatMap((route) => {
    const count = postsForRoute(allPhotos, route).length
    const totalPages = Math.ceil(count / PHOTOS_PER_PAGE)
    return Array.from({ length: totalPages }, (_, i) => ({ route, page: (i + 1).toString() }))
  })
}

export default async function Page(props: { params: Promise<{ route: string; page: string }> }) {
  const { route, page } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  const photos = allCoreContent(sortPosts(postsForRoute(allPhotos, route as Route)))
  const pageNumber = parseInt(page)
  const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE)

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPhotos = photos.slice(
    PHOTOS_PER_PAGE * (pageNumber - 1),
    PHOTOS_PER_PAGE * pageNumber
  )
  const pagination = { currentPage: pageNumber, totalPages }

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
