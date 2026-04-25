import { DRAMA_CATEGORIES } from '../data/drama-articles'

interface Props {
  selected: string
  onChange: (cat: string) => void
}

const CATEGORY_ICONS: Record<string, string> = {
  Politique:    '🏗️',
  Sport:        '⚽',
  'Pop Culture':'🎬',
  Science:      '🔬',
  Histoire:     '📜',
  Religion:     '⚠️',
  Tech:         '📱',
}

export default function CategoryPicker({ selected, onChange }: Props) {
  return (
    <div className="w-full">
      <p className="text-slate-400 text-sm mb-3">Choisis un thème :</p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DRAMA_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95
              ${
                selected === cat
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }
            `}
          >
            <span>{CATEGORY_ICONS[cat] || '📌'}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
