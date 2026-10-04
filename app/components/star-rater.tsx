'use client'

import { rateCafe } from '@/app/actions'
import { useState, useTransition } from 'react'

type StarRaterProps = {
  cafeId: number
  signedIn: boolean
  userStars: number
}

export default function StarRater({
  cafeId,
  signedIn,
  userStars,
}: StarRaterProps) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  function rate(stars: number) {
    if (!signedIn) {
      setMessage('Sign in with Google to leave a star rating.')
      return
    }

    startTransition(async () => {
      const result = await rateCafe(cafeId, stars)
      setMessage(result.error ?? 'Saved your rating.')
    })
  }

  return (
    <div className="starRater">
      <p>Your stars</p>
      <div className="starRow">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`starButton${userStars >= star ? ' starButtonOn' : ''}`}
            onClick={() => rate(star)}
            disabled={pending}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            ★
          </button>
        ))}
      </div>
      {message ? <p className="inlineNote">{message}</p> : null}
    </div>
  )
}
