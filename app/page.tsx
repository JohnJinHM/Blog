import { defaultRoute } from '@/data/routes'

const target = `${process.env.BASE_PATH || ''}/${defaultRoute}/`

export default function Page() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(target)})` }} />
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <a href={target}>Continue to {defaultRoute}</a>
    </>
  )
}
