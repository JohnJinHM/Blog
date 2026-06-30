# John Jin's Blog

A personal blog built on Next.js (App Router) + Contentlayer + Tailwind, adapted from the
[tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) template.

The site has **two switchable top-level routes**:

- **`official`** (default) — longer-form writing and project notes.
- **`casual`** — short notes and snapshots.

A header toggle switches between them. Each route has its own home, blog, photos, and tags.
Posts can belong to one route or be **shared** across both.

## Routes

```
/                          → redirects to /official
/[route]                   → route home (independent OfficialHome / CasualHome)
/[route]/blog              → article list      (+ /page/[n])
/[route]/photos            → image-post grid   (+ /page/[n])
/[route]/tags              → tag index for the route
/[route]/tags/[tag]        → tagged articles + photos (+ /page/[n])
/blog/[...slug]            → a single article (shared renderer)
/photos/[...slug]          → a single image post
```

`route` is `official` or `casual`. Single post pages live at unprefixed paths and are reachable
from either route.

## Content

Content is MDX under `data/`:

- **Articles** → `data/blog/**/*.mdx`
- **Image posts** → `data/photos/**/*.mdx`

### Article frontmatter

```yaml
---
title: 'Post title'
date: '2026-06-20'
tags: ['writing']
summary: 'Shown in lists and previews.'
route: official # 'official' | 'casual' | 'shared'
draft: false
---
```

### Image-post frontmatter

```yaml
---
title: 'Photo title'
date: '2026-06-26'
image: '/static/images/canada/mountains.jpg' # preview image (required)
tags: ['photography']
summary: 'The post message shown under the image.'
route: official # 'official' | 'casual' | 'shared'
draft: false
---

Optional MDX body rendered below the image.
```

A post with `route: shared` appears under **both** routes.

## Tags and search

- **Tags are per route.** Tag counts and tag pages are scoped to the active route; `app/tag-data.json`
  is generated as `{ "official": {…}, "casual": {…} }` by Contentlayer (shared posts count in both).
- **Search is global.** The kbar search index (`public/search.json`) covers articles and image posts
  across both routes. Open it with `Cmd/Ctrl-K`.

Lists and homes are sorted newest-first by default.

## Per-route styling

The whole UI (header, content, footer) is wrapped by `RouteAccent`, a client component that derives
the active route from the pathname and applies a `data-route="official|casual"` attribute and a
`route-official` / `route-casual` class.

- **Accent color switches per route.** `.route-casual` remaps the `--color-primary-*` scale to
  `--color-secondary-*` in `css/tailwind.css`, so every `text-primary-*` / `border-primary-*` accent
  recolors from blue (official) to amber (casual) automatically — no per-component changes.
- **Route switches animate.** Clicking the header/mobile route toggle (`RouteSwitchLink`) fades the
  current body out (`@keyframes route-leave`) via `RouteTransitionProvider`, then navigates;
  `RouteTransition` (in `app/[route]/layout.tsx`) plays the slide/fade-in (`@keyframes route-enter`)
  for the incoming route.

## Home pages

Both routes share one index layout, `components/home/HomeLayout.tsx`: an author panel up top
(narrow left column = avatar / name / occupation / socials from `data/authors/default.mdx`; wider
right column = a route-specific intro plus an experiences list), then recent posts and photos below.
Route-specific copy lives in `routeMeta[route].homeIntro` (`data/routes.ts`) and
`experiences[route]` (`data/experiences.ts`) — both ship with placeholders to replace.

## Key files

- `data/routes.ts` — route list, labels/descriptions, `postsForRoute`, `otherRoute`, `routeFromPathname`.
- `data/headerNavLinks.ts` — `navLinks(route)` builder for the header/mobile nav.
- `contentlayer.config.ts` — `Blog` + `Photo` document types, per-route tag counts, search index.
- `app/[route]/…` — the dynamic route tree (home, blog, photos, tags).
- `components/home/HomeLayout.tsx` — the shared index layout for both routes.
- `components/RouteAccent.tsx` — applies the per-route accent class to the whole UI.
- `components/RouteTransitionProvider.tsx`, `components/RouteSwitchLink.tsx`, `components/home/RouteTransition.tsx` — route-switch exit/enter animation.
- `data/experiences.ts` — per-route experiences shown in the home author panel.
- `layouts/ListLayoutWithTags.tsx`, `ListLayoutPhotos.tsx`, `PhotoLayout.tsx` — list/detail layouts.
- `components/TagSidebar.tsx`, `Tag.tsx` — route-aware tag UI.

Site-wide settings (title, author, links, analytics, comments, search) live in `data/siteMetadata.js`.

## Develop

```bash
yarn install
yarn dev      # http://localhost:3000
yarn build    # contentlayer generate + production build + RSS
yarn serve    # serve the production build
```

Contentlayer regenerates `app/tag-data.json` and `public/search.json`. Because Next builds with
Turbopack (which ignores the `withContentlayer` webpack plugin), `yarn build` runs `contentlayer2 build`
explicitly first. If you hit a stale-cache error after restructuring routes, remove `.contentlayer`
and `.next` and rebuild.
