'use client'

import { suggestCafe } from '@/app/actions'
import { displayName } from '@/lib/cafe-copy'
import { VIBES } from '@/lib/vibes'
import Link from 'next/link'
import { useState, useTransition } from 'react'

type VibeCafe = {
  id: number
  name: string
  address: string
  image?: string
}

type VibeFinderProps = {
  cafes: VibeCafe[]
}

export default function VibeFinder({ cafes }: VibeFinderProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [pick, setPick] = useState<{ cafeId: number; reason: string } | null>(
    null
  )
  const [skipped, setSkipped] = useState<number[]>([])
  const [asking, setAsking] = useState<'fresh' | 'another' | null>(null)
  const [pending, startTransition] = useTransition()

  function toggle(vibe: string) {
    setSelected((current) =>
      current.includes(vibe)
        ? current.filter((item) => item !== vibe)
        : [...current, vibe]
    )
  }

  function requestSuggestion(exclude: number[], kind: 'fresh' | 'another') {
    if (selected.length === 0 && note.trim().length === 0) {
      setMessage('Pick a vibe, or tell us what you are looking for.')
      setPick(null)
      setSkipped([])
      return
    }

    setMessage('')
    setAsking(kind)
    if (kind === 'fresh') {
      setPick(null)
      setSkipped([])
    }

    startTransition(async () => {
      const result = await suggestCafe(selected, note, exclude)
      setAsking(null)
      if (result.error || !result.cafeId || exclude.includes(result.cafeId)) {
        if (kind === 'fresh') {
          setPick(null)
        }
        setMessage(result.error ?? 'No cafe came back. Try again.')
        return
      }
      setSkipped(exclude)
      setPick({ cafeId: result.cafeId, reason: result.text ?? '' })
    })
  }

  const cafe = pick ? cafes.find((item) => item.id === pick.cafeId) : null

  return (
    <section className="vibeFinder">
      <p className="eyebrow">Need a nudge</p>
      <h2>Can&apos;t decide which cafe to visit?</h2>
      <p className="vibeLead">
        Tell us what vibe you&apos;re looking for. We&apos;ll suggest one table.
      </p>
      <div className="moodRow">
        {VIBES.map((vibe) => {
          const active = selected.includes(vibe)
          return (
            <button
              key={vibe}
              type="button"
              className={`moodChip${active ? ' moodChipActive' : ''}`}
              aria-pressed={active}
              onClick={() => toggle(vibe)}
            >
              {vibe}
            </button>
          )
        })}
      </div>
      <label className="vibeLabel" htmlFor="vibe-note">
        Or say it in your own words
      </label>
      <textarea
        id="vibe-note"
        className="vibeNote"
        maxLength={240}
        placeholder="A window seat, cardamom coffee, somewhere I can talk for an hour..."
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <button
        className="primaryButton"
        type="button"
        onClick={() => requestSuggestion([], 'fresh')}
        disabled={pending}
      >
        {asking === 'fresh' ? 'Looking...' : 'Suggest a cafe'}
      </button>
      {message ? <p className="inlineError">{message}</p> : null}
      {cafe && pick ? (
        <div className="vibeResult">
          {cafe.image ? (
            <img src={cafe.image} alt="" />
          ) : (
            <div className="vibeResultPhoto" />
          )}
          <div>
            <p className="eyebrow">Your table</p>
            <h3>{displayName(cafe.name)}</h3>
            <p className="cafeAddress">{cafe.address}</p>
            {pick.reason ? <p className="vibeReason">{pick.reason}</p> : null}
            <p className="vibePrompt">How does this one sound?</p>
            <div className="vibeActions">
              <Link className="primaryButton" href={`/cafes/${cafe.id}`}>
                Bring me there
              </Link>
              <button
                className="ghostButton"
                type="button"
                onClick={() =>
                  requestSuggestion([...skipped, pick.cafeId], 'another')
                }
                disabled={pending}
              >
                {asking === 'another' ? 'Looking...' : 'Not this one'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
