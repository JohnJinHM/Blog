import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Photo } from 'contentlayer/generated'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { routeMeta } from '@/data/routes'
import Link from '@/components/Link'
import Image from '@/components/Image'
import Tag from '@/components/Tag'

const MAX_POSTS = 5
const MAX_PHOTOS = 4

interface Props {
  posts: CoreContent<Blog>[]
  photos: CoreContent<Photo>[]
}

export default function OfficialHome({ posts, photos }: Props) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {routeMeta.official.label}
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          {routeMeta.official.description}
        </p>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {!posts.length && 'No posts found.'}
        {posts.slice(0, MAX_POSTS).map((post) => {
          const { slug, date, title, summary, tags } = post
          return (
            <li key={slug} className="py-12">
              <article>
                <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <dl>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-5 xl:col-span-3">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl leading-8 font-bold tracking-tight">
                          <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                            {title}
                          </Link>
                        </h2>
                        <div className="flex flex-wrap">
                          {tags.map((tag) => (
                            <Tag key={tag} text={tag} route="official" />
                          ))}
                        </div>
                      </div>
                      <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                        {summary}
                      </div>
                    </div>
                    <div className="text-base leading-6 font-medium">
                      <Link
                        href={`/blog/${slug}`}
                        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                        aria-label={`Read more: "${title}"`}
                      >
                        Read more &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
      {photos.length > 0 && (
        <div className="py-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {routeMeta.official.photosTitle}
            </h2>
            <Link
              href="/official/photos"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base font-medium"
            >
              All Photos &rarr;
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {photos.slice(0, MAX_PHOTOS).map((photo) => (
              <Link key={photo.slug} href={`/photos/${photo.slug}`} aria-label={photo.title}>
                <Image
                  src={photo.image}
                  alt={photo.title}
                  width={400}
                  height={400}
                  className="aspect-square rounded-md object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
      {posts.length > MAX_POSTS && (
        <div className="flex justify-end pt-4 text-base leading-6 font-medium">
          <Link
            href="/official/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
