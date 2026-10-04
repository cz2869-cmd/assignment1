import CafeCard from '@/app/components/cafe-card'
import SiteHeader from '@/app/components/site-header'
import { createClient } from '@/lib/server'
import type { Cafe } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: cafes, error } = await supabase.from('cafe').select('*')

  if (error) {
    return (
      <main className="page">
        <div className="container">
          <SiteHeader />
          <h1>Morningside Nook</h1>
          <p>Error loading cafes: {error.message}</p>
        </div>
      </main>
    )
  }

  const list = (cafes ?? []) as Cafe[]
  const day = Math.floor(Date.now() / 86_400_000)
  const featured = list.length > 0 ? list[day % list.length] : null
  const rest = list.filter((cafe) => cafe.id !== featured?.id)

  const { data: comments } = await supabase.from('comments').select('cafe_id')
  const { data: captions } = await supabase.from('captions').select('cafe_id')
  const { data: ratings } = await supabase
    .from('cafe_ratings')
    .select('cafe_id, stars')

  const commentCounts = countBy(comments ?? [])
  const captionCounts = countBy(captions ?? [])
  const ratingAverages = averageBy(ratings ?? [])

  return (
    <main className="page">
      <div className="container">
        <SiteHeader />

        <section className="hero">
          <p className="eyebrow">A daily table for Columbia students</p>
          <h1>Morningside Nook</h1>
          <p className="subtitle">
            Cozy campus cafes, AI-brewed captions, and a floor vote on what
            actually slaps. Come back tomorrow for a new study pick.
          </p>
        </section>

        {featured ? (
          <section className="featuredBlock">
            <p className="eyebrow">Today&apos;s study pick</p>
            <CafeCard
              cafe={featured}
              featured
              commentCount={commentCounts.get(featured.id) ?? 0}
              captionCount={captionCounts.get(featured.id) ?? 0}
              communityRating={
                ratingAverages.get(featured.id) ?? Number(featured.rating ?? 0)
              }
            />
          </section>
        ) : null}

        <div className="cafeList">
          {rest.map((cafe) => (
            <CafeCard
              key={cafe.id}
              cafe={cafe}
              commentCount={commentCounts.get(cafe.id) ?? 0}
              captionCount={captionCounts.get(cafe.id) ?? 0}
              communityRating={
                ratingAverages.get(cafe.id) ?? Number(cafe.rating ?? 0)
              }
            />
          ))}
        </div>
      </div>
    </main>
  )
}

function countBy(rows: { cafe_id: number }[]) {
  const map = new Map<number, number>()
  for (const row of rows) {
    map.set(row.cafe_id, (map.get(row.cafe_id) ?? 0) + 1)
  }
  return map
}

function averageBy(rows: { cafe_id: number; stars: number }[]) {
  const sums = new Map<number, { total: number; count: number }>()
  for (const row of rows) {
    const current = sums.get(row.cafe_id) ?? { total: 0, count: 0 }
    current.total += row.stars
    current.count += 1
    sums.set(row.cafe_id, current)
  }

  const averages = new Map<number, number>()
  for (const [id, value] of sums) {
    averages.set(id, value.total / value.count)
  }
  return averages
}
