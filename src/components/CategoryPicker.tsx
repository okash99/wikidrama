import { CATEGORIES } from '../api/wikipedia'

interface Props {
  selected: string
  onChange: (cat: string) => void
}

export default function CategoryPicker({ selected, onChange }: Props) {
  const categories = Object.keys(CATEGORIES)

  return (
    <div className="w-full">
      <p className="text-slate-400 text-sm mb-3">Choisis un thème :</p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95
              ${
                selected === cat
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
