import React from 'react';

export interface AvatarDefinition {
  id: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  glow: string;
}

export interface CustomBgTheme {
  id: string;
  bg: string;
  border: string;
  glow: string;
  colorClass: string; // Used for the palette circles
}

function DiceBearAvatar({ category, seed }: { category: string; seed: string }) {
  const [hasError, setHasError] = React.useState(false);
  const label = seed.slice(0, 2).toUpperCase();

  if (hasError) {
    return (
      <span className="flex h-full w-full items-center justify-center rounded-full bg-black/20 text-sm font-black tracking-wide text-current">
        {label}
      </span>
    );
  }

  return (
    <img
      src={`https://api.dicebear.com/9.x/${category}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`}
      alt={`Avatar ${category} ${seed}`}
      className="h-full w-full rounded-full object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export const CUSTOM_BG_THEMES: CustomBgTheme[] = [
  { id: 'default', bg: '', border: '', glow: '', colorClass: 'bg-zinc-800' },
  { id: 'zinc', bg: 'bg-zinc-400/30', border: 'border-zinc-400/50', glow: 'group-hover:shadow-[0_0_15px_rgba(161,161,170,0.5)]', colorClass: 'bg-zinc-400' },
  { id: 'amber', bg: 'bg-amber-500/20', border: 'border-amber-500/40', glow: 'group-hover:shadow-[0_0_15px_rgba(251,191,36,0.5)]', colorClass: 'bg-amber-500' },
  { id: 'cyan', bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', glow: 'group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]', colorClass: 'bg-cyan-500' },
  { id: 'purple', bg: 'bg-purple-500/20', border: 'border-purple-500/40', glow: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]', colorClass: 'bg-purple-500' },
  { id: 'rose', bg: 'bg-rose-500/20', border: 'border-rose-500/40', glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.5)]', colorClass: 'bg-rose-500' },
  { id: 'green', bg: 'bg-green-500/20', border: 'border-green-500/40', glow: 'group-hover:shadow-[0_0_15px_rgba(74,222,128,0.5)]', colorClass: 'bg-green-500' },
  { id: 'blue', bg: 'bg-blue-500/20', border: 'border-blue-500/40', glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]', colorClass: 'bg-blue-500' },
];

const RAW_AVATARS: AvatarDefinition[] = [
  {
    id: 'ghost',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
      </svg>
    ),
  },
  {
    id: 'cat',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(251,146,60,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/>
        <path d="M8 14v.5"/>
        <path d="M16 14v.5"/>
        <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>
      </svg>
    ),
  },
  {
    id: 'dog',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.7.28 1.53.514 2.383 1.14 4.145 4.846 7.617 9.04 7.617h.02c4.195 0 7.9-3.472 9.04-7.617.234-.853.434-1.683.514-2.383.113-.994-1.177-6.53-4-7-1.923-.321-3.5.782-3.5 2.172V6c0 1.1-1.12 2-2.5 2s-2.5-.9-2.5-2V5.172Z"/>
        <path d="M8 14v.5"/>
        <path d="M16 14v.5"/>
        <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>
      </svg>
    ),
  },
  {
    id: 'crown',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
      </svg>
    ),
  },
  {
    id: 'bot',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(45,212,191,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/>
        <rect width="16" height="12" x="4" y="8" rx="2"/>
        <path d="M2 14h2"/>
        <path d="M20 14h2"/>
        <path d="M15 13v2"/>
        <path d="M9 13v2"/>
      </svg>
    ),
  },
  {
    id: 'moon',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(129,140,248,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  }
];

const DICEBEAR_CATEGORIES = [
  { name: 'fun-emoji', seeds: ['WikiDrama', 'Gossip', 'Villain', 'Comet', 'Nova', 'Smile', 'Laugh', 'Cool', 'Wink', 'Love'], color: 'text-zinc-200', bg: 'bg-zinc-400/30', border: 'border-zinc-400/50', glow: 'group-hover:shadow-[0_0_15px_rgba(161,161,170,0.5)]' },
  { name: 'glass', seeds: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'], color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]' },
  { name: 'pixel-art', seeds: ['Hero', 'Mage', 'Rogue', 'Cleric', 'Bard', 'Paladin', 'Ranger', 'Monk', 'Druid', 'Warlock'], color: 'text-zinc-200', bg: 'bg-zinc-400/30', border: 'border-zinc-400/50', glow: 'group-hover:shadow-[0_0_15px_rgba(161,161,170,0.5)]' },
  { name: 'pixel-art-neutral', seeds: ['Rock', 'Paper', 'Tree', 'Cloud', 'Star', 'Moon', 'Sun', 'Rain', 'Snow', 'Wind'], color: 'text-zinc-200', bg: 'bg-zinc-400/30', border: 'border-zinc-400/50', glow: 'group-hover:shadow-[0_0_15px_rgba(161,161,170,0.5)]' },
  { name: 'thumbs', seeds: ['Jack', 'Jill', 'Bob', 'Alice', 'Eve', 'Charlie', 'Dave', 'Frank', 'Grace', 'Heidi'], color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
  { name: 'adventurer', seeds: ['Finn', 'Jake', 'Marceline', 'Bonnibel', 'Simon', 'BMO', 'LSP', 'Gunther', 'Peppermint', 'Cinnamon'], color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', glow: 'group-hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]' },
  { name: 'rings', seeds: ['Saturn', 'Jupiter', 'Mars', 'Venus', 'Pluto', 'Mercury', 'Earth', 'Uranus', 'Neptune', 'Ceres'], color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]' },
  { name: 'notionists', seeds: ['Write', 'Read', 'Think', 'Code', 'Design', 'Plan', 'Build', 'Test', 'Ship', 'Learn'], color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'group-hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]' },
  { name: 'notionists-neutral', seeds: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'], color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/40', glow: 'group-hover:shadow-[0_0_15px_rgba(148,163,184,0.3)]' },
];

const generatedAvatars: AvatarDefinition[] = [];

DICEBEAR_CATEGORIES.forEach(category => {
  category.seeds.forEach(seed => {
    generatedAvatars.push({
      id: `${category.name}_${seed.toLowerCase()}`,
      color: category.color,
      bg: category.bg,
      border: category.border,
      glow: category.glow,
      icon: <DiceBearAvatar category={category.name} seed={seed} />
    });
  });
});

export const AVATARS: AvatarDefinition[] = [
  ...RAW_AVATARS,
  ...generatedAvatars
];
