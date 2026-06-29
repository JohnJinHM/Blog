import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Photo } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import Image from '@/components/Image'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { Route, defaultRoute, isRoute } from '@/data/routes'

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface LayoutProps {
  content: CoreContent<Photo>
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}

export default function PhotoLayout({ content, next, prev, children }: LayoutProps) {
  const { slug, title, date, image, tags } = content
  const route: Route = isRoute(content.route ?? '') ? (content.route as Route) : defaultRoute

  return (
    <SectionContainer>
      <article data-route={route} className={`route-${route}`}>
        <div className="space-y-2 pt-6 pb-10 text-center">
          <dl>
            <dt className="sr-only">Published on</dt>
            <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
              <time dateTime={date}>
                {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
              </time>
            </dd>
          </dl>
          <PageTitle>{title}</PageTitle>
        </div>
        <div className="relative w-full overflow-hidden rounded-md">
          <Image
            src={image}
            alt={title}
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
          />
        </div>
        <div className="prose dark:prose-invert max-w-none py-8">{children}</div>
        {tags && tags.length > 0 && (
          <div className="py-4">
            <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Tags
            </h2>
            <div className="flex flex-wrap">
              {tags.map((tag) => (
                <Tag key={tag} text={tag} route={route} />
              ))}
            </div>
          </div>
        )}
        {(next || prev) && (
          <div className="flex justify-between border-t border-gray-200 py-4 dark:border-gray-700">
            {prev && prev.path ? (
              <Link
                href={`/${prev.path}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                &larr; {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && next.path && (
              <Link
                href={`/${next.path}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {next.title} &rarr;
              </Link>
            )}
          </div>
        )}
        {siteMetadata.comments && (
          <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300" id="comment">
            <Comments slug={slug} />
          </div>
        )}
        <div className="pt-4">
          <Link
            href={`/${route}/photos`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="Back to photos"
          >
            &larr; Back to photos
          </Link>
        </div>
      </article>
    </SectionContainer>
  )
}
