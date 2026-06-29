import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Photo } from 'contentlayer/generated'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { routeMeta } from '@/data/routes'
import Link from '@/components/Link'
import Image from '@/components/Image'
import Tag from '@/components/Tag'

const MAX_POSTS = 5
const MAX_PHOTOS = 6

interface Props {
  posts: CoreContent<Blog>[]
  photos: CoreContent<Photo>[]
}

export default function CasualHome({ posts, photos }: Props) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {routeMeta.casual.label}
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          {routeMeta.casual.description}
        </p>
      </div>
      {photos.length > 0 && (
        <div className="py-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {routeMeta.casual.photosTitle}
            </h2>
            <Link
              href="/casual/photos"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base font-medium"
            >
              All Snapshots &rarr;
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.slice(0, MAX_PHOTOS).map((photo) => (
              <Link key={photo.slug} href={`/photos/${photo.slug}`} aria-label={photo.title}>
                <Image
                  src={photo.image}
                  alt={photo.title}
                  width={500}
                  height={500}
                  className="aspect-square rounded-md object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="py-8">
        <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {routeMeta.casual.blogTitle}
        </h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No notes yet.'}
          {posts.slice(0, MAX_POSTS).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-6">
                <article className="space-y-2">
                  <dl>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-sm leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    </dd>
                  </dl>
                  <h3 className="text-xl leading-8 font-bold tracking-tight">
                    <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                      {title}
                    </Link>
                  </h3>
                  <div className="prose max-w-none text-gray-500 dark:text-gray-400">{summary}</div>
                  <div className="flex flex-wrap">
                    {tags.map((tag) => (
                      <Tag key={tag} text={tag} route="casual" />
                    ))}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
        {posts.length > MAX_POSTS && (
          <div className="flex justify-end text-base leading-6 font-medium">
            <Link
              href="/casual/blog"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="All notes"
            >
              All Notes &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
