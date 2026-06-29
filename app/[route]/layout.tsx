import { notFound } from 'next/navigation'
import { isRoute, routes } from '@/data/routes'

export const generateStaticParams = async () => routes.map((route) => ({ route }))

export default async function RouteLayout(props: {
  children: React.ReactNode
  params: Promise<{ route: string }>
}) {
  const { route } = await props.params
  if (!isRoute(route)) {
    return notFound()
  }
  return (
    <div data-route={route} className={`route-${route}`}>
      {props.children}
    </div>
  )
}
