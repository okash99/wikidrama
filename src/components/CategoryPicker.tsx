import { useEffect, useState } from 'react'
import { DRAMA_CATEGORIES, DRAMA_POOL } from '../data/drama-articles'

interface Props {
  selected: string
  onChange: (cat: string) => void
}

const CATEGORY_ICONS: Record<string, string> = {
  Politique:     '\uD83C\uDFD7\uFE0F',
  Sport:         '\u26BD',
  'Pop Culture': '\uD83C\uDFAC',
  Science:       '\uD83D\uDD2C',
  Histoire:      '\uD83D\uDCDC',
  Religion:      '\u26A0\uFE0F',
  Tech:          '\uD83D\uDCF1',
}

const CATEGORY_HERO: Record<string, string> = {
  Politique:     'Donald Trump',
  Sport:         'Lance Armstrong',
  'Pop Culture': 'Michael Jackson',
  Science:       'Climate change',
  Histoire:      'Holocaust',
  Religion:      'Crusades',
  Tech:          'Elon Musk',
}

type ThumbnailMap = Record<string, string | null>

async function fetchThumbnail(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.thumbnail?.source ?? null
  } catch { return null }
}

export default function CategoryPicker({ selected, onChange }: Props) {
  const [thumbnails, setThumbnails] = useState<ThumbnailMap>({})

  useEffect(() => {
    Promise.all(
      DRAMA_CATEGORIES.map(async (cat) => {
        const hero = CATEGORY_HERO[cat]
        const url = hero ? await fetchThumbnail(hero) : null
        return [cat, url] as [string, string | null]
      })
    ).then((entries) => setThumbnails(Object.fromEntries(entries)))
  }, [])

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-y-auto scrollbar-none px-0.5 py-0.5">
      {DRAMA_CATEGORIES.map((cat) => {
        const isSelected   = selected === cat
        const thumb        = thumbnails[cat]
        const articleCount = DRAMA_POOL[cat]?.length ?? 0

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`relative w-full h-20 rounded-2xl text-left transition-all active:scale-[0.98] ${
              isSelected
                ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20'
                : 'ring-0'
            }`}
          >
            {/* Image de fond — clippee par son propre rounded */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              {thumb ? (
                <img
                  src={thumb}
                  alt={cat}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-700 to-slate-800" />
              )}
              <div className={`absolute inset-0 ${ isSelected ? 'bg-red-900/60' : 'bg-black/55' }`} />
            </div>

            {/* Contenu */}
            <div className="relative z-10 flex items-center justify-between h-full px-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CATEGORY_ICONS[cat] || '\uD83D\uDCCC'}</span>
                <div>
                  <p className="text-white font-bold text-base leading-tight">{cat}</p>
                  <p className="text-white/50 text-xs">{articleCount} articles</p>
                </div>
              </div>
              {isSelected && (
                <span className="text-red-400 text-lg">\u2714\uFE0F</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
