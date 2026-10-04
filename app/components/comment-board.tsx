'use client'

import { addComment, voteOnComment } from '@/app/actions'
import { profileName, scoreVotes, userVote } from '@/lib/votes'
import type { Comment } from '@/lib/types'
import { useState } from 'react'
import VoteControls from './vote-controls'

type CommentBoardProps = {
  cafeId: number
  comments: Comment[]
  signedIn: boolean
  userId: string | null
}

export default function CommentBoard({
  cafeId,
  comments,
  signedIn,
  userId,
}: CommentBoardProps) {
  const [error, setError] = useState('')
  const sorted = [...comments].sort(
    (a, b) => scoreVotes(b.comment_votes) - scoreVotes(a.comment_votes)
  )

  async function submit(formData: FormData) {
    setError('')
    const result = await addComment(cafeId, formData)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <section className="panel">
      <div className="panelHeader">
        <h3>Table notes</h3>
        <p>What would you tell a floormate before they walk over?</p>
      </div>

      {signedIn ? (
        <form action={submit} className="commentForm">
          <textarea
            name="body"
            rows={3}
            maxLength={280}
            placeholder="The window seats go first. Bring headphones..."
            required
          />
          <button className="primaryButton" type="submit">
            Leave a note
          </button>
          {error ? <p className="inlineError">{error}</p> : null}
        </form>
      ) : (
        <p className="signInHint">Sign in with Google to comment on this cafe.</p>
      )}

      <ul className="stackList">
        {sorted.length === 0 ? (
          <li className="emptyState">Nobody has left a note yet. First sip is yours.</li>
        ) : (
          sorted.map((comment) => (
            <li className="stackItem" key={comment.id}>
              <VoteControls
                score={scoreVotes(comment.comment_votes)}
                userVote={userVote(comment.comment_votes, userId)}
                signedIn={signedIn}
                onVote={(value) => voteOnComment(comment.id, value)}
              />
              <div>
                <p className="stackBody">{comment.body}</p>
                <p className="stackMeta">{profileName(comment.profiles)}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
