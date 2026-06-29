import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allPhotos } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { isRoute, postsForRoute, Route } from '@/data/routes'
import OfficialHome from '@/components/home/OfficialHome'
import CasualHome from '@/components/home/CasualHome'

export default async function Page(props: { params: Promise<{ route: string }> }) {
  const { route } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  const posts = allCoreContent(sortPosts(postsForRoute(allBlogs, route as Route)))
  const photos = allCoreContent(sortPosts(postsForRoute(allPhotos, route as Route)))

  return route === 'official' ? (
    <OfficialHome posts={posts} photos={photos} />
  ) : (
    <CasualHome posts={posts} photos={photos} />
  )
}
