'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Route, routeFromPathname } from '@/data/routes'

const EXIT_MS = 300

type RouteTransitionValue = {
  leavingFrom: Route | null
  switchTo: (href: string) => void
}

const RouteTransitionContext = createContext<RouteTransitionValue>({
  leavingFrom: null,
  switchTo: () => {},
})

export function useRouteTransition() {
  return useContext(RouteTransitionContext)
}

export default function RouteTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [leavingFrom, setLeavingFrom] = useState<Route | null>(null)

  useEffect(() => {
    setLeavingFrom(null)
  }, [pathname])

  const switchTo = (href: string) => {
    if (leavingFrom) return
    setLeavingFrom(routeFromPathname(pathname))
    setTimeout(() => router.push(href), EXIT_MS)
  }

  return (
    <RouteTransitionContext.Provider value={{ leavingFrom, switchTo }}>
      {children}
    </RouteTransitionContext.Provider>
  )
}
