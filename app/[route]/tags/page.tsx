import { slug } from 'github-slugger'
import { notFound } from 'next/navigation'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { genPageMetadata } from 'app/seo'
import { isRoute, routeMeta, routes, Route } from '@/data/routes'
import tagData from 'app/tag-data.json'
import { Metadata } from 'next'

export const generateStaticParams = async () => routes.map((route) => ({ route }))

export async function generateMetadata(props: {
  params: Promise<{ route: string }>
}): Promise<Metadata> {
  const { route } = await props.params
  const label = isRoute(route) ? routeMeta[route].label : ''
  return genPageMetadata({ title: `${label} Tags`, description: `Things I write about` })
}

export default async function Page(props: { params: Promise<{ route: string }> }) {
  const { route } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  const tagCounts = (tagData as Record<string, Record<string, number>>)[route] || {}
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  return (
    <div className="flex flex-col items-start justify-start divide-y divide-gray-200 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
      <div className="space-x-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
          Tags
        </h1>
      </div>
      <div className="flex max-w-lg flex-wrap">
        {tagKeys.length === 0 && 'No tags found.'}
        {sortedTags.map((t) => {
          return (
            <div key={t} className="mt-2 mr-5 mb-2">
              <Tag text={t} route={route as Route} />
              <Link
                href={`/${route}/tags/${slug(t)}`}
                className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
                aria-label={`View posts tagged ${t}`}
              >
                {` (${tagCounts[t]})`}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
