'use client'

import { useEffect, useRef, useState } from 'react'

const basePath = process.env.BASE_PATH || ''

interface PhotoImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  blur?: string
  widths?: number[]
  sizes: string
  priority?: boolean
  className?: string
}

function derivative(src: string, w: number) {
  return src.replace(/\.(jpe?g|png|webp|avif)$/i, `-${w}w.jpg`)
}

export default function PhotoImage({
  src,
  alt,
  width,
  height,
  blur,
  widths = [],
  sizes,
  priority = false,
  className = '',
}: PhotoImageProps) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  // A cached image can finish loading before hydration attaches onLoad.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [])

  const full = `${basePath}${src}`
  const srcSet =
    widths.length > 0 && width
      ? [...widths.map((w) => `${basePath}${derivative(src, w)} ${w}w`), `${full} ${width}w`].join(
          ', '
        )
      : undefined

  return (
    <span
      className="relative block overflow-hidden bg-gray-100 dark:bg-gray-800"
      style={{
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
        backgroundImage: blur && !loaded ? `url(${blur})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <img
        ref={ref}
        src={full}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`block h-auto w-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </span>
  )
}
