'use server'

import { cafeCopy, displayName } from '@/lib/cafe-copy'
import { createClient } from '@/lib/server'
import type { ActionResult } from '@/lib/types'
import { canCheckIn } from '@/lib/visits'
import { VIBES } from '@/lib/vibes'
import { revalidatePath } from 'next/cache'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null as null, error: 'Sign in with Google to do that.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.from('profiles').insert({ id: user.id })
  }

  return { supabase, user, error: null }
}

function refreshCafe(cafeId: number) {
  revalidatePath('/')
  revalidatePath(`/cafes/${cafeId}`)
}

function readSuggestion(
  text: string,
  catalog: { id: number; name: string }[]
): ActionResult | null {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    return null
  }

  try {
    const parsed = JSON.parse(match[0]) as {
      id?: unknown
      cafeId?: unknown
      name?: unknown
      reason?: unknown
    }
    const rawId = parsed.id ?? parsed.cafeId
    const named =
      typeof parsed.name === 'string' ? parsed.name.trim().toLowerCase() : ''
    const cafe =
      catalog.find((item) => item.id === Number(rawId)) ??
      catalog.find((item) => item.name.toLowerCase() === named)
    const reason = typeof parsed.reason === 'string' ? parsed.reason.trim() : ''
    if (!cafe || !reason) {
      return null
    }
    return { cafeId: cafe.id, text: reason }
  } catch {
    return null
  }
}

export async function suggestCafe(
  vibes: string[],
  note: string
): Promise<ActionResult> {
  const chosen = VIBES.filter((vibe) => vibes.includes(vibe))
  const request = note.trim().slice(0, 240)

  if (chosen.length === 0 && request.length === 0) {
    return { error: 'Pick a vibe, or tell us what you are looking for.' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      error:
        'The Gemini key is missing on this server, so a cafe cannot be suggested yet.',
    }
  }

  const supabase = await createClient()
  const { data: cafes, error: cafeError } = await supabase
    .from('cafe')
    .select('id, name, description, neighborhood, vibe')

  if (cafeError || !cafes || cafes.length === 0) {
    return { error: cafeError?.message ?? 'No cafes to choose from.' }
  }

  const catalog = cafes.map((cafe) => {
    const copy = cafeCopy(cafe.name, cafe)
    return {
      id: cafe.id as number,
      name: displayName(cafe.name),
      vibe: copy.vibe,
      address: copy.address,
      description: copy.description,
    }
  })

  const prompt = [
    'Pick exactly one cafe for a Columbia student.',
    `Vibes they chose: ${chosen.length > 0 ? chosen.join(', ') : 'none'}.`,
    `What they wrote: ${request || 'nothing extra'}.`,
    'Cafes:',
    ...catalog.map(
      (cafe) =>
        `${cafe.id} | ${cafe.name} | ${cafe.vibe} | ${cafe.address} | ${cafe.description}`
    ),
    'Reply with JSON only: {"id": <one cafe id from the list>, "reason": "<one or two warm sentences explaining the pick>"}',
    'Do not invent a cafe. Do not mention that you are an AI.',
  ].join('\n')

  const models = ['gemini-3-flash-preview', 'gemini-3.8-flash']
  let lastStatus = 0
  let timedOut = false

  for (const model of models) {
    for (const generationConfig of [
      { maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
      { maxOutputTokens: 400 },
    ]) {
      let response: Response
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(20_000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig,
            }),
          }
        )
      } catch {
        timedOut = true
        break
      }

      if (response.status === 400) {
        continue
      }

      if (!response.ok) {
        lastStatus = response.status
        break
      }

      const payload = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[]
      }
      const text = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join(' ')
        .trim()
      const suggestion = readSuggestion(text ?? '', catalog)

      if (suggestion) {
        return suggestion
      }
      break
    }
  }

  if (timedOut || lastStatus === 503) {
    return { error: 'Gemini took too long to answer. Try again in a moment.' }
  }

  return { error: 'Could not suggest a cafe. Try again.' }
}

export async function voteOnComment(
  commentId: number,
  value: 1 | -1
): Promise<ActionResult> {
  const { supabase, user, error } = await requireUser()
  if (!user) {
    return { error: error ?? 'Sign in to rate comments.' }
  }

  const { data: comment, error: lookupError } = await supabase
    .from('comments')
    .select('id, cafe_id, comment_votes(value, user_id)')
    .eq('id', commentId)
    .single()

  if (lookupError || !comment) {
    return { error: lookupError?.message ?? 'Comment not found.' }
  }

  const existing =
    comment.comment_votes?.find(
      (vote: { user_id: string; value: number }) => vote.user_id === user.id
    )?.value ?? 0

  if (existing === value) {
    const { error: deleteError } = await supabase
      .from('comment_votes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)

    if (deleteError) {
      return { error: deleteError.message }
    }
  } else {
    const { error: upsertError } = await supabase.from('comment_votes').upsert(
      {
        comment_id: commentId,
        user_id: user.id,
        value,
      },
      { onConflict: 'comment_id,user_id' }
    )

    if (upsertError) {
      return { error: upsertError.message }
    }
  }

  refreshCafe(comment.cafe_id)
  return {}
}

export async function addComment(
  cafeId: number,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, error } = await requireUser()
  if (!user) {
    return { error: error ?? 'Sign in to comment.' }
  }

  const body = String(formData.get('body') ?? '').trim()
  if (!body) {
    return { error: 'Write a note first.' }
  }
  if (body.length > 280) {
    return { error: 'Keep it under 280 characters.' }
  }

  const { error: insertError } = await supabase.from('comments').insert({
    cafe_id: cafeId,
    user_id: user.id,
    body,
  })

  if (insertError) {
    return { error: insertError.message }
  }

  refreshCafe(cafeId)
  return {}
}

export async function rateCafe(
  cafeId: number,
  stars: number
): Promise<ActionResult> {
  const { supabase, user, error } = await requireUser()
  if (!user) {
    return { error: error ?? 'Sign in to rate cafes.' }
  }

  if (stars < 1 || stars > 5) {
    return { error: 'Pick a rating from 1 to 5.' }
  }

  const { error: upsertError } = await supabase.from('cafe_ratings').upsert(
    {
      cafe_id: cafeId,
      user_id: user.id,
      stars,
    },
    { onConflict: 'cafe_id,user_id' }
  )

  if (upsertError) {
    return { error: upsertError.message }
  }

  refreshCafe(cafeId)
  return {}
}

export async function checkInCafe(cafeId: number): Promise<ActionResult> {
  const { supabase, user, error } = await requireUser()
  if (!user) {
    return { error: error ?? 'Sign in with Google to log a visit.' }
  }

  const { data: latest, error: lookupError } = await supabase
    .from('cafe_visits')
    .select('visited_at')
    .eq('cafe_id', cafeId)
    .eq('user_id', user.id)
    .order('visited_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    return {
      error: lookupError.message.includes('cafe_visits')
        ? 'Run the cafe_visits section in supabase/schema.sql, then try again.'
        : lookupError.message,
    }
  }

  if (!canCheckIn(latest?.visited_at ?? null)) {
    return { error: 'You already logged this cafe in the last 24 hours.' }
  }

  const { error: insertError } = await supabase.from('cafe_visits').insert({
    cafe_id: cafeId,
    user_id: user.id,
  })

  if (insertError) {
    return {
      error: insertError.message.includes('cafe_visits')
        ? 'Run the cafe_visits section in supabase/schema.sql, then try again.'
        : insertError.message,
    }
  }

  refreshCafe(cafeId)
  return {}
}
