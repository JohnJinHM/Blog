'use client'

import { usePathname } from 'next/navigation'
import { routeFromPathname } from '@/data/routes'

export default function RouteAccent({ children }: { children: React.ReactNode }) {
  const route = routeFromPathname(usePathname())
  return (
    <div data-route={route} className={`route-${route}`}>
      {children}
    </div>
  )
}
