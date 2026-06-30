import { CoreContent } from 'pliny/utils/contentlayer'
import type { Authors, Blog, Photo } from 'contentlayer/generated'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { routeMeta, Route } from '@/data/routes'
import type { Experience } from '@/data/experiences'
import Link from '@/components/Link'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import SocialIcon from '@/components/social-icons'

const MAX_POSTS = 5
const MAX_PHOTOS = 4

interface Props {
  route: Route
  author: CoreContent<Authors>
  experiences: Experience[]
  intro: string
  posts: CoreContent<Blog>[]
  photos: CoreContent<Photo>[]
}

export default function HomeLayout({ route, author, experiences, intro, posts, photos }: Props) {
  const { name, avatar, occupation, company, email, linkedin, github } = author
  const meta = routeMeta[route]

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="items-start space-y-8 py-8 xl:grid xl:grid-cols-3 xl:space-y-0 xl:gap-x-8">
        <div className="flex flex-col items-center text-center xl:col-span-1">
          {avatar && (
            <Image
              src={avatar}
              alt="avatar"
              width={192}
              height={192}
              className="h-40 w-40 rounded-full"
            />
          )}
          <h1 className="pt-4 pb-1 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {name}
          </h1>
          {occupation && <div className="text-gray-500 dark:text-gray-400">{occupation}</div>}
          {company && <div className="text-gray-500 dark:text-gray-400">{company}</div>}
          <div className="flex space-x-3 pt-4">
            <SocialIcon kind="mail" href={`mailto:${email}`} />
            <SocialIcon kind="github" href={github} />
            <SocialIcon kind="linkedin" href={linkedin} />
          </div>
        </div>
        <div className="xl:col-span-2">
          <h2 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
            {meta.label}
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-500 dark:text-gray-400">{intro}</p>
          <ul className="mt-8 space-y-6">
            {experiences.map((exp) => (
              <li key={`${exp.role}-${exp.org}-${exp.period}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <h3 className="text-lg leading-7 font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {exp.role}
                    <span className="font-normal text-gray-500 dark:text-gray-400">
                      {' '}
                      · {exp.org}
                    </span>
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{exp.period}</span>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-500 dark:text-gray-400">
                  {exp.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="py-8">
        <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {meta.blogTitle}
        </h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_POSTS).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-6">
                <article className="space-y-3">
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
                  <div className="flex flex-wrap">
                    {tags.map((tag) => (
                      <Tag key={tag} text={tag} route={route} />
                    ))}
                  </div>
                  <div className="prose max-w-none text-gray-500 dark:text-gray-400">{summary}</div>
                  <div className="text-base leading-6 font-medium">
                    <Link
                      href={`/blog/${slug}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Read more: "${title}"`}
                    >
                      Read more &rarr;
                    </Link>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
        {posts.length > MAX_POSTS && (
          <div className="flex justify-end text-base leading-6 font-medium">
            <Link
              href={`/${route}/blog`}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label={`All ${meta.blogTitle}`}
            >
              All {meta.blogTitle} &rarr;
            </Link>
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="py-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {meta.photosTitle}
            </h2>
            <Link
              href={`/${route}/photos`}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base font-medium"
            >
              All {meta.photosTitle} &rarr;
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
    </div>
  )
}
