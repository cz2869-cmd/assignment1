'use client'

import { generateCaption, voteOnCaption } from '@/app/actions'
import { MOODS } from '@/lib/cafe-copy'
import { profileName, scoreVotes, userVote } from '@/lib/votes'
import type { Caption } from '@/lib/types'
import { useState, useTransition } from 'react'
import VoteControls from './vote-controls'

type CaptionBoardProps = {
  cafeId: number
  captions: Caption[]
  signedIn: boolean
  userId: string | null
}

export default function CaptionBoard({
  cafeId,
  captions,
  signedIn,
  userId,
}: CaptionBoardProps) {
  const [mood, setMood] = useState<(typeof MOODS)[number]['id']>(MOODS[0].id)
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  const sorted = [...captions].sort(
    (a, b) => scoreVotes(b.caption_votes) - scoreVotes(a.caption_votes)
  )

  function brew() {
    if (!signedIn) {
      setMessage('Sign in with Google to generate a caption.')
      return
    }

    setMessage('')
    startTransition(async () => {
      const result = await generateCaption(cafeId, mood)
      setMessage(result.error ?? 'Caption brewed and saved.')
    })
  }

  return (
    <section className="panel">
      <div className="panelHeader">
        <h3>AI captions</h3>
        <p>Brew a caption, save the prompt, and let the floor vote it up.</p>
      </div>

      <div className="moodRow">
        {MOODS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`moodChip${mood === item.id ? ' moodChipActive' : ''}`}
            onClick={() => setMood(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button
        className="primaryButton"
        type="button"
        onClick={brew}
        disabled={pending}
      >
        {pending ? 'Brewing...' : 'Generate caption'}
      </button>
      {message ? <p className="inlineNote">{message}</p> : null}

      <ul className="stackList">
        {sorted.length === 0 ? (
          <li className="emptyState">
            No captions yet. Generate one and start the ranking.
          </li>
        ) : (
          sorted.map((caption) => (
            <li className="stackItem" key={caption.id}>
              <VoteControls
                score={scoreVotes(caption.caption_votes)}
                userVote={userVote(caption.caption_votes, userId)}
                signedIn={signedIn}
                onVote={(value) => voteOnCaption(caption.id, value)}
              />
              <div>
                <p className="stackBody">{caption.generated_text}</p>
                <p className="stackMeta">{profileName(caption.profiles)}</p>
                <details className="promptDetails">
                  <summary>Prompt used</summary>
                  <p>{caption.prompt}</p>
                </details>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
