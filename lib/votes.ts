import type { ProfileSnippet, VoteRow } from './types'

export function scoreVotes(votes: VoteRow[] | null | undefined) {
  return (votes ?? []).reduce((sum, vote) => sum + vote.value, 0)
}

export function userVote(
  votes: VoteRow[] | null | undefined,
  userId: string | null
) {
  if (!userId) {
    return 0
  }

  return votes?.find((vote) => vote.user_id === userId)?.value ?? 0
}

export function profileName(
  profile: ProfileSnippet | ProfileSnippet[] | null | undefined
) {
  const row = Array.isArray(profile) ? profile[0] : profile
  const first = row?.first_name?.trim()
  const last = row?.last_name?.trim()

  if (first && last) {
    return `${first} ${last}`
  }

  return first || last || 'Campus regular'
}
