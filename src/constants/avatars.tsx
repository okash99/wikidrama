import React from 'react';

export interface AvatarDefinition {
  id: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  glow: string;
}

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
    id: 'alien',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c4 0 7 3 7 7 0 5-5 10-7 13-2-3-7-8-7-13 0-4 3-7 7-7z"/>
        <circle cx="9" cy="11" r="1"/>
        <circle cx="15" cy="11" r="1"/>
        <path d="M10 16h4"/>
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
    id: 'sword',
    color: 'text-slate-300',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(203,213,225,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 17.5 3 6V3h3l11.5 11.5"/>
        <path d="M13 19l6-6"/>
        <path d="M16 16l4 4"/>
        <path d="M19 21l2-2"/>
      </svg>
    ),
  },
  {
    id: 'zap',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    id: 'bird',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    glow: 'group-hover:shadow-[0_0_15px_rgba(244,114,182,0.4)]',
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20M15 19l2 2M18 16l2 2"/>
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

const MULTIAVATAR_SEEDS = [
  'WikiDrama', 'DramaKing', 'DramaQueen', 'Gossip', 'Scandal',
  'Legend', 'Epic', 'Myth', 'Hero', 'Villain',
  'Alpha', 'Omega', 'Player1', 'Player2', 'Gamer',
  'Star', 'Moon', 'Sun', 'Comet', 'Nova'
];

const multiavatars: AvatarDefinition[] = MULTIAVATAR_SEEDS.map((seed) => ({
  id: `multi_${seed.toLowerCase()}`,
  color: 'text-white',
  bg: 'bg-zinc-500/40',
  border: 'border-zinc-500/60',
  glow: 'group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]',
  icon: <img src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`} alt={`Avatar ${seed}`} className="w-full h-full object-contain rounded-full" />
}));

export const AVATARS: AvatarDefinition[] = [
  ...RAW_AVATARS,
  ...multiavatars
];
