export const VISIT_COOLDOWN_MS = 24 * 60 * 60 * 1000

export function growthStage(visits: number) {
  if (visits <= 0) return 0
  if (visits === 1) return 1
  if (visits <= 3) return 2
  if (visits <= 6) return 3
  if (visits <= 10) return 4
  if (visits <= 15) return 5
  return 6
}

export function nextVisitAt(lastVisitedAt: string | null) {
  if (!lastVisitedAt) return null
  return new Date(new Date(lastVisitedAt).getTime() + VISIT_COOLDOWN_MS)
}

export function canCheckIn(lastVisitedAt: string | null, now = Date.now()) {
  const next = nextVisitAt(lastVisitedAt)
  if (!next) return true
  return next.getTime() <= now
}

export function hoursUntilCheckIn(lastVisitedAt: string | null, now = Date.now()) {
  const next = nextVisitAt(lastVisitedAt)
  if (!next) return 0
  const remaining = next.getTime() - now
  if (remaining <= 0) return 0
  return Math.max(1, Math.ceil(remaining / (60 * 60 * 1000)))
}
