'use client'

import { checkInCafe } from '@/app/actions'
import { canCheckIn, hoursUntilCheckIn } from '@/lib/visits'
import { useState, useTransition } from 'react'

type VisitButtonProps = {
  cafeId: number
  signedIn: boolean
  lastVisitedAt: string | null
}

export default function VisitButton({
  cafeId,
  signedIn,
  lastVisitedAt,
}: VisitButtonProps) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [override, setOverride] = useState<string | null>(null)
  const visitedAt =
    override && (!lastVisitedAt || override > lastVisitedAt)
      ? override
      : lastVisitedAt
  const ready = canCheckIn(visitedAt)
  const hoursLeft = hoursUntilCheckIn(visitedAt)

  function checkIn() {
    if (!signedIn) {
      setMessage('Sign in with Google to log a visit.')
      return
    }

    startTransition(async () => {
      const result = await checkInCafe(cafeId)
      if (result.error) {
        setMessage(result.error)
        return
      }
      setOverride(new Date().toISOString())
      setMessage('Logged. This plant just grew a little taller.')
    })
  }

  let label = 'I went today'
  if (!signedIn) {
    label = 'Sign in to log a visit'
  } else if (!ready) {
    label =
      hoursLeft <= 1
        ? 'Back in about an hour'
        : `Back in ${hoursLeft} hours`
  }

  return (
    <div className="visitControl">
      <button
        className={`primaryButton visitButton${pending ? ' visitButtonPending' : ''}`}
        type="button"
        onClick={checkIn}
        disabled={pending || (signedIn && !ready)}
      >
        {label}
      </button>
      {message ? <p className="inlineNote">{message}</p> : null}
    </div>
  )
}
