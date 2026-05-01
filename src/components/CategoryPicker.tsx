import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DRAMA_CATEGORIES, DRAMA_POOL } from '../data/drama-articles'

interface Props {
  onChange: (cat: string) => void
  onPlay?: (cat: string) => void
}

const CATEGORY_I18N_KEY: Record<string, string> = {
  Politique:       'cat_Politique',
  Sport:           'cat_Sport',
  'Pop Culture':   'cat_PopCulture',
  Science:         'cat_Science',
  Histoire:        'cat_Histoire',
  Religion:        'cat_Religion',
  Tech:            'cat_Tech',
  'YouTubeurs FR': 'cat_YtFR',
  'YouTubeurs US': 'cat_YtUS',
}

const CATEGORY_HERO: Record<string, string> = {
  Politique:        'Donald Trump',
  Sport:            'Lance Armstrong',
  'Pop Culture':    'Michael Jackson',
  Science:          'Climate change',
  Histoire:         'Holocaust',
  Religion:         'Crusades',
  Tech:             'Elon Musk',
  'YouTubeurs FR':  'Norman Thavaud',
  'YouTubeurs US':  'Logan Paul',
}

const CATEGORY_HERO_LANG: Record<string, string> = {
  'YouTubeurs FR': 'fr',
}

type ThumbnailMap = Record<string, string | null>

function CategoryIcon({ category }: { category: string }) {
  const iconClass = "h-7 w-7 shrink-0 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"

  if (category === 'Politique') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <path d="M4 10h16" />
        <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
        <path d="M3 18h18M5 21h14" />
        <path d="M12 3 4 7h16z" />
      </svg>
    )
  }

  if (category === 'Sport') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <circle cx="12" cy="12" r="9" />
        <path d="m9.5 8.5 2.5-1.8 2.5 1.8-1 3h-3z" />
        <path d="m10.5 11.5-3 2.1M13.5 11.5l3 2.1M8.5 18l1-4M15.5 18l-1-4" />
      </svg>
    )
  }

  if (category === 'Pop Culture') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M4 8 6 3h12l2 5" />
        <path d="m8 3-2 5M13 3l-2 5M18 3l-2 5" />
        <path d="M9 14h6" />
      </svg>
    )
  }

  if (category === 'Science') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <path d="M10 4h4" />
        <path d="M11 4v5l-5.4 8.6A2.2 2.2 0 0 0 7.5 21h9a2.2 2.2 0 0 0 1.9-3.4L13 9V4" />
        <path d="M8 17h8" />
        <path d="M10 13h4" />
      </svg>
    )
  }

  if (category === 'Histoire') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <path d="M7 4h11a2 2 0 0 1 2 2v14H8a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2z" />
        <path d="M8 4v13a3 3 0 0 0 3 3" />
        <path d="M11 8h5M11 12h4" />
      </svg>
    )
  }

  if (category === 'Religion') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <path d="M12 3v18" />
        <path d="M7 8h10" />
        <path d="M6 21h12" />
      </svg>
    )
  }

  if (category === 'Tech') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <rect x="7" y="3" width="10" height="18" rx="2.2" />
        <path d="M10 6h4M11 18h2" />
      </svg>
    )
  }

  if (category === 'YouTubeurs FR' || category === 'YouTubeurs US') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
        <text x="12" y="22" textAnchor="middle" fill="currentColor" stroke="none" fontSize="5" fontWeight="800">
          {category === 'YouTubeurs FR' ? 'FR' : 'US'}
        </text>
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
      <path d="M12 4v16M4 12h16" />
    </svg>
  )
}

async function fetchThumbnail(title: string, lang = 'en'): Promise<string | null> {
  try {
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.thumbnail?.source ?? null
  } catch { return null }
}

export default function CategoryPicker({ onChange, onPlay }: Props) {
  const { t } = useTranslation()
  const [thumbnails, setThumbnails] = useState<ThumbnailMap>({})

  useEffect(() => {
    Promise.all(
      DRAMA_CATEGORIES.map(async (cat) => {
        const hero = CATEGORY_HERO[cat]
        const lang = CATEGORY_HERO_LANG[cat] ?? 'en'
        const url = hero ? await fetchThumbnail(hero, lang) : null
        return [cat, url] as [string, string | null]
      })
    ).then((entries) => setThumbnails(Object.fromEntries(entries)))
  }, [])

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-y-auto scrollbar-none px-0.5 py-0.5">
      {DRAMA_CATEGORIES.map((cat) => {
        const thumb        = thumbnails[cat]
        const articleCount = DRAMA_POOL[cat]?.length ?? 0
        const label        = CATEGORY_I18N_KEY[cat] ? t(CATEGORY_I18N_KEY[cat]) : cat

        return (
          <button
            key={cat}
            onClick={() => {
              onChange(cat)
              if (onPlay) onPlay(cat)
            }}
            className="relative w-full h-20 rounded-2xl text-left transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              {thumb ? (
                <img src={thumb} alt={cat} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-700 to-slate-800" />
              )}
              <div className="absolute inset-0 bg-black/55" />
            </div>

            <div className="relative z-10 flex items-center h-full px-5">
              <div className="flex items-center gap-3">
                <CategoryIcon category={cat} />
                <div>
                  <p className="text-white font-bold text-base leading-tight">{label}</p>
                  <p className="text-white/50 text-xs">{articleCount} {t('labelArticles')}</p>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
