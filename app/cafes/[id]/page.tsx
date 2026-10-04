import { cafeCopy, displayName } from '@/lib/cafe-copy'
import { createClient } from '@/lib/server'
import type { Cafe, Caption, Comment } from '@/lib/types'
import CaptionBoard from '@/app/components/caption-board'
import CommentBoard from '@/app/components/comment-board'
import { PlantPot } from '@/app/components/plant-pot'
import SiteHeader from '@/app/components/site-header'
import StarRater from '@/app/components/star-rater'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type CafePageProps = {
  params: Promise<{ id: string }>
}

export default async function CafePage({ params }: CafePageProps) {
  const { id } = await params
  const cafeId = Number(id)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: cafe } = await supabase
    .from('cafe')
    .select('*')
    .eq('id', cafeId)
    .single()

  if (!cafe) {
    notFound()
  }

  const typedCafe = cafe as Cafe
  const copy = cafeCopy(typedCafe.name, typedCafe)

  const { data: captions, error: captionError } = await supabase
    .from('captions')
    .select(
      'id, cafe_id, user_id, prompt, generated_text, created_at, profiles(first_name, last_name), caption_votes(value, user_id)'
    )
    .eq('cafe_id', cafeId)
    .order('created_at', { ascending: false })

  const { data: comments, error: commentError } = await supabase
    .from('comments')
    .select(
      'id, cafe_id, user_id, body, created_at, profiles(first_name, last_name), comment_votes(value, user_id)'
    )
    .eq('cafe_id', cafeId)
    .order('created_at', { ascending: false })

  const { data: ratings } = await supabase
    .from('cafe_ratings')
    .select('stars, user_id')
    .eq('cafe_id', cafeId)

  const communityAverage =
    ratings && ratings.length > 0
      ? ratings.reduce((sum, row) => sum + row.stars, 0) / ratings.length
      : Number(typedCafe.rating ?? 0)

  const userStars =
    ratings?.find((row) => row.user_id === user?.id)?.stars ?? 0

  const setupError = captionError || commentError

  return (
    <main className="page">
      <div className="container">
        <SiteHeader />
        <a className="textLink" href="/">
          ← All cafes
        </a>

        <section className="cafeHero">
          <PlantPot variant={typedCafe.id} />
          <div>
            <p className="cafeVibe">{copy.vibe}</p>
            <h1>{displayName(typedCafe.name)}</h1>
            <p className="subtitle">
              {copy.neighborhood} · ★ {communityAverage.toFixed(1)} from the
              floor
            </p>
            <p className="heroDescription">{copy.description}</p>
            <StarRater
              cafeId={typedCafe.id}
              signedIn={Boolean(user)}
              userStars={userStars}
            />
          </div>
        </section>

        {setupError ? (
          <p className="banner">
            Run <code>supabase/schema.sql</code> in the Supabase SQL editor so
            captions, comments, votes, and RLS can load.
          </p>
        ) : null}

        <div className="detailGrid">
          <CaptionBoard
            cafeId={typedCafe.id}
            captions={(captions ?? []) as Caption[]}
            signedIn={Boolean(user)}
            userId={user?.id ?? null}
          />
          <CommentBoard
            cafeId={typedCafe.id}
            comments={(comments ?? []) as Comment[]}
            signedIn={Boolean(user)}
            userId={user?.id ?? null}
          />
        </div>
      </div>
    </main>
  )
}
