'use client'

import { useRouteTransition } from '@/components/RouteTransitionProvider'

interface Props {
  href: string
  className?: string
  'aria-label'?: string
  onClick?: () => void
  children: React.ReactNode
}

export default function RouteSwitchLink({ href, className, onClick, children, ...rest }: Props) {
  const { switchTo } = useRouteTransition()
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
        switchTo(href)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
