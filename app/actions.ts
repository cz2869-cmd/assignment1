'use server'

import { cafeCopy, displayName, MOODS } from '@/lib/cafe-copy'
import { createClient } from '@/lib/server'
import type { ActionResult } from '@/lib/types'
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

export async function voteOnCaption(
  captionId: number,
  value: 1 | -1
): Promise<ActionResult> {
  const { supabase, user, error } = await requireUser()
  if (!user) {
    return { error: error ?? 'Sign in to rate captions.' }
  }

  const { data: caption, error: lookupError } = await supabase
    .from('captions')
    .select('id, cafe_id, caption_votes(value, user_id)')
    .eq('id', captionId)
    .single()

  if (lookupError || !caption) {
    return { error: lookupError?.message ?? 'Caption not found.' }
  }

  const existing =
    caption.caption_votes?.find(
      (vote: { user_id: string; value: number }) => vote.user_id === user.id
    )?.value ?? 0

  if (existing === value) {
    const { error: deleteError } = await supabase
      .from('caption_votes')
      .delete()
      .eq('caption_id', captionId)
      .eq('user_id', user.id)

    if (deleteError) {
      return { error: deleteError.message }
    }
  } else {
    const { error: upsertError } = await supabase.from('caption_votes').upsert(
      {
        caption_id: captionId,
        user_id: user.id,
        value,
      },
      { onConflict: 'caption_id,user_id' }
    )

    if (upsertError) {
      return { error: upsertError.message }
    }
  }

  refreshCafe(caption.cafe_id)
  return {}
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

export async function generateCaption(
  cafeId: number,
  moodId: string
): Promise<ActionResult> {
  const { supabase, user, error } = await requireUser()
  if (!user) {
    return { error: error ?? 'Sign in to generate a caption.' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      error:
        'Add a GEMINI_API_KEY to .env.local (Google AI Studio, free) to brew captions.',
    }
  }

  const { data: cafe, error: cafeError } = await supabase
    .from('cafe')
    .select('*')
    .eq('id', cafeId)
    .single()

  if (cafeError || !cafe) {
    return { error: cafeError?.message ?? 'Cafe not found.' }
  }

  const mood = MOODS.find((item) => item.id === moodId) ?? MOODS[0]
  const copy = cafeCopy(cafe.name, cafe)
  const prompt = [
    `Write one short social caption (1-2 sentences, no hashtags, no quotes) for ${displayName(cafe.name)} in ${copy.neighborhood}.`,
    `Cafe vibe: ${copy.vibe}. ${copy.description}`,
    `Write it in the voice of ${mood.hint}.`,
    'Keep it warm, specific, and a little witty. Do not mention that you are an AI.',
  ].join(' ')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 160,
        },
      }),
    }
  )

  if (!response.ok) {
    const details = await response.text()
    return { error: `Gemini could not generate a caption. ${details.slice(0, 180)}` }
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join(' ')
    .trim()

  if (!text) {
    return { error: 'Gemini returned an empty caption. Try another mood.' }
  }

  const { error: insertError } = await supabase.from('captions').insert({
    cafe_id: cafeId,
    user_id: user.id,
    prompt,
    generated_text: text,
  })

  if (insertError) {
    return { error: insertError.message }
  }

  refreshCafe(cafeId)
  return { text }
}
