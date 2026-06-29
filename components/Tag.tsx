'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { Route, routeFromPathname } from '@/data/routes'

interface Props {
  text: string
  route?: Route
}

const Tag = ({ text, route }: Props) => {
  const pathname = usePathname()
  const activeRoute = route ?? routeFromPathname(pathname)
  return (
    <Link
      href={`/${activeRoute}/tags/${slug(text)}`}
      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mr-3 text-sm font-medium uppercase"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
