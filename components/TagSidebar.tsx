'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import Link from '@/components/Link'
import { Route } from '@/data/routes'
import tagData from 'app/tag-data.json'

const TagSidebar = ({ route }: { route: Route }) => {
  const pathname = usePathname()
  const tagCounts = (tagData as Record<string, Record<string, number>>)[route] || {}
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])
  const activeTag = decodeURI(pathname.split('/tags/')[1] || '')

  return (
    <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
      <div className="px-6 py-4">
        {pathname === `/${route}/blog` ? (
          <h3 className="text-primary-500 font-bold uppercase">All Posts</h3>
        ) : (
          <Link
            href={`/${route}/blog`}
            className="hover:text-primary-500 dark:hover:text-primary-500 font-bold text-gray-700 uppercase dark:text-gray-300"
          >
            All Posts
          </Link>
        )}
        <ul>
          {sortedTags.map((t) => {
            return (
              <li key={t} className="my-3">
                {activeTag === slug(t) ? (
                  <h3 className="text-primary-500 inline px-3 py-2 text-sm font-bold uppercase">
                    {`${t} (${tagCounts[t]})`}
                  </h3>
                ) : (
                  <Link
                    href={`/${route}/tags/${slug(t)}`}
                    className="hover:text-primary-500 dark:hover:text-primary-500 px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                    aria-label={`View posts tagged ${t}`}
                  >
                    {`${t} (${tagCounts[t]})`}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default TagSidebar
