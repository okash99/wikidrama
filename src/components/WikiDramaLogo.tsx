import { useEffect, useRef, useState } from 'react'

interface WikiDramaLogoProps {
  label: string
}

const missingPieces = [
  {
    id: 'crown-left',
    className: 'wikidrama-logo__piece--one',
    d: 'M36.5 14.4c2.8-3.6 8.5-4.4 12.2-1.8 1.4 1 1.6 2.7.6 4.2-1 1.4-.4 3.2 1.3 3.8 2.1.8 2.7 2.8 1.4 4.7-1.8 2.7-6.1 3.4-9.8 1.8-1.4-.6-2.8-.6-4.2-.1-3 .9-6.4-.2-7.8-2.5-1.8-3.1.8-6.9 6.3-10.1z',
  },
  {
    id: 'crown-center',
    className: 'wikidrama-logo__piece--two',
    d: 'M50.6 7.1c4.9-2.4 11.4-1.5 14.3 1.8 1.1 1.3.8 3.1-.7 4-1.6 1-1.3 3.3.5 4 2.2.8 2.9 2.8 1.6 4.8-1.9 2.8-7.2 3.3-11.4 1-1.4-.8-3-.8-4.4 0-2.4 1.4-5.4.4-6.7-2.2-1.7-3.5 1.1-10.4 6.8-13.4z',
  },
  {
    id: 'crown-right',
    className: 'wikidrama-logo__piece--three',
    d: 'M66.7 13.8c4.7-1.3 9.7.4 11.4 4 1.2 2.6-.1 5.5-2.9 6.7-1.4.6-1.9 1.9-1.4 3.2.8 1.9-.8 3.9-3.5 4.2-3.8.5-7.4-2.2-8-6-.4-2.5-1.7-3.6-4.1-3.3-2 .2-3.3-1.4-2.4-3.4 1-2.6 5.7-4.7 10.9-5.4z',
  },
  {
    id: 'side-left',
    className: 'wikidrama-logo__piece--four',
    d: 'M20.9 34.5c3.9-2.7 8.8-2.7 10.8.1 1 1.5.7 3.3-.8 4.5-1.3 1-.9 2.9.8 3.5 2.5.9 3 3.1.8 5.1-2.1 2-7.1 2.4-11.1.2-2.4-1.3-3.6-3.4-3.3-5.8.2-2.7 1.8-5.4 4.8-7.6z',
  },
]

const glyphs = [
  { id: 'w', value: 'W', x: 48, y: 34, size: 13, rotate: -3 },
  { id: 'omega', value: 'Ω', x: 35, y: 44, size: 10, rotate: 10 },
  { id: 'han', value: '文', x: 60, y: 45, size: 9, rotate: -9 },
  { id: 'ya', value: 'Я', x: 44, y: 56, size: 11, rotate: 5 },
  { id: 'alef', value: 'ا', x: 68, y: 58, size: 12, rotate: 13 },
  { id: 'ka', value: 'क', x: 31, y: 65, size: 9, rotate: -10 },
  { id: 'lambda', value: 'Λ', x: 52, y: 72, size: 10, rotate: 2 },
]

export default function WikiDramaLogo({ label }: WikiDramaLogoProps) {
  const [isDramatizing, setIsDramatizing] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  function triggerDrama() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    setIsDramatizing(false)

    window.requestAnimationFrame(() => {
      setIsDramatizing(true)
      timeoutRef.current = window.setTimeout(() => {
        setIsDramatizing(false)
        timeoutRef.current = null
      }, 1100)
    })
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={triggerDrama}
      className={`wikidrama-logo ${isDramatizing ? 'is-dramatizing' : ''}`}
    >
      <span className="wikidrama-logo__halo" />
      <svg
        aria-hidden="true"
        viewBox="0 0 96 96"
        className="wikidrama-logo__svg"
      >
        <defs>
          <radialGradient id="wikiDramaGlobeShade" cx="35%" cy="25%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="28%" stopColor="#e7e7e7" />
            <stop offset="66%" stopColor="#a7a7a7" />
            <stop offset="100%" stopColor="#545454" />
          </radialGradient>
          <linearGradient id="wikiDramaRedPiece" x1="20" y1="4" x2="78" y2="78">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="45%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
          <clipPath id="wikiDramaGlobeClip">
            <circle cx="48" cy="50" r="35.8" />
          </clipPath>
          <mask id="wikiDramaGlobeCutouts" maskUnits="userSpaceOnUse">
            <rect width="96" height="96" fill="black" />
            <circle cx="48" cy="50" r="35.8" fill="white" />
            {missingPieces.map((piece) => (
              <path key={piece.id} d={piece.d} fill="black" />
            ))}
          </mask>
        </defs>

        <ellipse className="wikidrama-logo__ground-shadow" cx="48" cy="84" rx="25" ry="5" />

        <g className="wikidrama-logo__wiki-globe" mask="url(#wikiDramaGlobeCutouts)">
          <circle className="wikidrama-logo__globe-surface" cx="48" cy="50" r="35.8" />
          <path className="wikidrama-logo__globe-highlight" d="M26 32c5.5-9.1 16.4-14.8 29.4-13.7 7.2.6 12.9 3.2 16.9 6.7-9.1-3.7-19.3-3-29.4 1.2-7.3 3-12.8 7-16.9 5.8z" />

          <g className="wikidrama-logo__puzzle-lines" clipPath="url(#wikiDramaGlobeClip)">
            <path d="M20 39c8.5 2.8 16.5 4.2 28 4.2 11.9 0 20.8-1.8 29-5.5" />
            <path d="M17 54.5c8.6-1.5 19-1.1 31 .8 11.5 1.8 21.6 1.3 31-2.4" />
            <path d="M23 69c7.3-2.8 15-3.5 24.9-1.9 9.7 1.6 17.9 1 24.8-2.4" />
            <path d="M36 18c-5 9.4-7.4 20.8-7.3 33.2.1 12.1 2.6 23.1 8.4 31.2" />
            <path d="M57.8 15.8c4.5 11 6.5 22.7 5.9 35.2-.6 11.9-3.3 22.4-8.4 31.2" />
            <path d="M47.8 16.4c-1.9 7.9-2.5 17.8-1.9 29.7.5 12.1.1 24.3-1.5 36.5" />
          </g>

          <g className="wikidrama-logo__glyphs" clipPath="url(#wikiDramaGlobeClip)">
            {glyphs.map((glyph) => (
              <text
                key={glyph.id}
                className="wikidrama-logo__glyph"
                x={glyph.x}
                y={glyph.y}
                fontSize={glyph.size}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${glyph.rotate} ${glyph.x} ${glyph.y})`}
              >
                {glyph.value}
              </text>
            ))}
          </g>
        </g>

        <g className="wikidrama-logo__missing-pieces">
          {missingPieces.map((piece) => (
            <path
              key={piece.id}
              className={`wikidrama-logo__piece ${piece.className}`}
              d={piece.d}
            />
          ))}
        </g>

        <circle className="wikidrama-logo__rim" cx="48" cy="50" r="35.8" />
        <path className="wikidrama-logo__flash" d="M22 24 16 17M76 21l7-8M81 67l9 3M16 68l-8 7" />
      </svg>
    </button>
  )
}
