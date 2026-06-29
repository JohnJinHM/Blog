'use client'

import { usePathname } from 'next/navigation'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Photo } from 'contentlayer/generated'
import Link from '@/components/Link'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import TagSidebar from '@/components/TagSidebar'
import siteMetadata from '@/data/siteMetadata'
import { Route } from '@/data/routes'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  photos: CoreContent<Photo>[]
  title: string
  route: Route
  initialDisplayPhotos?: CoreContent<Photo>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname
    .replace(/^\//, '')
    .replace(/\/page\/\d+\/?$/, '')
    .replace(/\/$/, '')
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

export function PhotoGrid({ photos, route }: { photos: CoreContent<Photo>[]; route: Route }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {photos.map((photo) => (
        <div
          key={photo.path}
          className="overflow-hidden rounded-md border-2 border-gray-200/60 dark:border-gray-700/60"
        >
          <Link href={`/${photo.path}`} aria-label={photo.title}>
            <Image
              src={photo.image}
              alt={photo.title}
              width={544}
              height={306}
              className="aspect-video w-full object-cover"
            />
          </Link>
          <div className="p-5">
            <time
              dateTime={photo.date}
              className="text-sm font-medium text-gray-500 dark:text-gray-400"
              suppressHydrationWarning
            >
              {formatDate(photo.date, siteMetadata.locale)}
            </time>
            <h2 className="mt-1 text-xl leading-8 font-bold tracking-tight">
              <Link href={`/${photo.path}`} className="text-gray-900 dark:text-gray-100">
                {photo.title}
              </Link>
            </h2>
            {photo.summary && (
              <p className="prose mt-2 max-w-none text-gray-500 dark:text-gray-400">
                {photo.summary}
              </p>
            )}
            <div className="mt-3 flex flex-wrap">
              {photo.tags?.map((tag) => (
                <Tag key={tag} text={tag} route={route} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ListLayoutPhotos({
  photos,
  title,
  route,
  initialDisplayPhotos = [],
  pagination,
}: ListLayoutProps) {
  const displayPhotos = initialDisplayPhotos.length > 0 ? initialDisplayPhotos : photos

  return (
    <div>
      <div className="pt-6 pb-6">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {title}
        </h1>
      </div>
      <div className="flex sm:space-x-24">
        <TagSidebar route={route} />
        <div className="w-full">
          {displayPhotos.length === 0 && <p>No photos found.</p>}
          <PhotoGrid photos={displayPhotos} route={route} />
          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}
