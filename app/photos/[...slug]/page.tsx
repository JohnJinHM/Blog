import 'css/prism.css'
import 'katex/dist/katex.css'

import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allPhotos } from 'contentlayer/generated'
import type { Photo } from 'contentlayer/generated'
import PhotoLayout from '@/layouts/PhotoLayout'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const photo = allPhotos.find((p) => p.slug === slug)
  if (!photo) {
    return
  }

  const publishedAt = new Date(photo.date).toISOString()
  const modifiedAt = new Date(photo.lastmod || photo.date).toISOString()
  const image = photo.image.includes('http') ? photo.image : siteMetadata.siteUrl + photo.image

  return {
    title: photo.title,
    description: photo.summary,
    openGraph: {
      title: photo.title,
      description: photo.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: photo.title,
      description: photo.summary,
      images: [image],
    },
  }
}

export const generateStaticParams = async () => {
  return allPhotos.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const sortedCoreContents = allCoreContent(sortPosts(allPhotos))
  const photoIndex = sortedCoreContents.findIndex((p) => p.slug === slug)
  if (photoIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[photoIndex + 1]
  const next = sortedCoreContents[photoIndex - 1]
  const photo = allPhotos.find((p) => p.slug === slug) as Photo
  const mainContent = coreContent(photo)
  const jsonLd = photo.structuredData

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PhotoLayout content={mainContent} next={next} prev={prev}>
        <MDXLayoutRenderer code={photo.body.code} components={components} toc={photo.toc} />
      </PhotoLayout>
    </>
  )
}
