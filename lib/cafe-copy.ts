export type CafeCopy = {
  description: string
  neighborhood: string
  vibe: string
}

const COPY: Record<string, CafeCopy> = {
  'joes coffee': {
    description:
      'A Columbia staple for lattes between classes. Grab a window seat when you need to feel like a real New Yorker for twenty minutes.',
    neighborhood: 'Morningside Heights',
    vibe: 'Between-class fuel',
  },
  'blue bottle': {
    description:
      'Bright, precise, and a little extra — the kind of pour-over that makes a midwest transplant text their group chat about "the coffee here."',
    neighborhood: 'Morningside Heights',
    vibe: 'Clean and caffeinated',
  },
  maki: {
    description:
      'Matcha-forward and photogenic. Perfect when you want a treat that still looks like you have your life together.',
    neighborhood: 'Near campus',
    vibe: 'Soft and green',
  },
  'blue java cafe': {
    description:
      'Campus-close caffeine with enough table space to spread out a laptop, a problem set, and a pastry you swore you would not buy.',
    neighborhood: 'Morningside Heights',
    vibe: 'Laptop hours',
  },
  'kuro kuma': {
    description:
      'Dark, cozy, and a little mysterious — the weekend cafe when the dorm lounge is too loud and the city still feels new.',
    neighborhood: 'Near campus',
    vibe: 'Moody hideout',
  },
  'dear mama': {
    description:
      'Comfort food energy in cafe form. Come here when you miss home cooking but still want to people-watch on Broadway.',
    neighborhood: 'Morningside Heights',
    vibe: 'Homey and filling',
  },
  'sipsteria morningside': {
    description:
      'A Morningside sip spot for slow weekend walks. Bring a friend from the floor and pretend you have a regular order.',
    neighborhood: 'Morningside Heights',
    vibe: 'Weekend wander',
  },
  'the hungarian pastry shop': {
    description:
      'The legendary study cave. Overhear thesis panic, share a table, and stay until the light turns gold on Amsterdam.',
    neighborhood: 'Morningside Heights',
    vibe: 'Classic study haunt',
  },
  'cafe east': {
    description:
      'East-campus caffeine when you are done crossing campus in the wind. Quick, warm, and unfussy.',
    neighborhood: 'East of campus',
    vibe: 'No-frills warm-up',
  },
  'qahwah house': {
    description:
      'Yemeni coffee, cardamom, and a reason to leave the dorm without a five-hour study plan. A weekend ritual waiting to happen.',
    neighborhood: 'Near campus',
    vibe: 'Spiced and social',
  },
}

export function displayName(name: string) {
  return name
    .split(' ')
    .map((word) =>
      word.toLowerCase() === 'maki'
        ? 'MAKI'
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}

export function cafeCopy(
  name: string,
  cafe?: {
    description?: string | null
    neighborhood?: string | null
    vibe?: string | null
  }
): CafeCopy {
  const fallback = COPY[name.trim().toLowerCase()] ?? {
    description: 'A campus cafe worth lingering in. Pull up a chair and rate the vibe.',
    neighborhood: 'Near campus',
    vibe: 'Cozy corner',
  }

  return {
    description: cafe?.description?.trim() || fallback.description,
    neighborhood: cafe?.neighborhood?.trim() || fallback.neighborhood,
    vibe: cafe?.vibe?.trim() || fallback.vibe,
  }
}

export const MOODS = [
  {
    id: 'late-night',
    label: 'Late-night grind',
    hint: 'a Columbia student pulling a late study session after dining hall hours',
  },
  {
    id: 'weekend',
    label: 'Weekend explore',
    hint: 'a junior new to NYC wandering the neighborhood on a Saturday',
  },
  {
    id: 'homesick',
    label: 'Midwest homesick',
    hint: 'someone from the midwest who wants a cafe that feels a little like home',
  },
  {
    id: 'online',
    label: 'Chronically online',
    hint: 'a chronically online student writing the caption they would actually post',
  },
  {
    id: 'rain',
    label: 'Rainy Morningside',
    hint: 'a rainy afternoon when the dorm feels too small and the city feels huge',
  },
] as const
