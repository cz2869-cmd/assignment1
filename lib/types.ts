export type Cafe = {
  id: number
  name: string
  rating: number | string | null
  description?: string | null
  neighborhood?: string | null
  vibe?: string | null
}

export type ProfileSnippet = {
  first_name: string | null
  last_name: string | null
  avatar_url?: string | null
}

export type VoteRow = {
  value: number
  user_id: string
}

export type Caption = {
  id: number
  cafe_id: number
  user_id: string
  prompt: string
  generated_text: string
  created_at: string
  profiles: ProfileSnippet | ProfileSnippet[] | null
  caption_votes: VoteRow[] | null
}

export type Comment = {
  id: number
  cafe_id: number
  user_id: string
  body: string
  created_at: string
  profiles: ProfileSnippet | ProfileSnippet[] | null
  comment_votes: VoteRow[] | null
}

export type ActionResult = {
  error?: string
  text?: string
}
