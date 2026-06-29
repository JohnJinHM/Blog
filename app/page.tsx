import { redirect } from 'next/navigation'
import { defaultRoute } from '@/data/routes'

export default function Page() {
  redirect(`/${defaultRoute}`)
}
