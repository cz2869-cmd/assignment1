'use client'

import { useState, useTransition } from 'react'

type VoteControlsProps = {
  score: number
  userVote: number
  signedIn: boolean
  onVote: (value: 1 | -1) => Promise<{ error?: string } | void>
}

export default function VoteControls({
  score,
  userVote,
  signedIn,
  onVote,
}: VoteControlsProps) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  function vote(value: 1 | -1) {
    if (!signedIn) {
      setMessage('Sign in with Google to vote.')
      return
    }

    startTransition(async () => {
      const result = await onVote(value)
      setMessage(result?.error ?? '')
    })
  }

  return (
    <div className="voteControls">
      <button
        type="button"
        className={`voteButton${userVote === 1 ? ' voteButtonActive' : ''}`}
        onClick={() => vote(1)}
        disabled={pending}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="voteScore">{score}</span>
      <button
        type="button"
        className={`voteButton${userVote === -1 ? ' voteButtonDown' : ''}`}
        onClick={() => vote(-1)}
        disabled={pending}
        aria-label="Downvote"
      >
        ▼
      </button>
      {message ? <p className="inlineError">{message}</p> : null}
    </div>
  )
}
