import { Route } from './routes'

export function navLinks(route: Route) {
  return [
    { href: `/${route}`, title: 'Home' },
    { href: `/${route}/blog`, title: 'Blog' },
    { href: `/${route}/photos`, title: 'Photos' },
  ]
}

export default navLinks
