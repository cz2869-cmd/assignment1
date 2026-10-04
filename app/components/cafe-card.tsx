import { cafeCopy, displayName } from '@/lib/cafe-copy'
import type { Cafe } from '@/lib/types'
import { PlantPot } from './plant-pot'

type CafeCardProps = {
  cafe: Cafe
  featured?: boolean
  commentCount?: number
  captionCount?: number
  communityRating?: number | null
}

export default function CafeCard({
  cafe,
  featured = false,
  commentCount = 0,
  captionCount = 0,
  communityRating,
}: CafeCardProps) {
  const copy = cafeCopy(cafe.name, cafe)
  const stars = communityRating ?? Number(cafe.rating ?? 0)

  return (
    <a
      className={`cafeCard${featured ? ' cafeCardFeatured' : ''}`}
      href={`/cafes/${cafe.id}`}
    >
      <div className="cafeCardTop">
        <PlantPot variant={cafe.id} />
        <div>
          <p className="cafeVibe">{copy.vibe}</p>
          <h2>{displayName(cafe.name)}</h2>
          <p className="cafeNeighborhood">{copy.neighborhood}</p>
        </div>
        <p className="rating">★ {stars.toFixed(1)}</p>
      </div>
      <p className="cafeDescription">{copy.description}</p>
      <div className="cafeMeta">
        <span>{captionCount} AI captions</span>
        <span>{commentCount} notes</span>
        <span className="cafeCta">Open table →</span>
      </div>
    </a>
  )
}
