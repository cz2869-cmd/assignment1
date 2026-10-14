export const VIBES = [
  'Cozy',
  'Studying',
  'Friend hangout',
  'Quick coffee',
  'A treat',
  'Quiet corner',
] as const

export type Vibe = (typeof VIBES)[number]
