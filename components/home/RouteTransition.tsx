'use client'

import { usePathname } from 'next/navigation'
import { routeFromPathname } from '@/data/routes'
import { useRouteTransition } from '@/components/RouteTransitionProvider'

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const route = routeFromPathname(usePathname())
  const { leavingFrom } = useRouteTransition()
  return (
    <div key={route} className={leavingFrom === route ? 'route-leave' : 'route-enter'}>
      {children}
    </div>
  )
}
