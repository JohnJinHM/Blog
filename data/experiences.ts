import type { Route } from './routes'

export type Experience = {
  role: string
  org: string
  period: string
  highlights: string[]
}

export const experiences: Record<Route, Experience[]> = {
  official: [
    {
      role: 'Placeholder Role',
      org: 'Placeholder Company',
      period: '2024 — Present',
      highlights: [
        'Replace this with a real accomplishment or responsibility.',
        'Add a second highlight describing the impact you had.',
      ],
    },
    {
      role: 'Placeholder Role',
      org: 'Placeholder Organization',
      period: '2022 — 2024',
      highlights: ['Replace this with what you did and why it mattered.'],
    },
  ],
  casual: [
    {
      role: 'Placeholder Side Project',
      org: 'Personal',
      period: '2025',
      highlights: ['Replace this with a hobby, side project, or anything you tinker with.'],
    },
    {
      role: 'Placeholder Interest',
      org: 'Off the clock',
      period: 'Ongoing',
      highlights: ['Replace this with something you enjoy outside of work.'],
    },
  ],
}
