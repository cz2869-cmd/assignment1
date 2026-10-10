import { growthStage } from '@/lib/visits'

const PALETTES = [
  { pot: '#b08968', rim: '#9c6644', leafA: '#3f6f4e', leafB: '#6ea07a', bud: '#e8a0bf' },
  { pot: '#c4785a', rim: '#a45c42', leafA: '#4a7c59', leafB: '#5e8f6b', bud: '#e8a0bf' },
  { pot: '#d9a066', rim: '#b7791f', leafA: '#3f6f4e', leafB: '#4a7c59', bud: '#f2cc8f' },
  { pot: '#8b5e3c', rim: '#6b4423', leafA: '#4a7c59', leafB: '#6ea07a', bud: '#e07a5f' },
]

export function PlantPot({
  variant = 0,
  visits = 0,
}: {
  variant?: number
  visits?: number
}) {
  const palette = PALETTES[((variant % 4) + 4) % 4]
  const stage = growthStage(visits)
  const potTop = 36 + stage * 22
  const viewHeight = potTop + 38
  const stemTop = 18
  const leafCount = stage === 0 ? 1 : stage + 1

  const label =
    visits === 0
      ? 'A small sprout waiting for its first cafe visit'
      : `A plant grown taller by ${visits} cafe visit${visits === 1 ? '' : 's'}`

  return (
    <div className="plantFrame" role="img" aria-label={label}>
      <svg
        className="plant"
        viewBox={`0 0 90 ${viewHeight}`}
        aria-hidden="true"
      >
        <ellipse
          cx="45"
          cy={viewHeight - 8}
          rx="20"
          ry="6"
          fill="#c4a484"
          opacity="0.35"
        />
        <path
          d={`M24 ${potTop}h42l-6 26H30z`}
          fill={palette.pot}
        />
        <path d={`M24 ${potTop}h42v5H24z`} fill={palette.rim} />
        <path
          d={`M45 ${potTop} C40 ${potTop - (potTop - stemTop) / 2} 50 ${stemTop + 16} 45 ${stemTop}`}
          stroke={palette.leafA}
          strokeWidth={stage === 0 ? 2 : 3.5}
          fill="none"
          strokeLinecap="round"
        />
        {Array.from({ length: leafCount }, (_, index) => {
          const side = index % 2 === 0 ? -1 : 1
          const y = potTop - 8 - index * (stage === 0 ? 10 : 18)
          const reach = 12 + Math.min(index, 3) * 2
          const lift = 14 + Math.min(index, 2) * 2
          const fill = index % 2 === 0 ? palette.leafA : palette.leafB
          const tipX = 45 + side * reach
          const tipY = y - lift
          return (
            <path
              key={index}
              d={`M45 ${y} C${45 + side * 8} ${y - 4} ${tipX} ${tipY + 6} ${tipX} ${tipY} C${tipX - side * 6} ${tipY + 10} ${45 + side * 4} ${y + 2} 45 ${y}z`}
              fill={fill}
            />
          )
        })}
        {stage >= 4 ? (
          <g>
            <circle cx="45" cy={stemTop - 2} r="5.5" fill={palette.bud} />
            <circle cx="45" cy={stemTop - 2} r="2" fill="#fff6ea" />
          </g>
        ) : (
          <ellipse cx="45" cy={stemTop + 1} rx="3" ry="5" fill={palette.leafB} />
        )}
      </svg>
    </div>
  )
}
