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

  if (!signedIn) {
    return (
      <div className="visitControl">
        <p className="visitPrompt">Sign in to log a visit</p>
      </div>
    )
  }

  function checkIn() {
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

  const label = ready
    ? 'I went today'
    : hoursLeft <= 1
      ? 'Back in about an hour'
      : `Back in ${hoursLeft} hours`

  return (
    <div className="visitControl">
      <button
        className={`primaryButton visitButton${pending ? ' visitButtonPending' : ''}`}
        type="button"
        onClick={checkIn}
        disabled={pending || !ready}
      >
        {label}
      </button>
      {message ? <p className="inlineNote">{message}</p> : null}
    </div>
  )
}
