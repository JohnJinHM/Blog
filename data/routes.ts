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
  {
    label: string
    description: string
    blogTitle: string
    photosTitle: string
    homeIntro: string
    avatar: string
  }
> = {
  official: {
    label: 'Official',
    description: 'Writing, projects, and work worth keeping on the record.',
    blogTitle: 'Articles',
    photosTitle: 'Photos',
    homeIntro:
      'I build software and write about the projects and ideas worth keeping on the record. Here is a short account of the work and roles that shaped me.',
    avatar: '/static/images/avatar-official.jpg',
  },
  casual: {
    label: 'Casual',
    description: 'Off-the-cuff notes, snapshots, and everything in between.',
    blogTitle: 'Notes',
    photosTitle: 'Snapshots',
    homeIntro:
      'Off the clock, this is where I keep the half-formed notes, snapshots, and side projects. A more relaxed look at what I get up to for fun.',
    avatar: '/static/images/avatar.png',
  },
}

export function postsForRoute<T extends { route?: string }>(items: T[], route: Route): T[] {
  return items.filter((item) => item.route === route || item.route === 'shared')
}
