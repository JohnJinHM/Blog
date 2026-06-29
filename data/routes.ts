export const routes = ['official', 'casual'] as const

export type Route = (typeof routes)[number]

export const defaultRoute: Route = 'official'

export function isRoute(value: string): value is Route {
  return (routes as readonly string[]).includes(value)
}

export function otherRoute(route: Route): Route {
  return route === 'official' ? 'casual' : 'official'
}

export function routeFromPathname(pathname: string): Route {
  const segment = pathname.split('/')[1]
  return isRoute(segment) ? segment : defaultRoute
}

export const routeMeta: Record<
  Route,
  { label: string; description: string; blogTitle: string; photosTitle: string }
> = {
  official: {
    label: 'Official',
    description: 'Writing, projects, and work worth keeping on the record.',
    blogTitle: 'Articles',
    photosTitle: 'Photos',
  },
  casual: {
    label: 'Casual',
    description: 'Off-the-cuff notes, snapshots, and everything in between.',
    blogTitle: 'Notes',
    photosTitle: 'Snapshots',
  },
}

export function postsForRoute<T extends { route?: string }>(items: T[], route: Route): T[] {
  return items.filter((item) => item.route === route || item.route === 'shared')
}
