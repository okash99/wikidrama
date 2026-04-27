import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DRAMA_CATEGORIES, DRAMA_POOL } from '../data/drama-articles'
import { E } from '../utils/emojis'

interface Props {
  selected: string
  onChange: (cat: string) => void
}

const CATEGORY_ICONS: Record<string, string> = {
  Politique:        E.catPolitique,
  Sport:            E.catSport,
  'Pop Culture':    E.catPopCulture,
  Science:          E.catScience,
  Histoire:         E.catHistoire,
  Religion:         E.catReligion,
  Tech:             E.catTech,
  'YouTubeurs FR':  E.catYtFR,
  'YouTubeurs US':  E.catYtUS,
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

export default function CategoryPicker({ selected, onChange }: Props) {
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
        const isSelected   = selected === cat
        const thumb        = thumbnails[cat]
        const articleCount = DRAMA_POOL[cat]?.length ?? 0
        const label        = CATEGORY_I18N_KEY[cat] ? t(CATEGORY_I18N_KEY[cat]) : cat

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
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              {thumb ? (
                <img src={thumb} alt={cat} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-700 to-slate-800" />
              )}
              <div className={`absolute inset-0 ${ isSelected ? 'bg-red-900/60' : 'bg-black/55' }`} />
            </div>

            <div className="relative z-10 flex items-center justify-between h-full px-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CATEGORY_ICONS[cat] || E.catDefault}</span>
                <div>
                  <p className="text-white font-bold text-base leading-tight">{label}</p>
                  <p className="text-white/50 text-xs">{articleCount} {t('labelArticles')}</p>
                </div>
              </div>
              {isSelected && (
                <span className="text-red-400 text-lg">{E.checkmark}</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
