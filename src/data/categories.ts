export type CategoryId =
  | 'politics'
  | 'sport'
  | 'pop-culture'
  | 'science'
  | 'history'
  | 'religion'
  | 'tech'
  | 'youtube-fr'
  | 'youtube-us'
  | 'countries'
  | 'video-games'
  | 'philosophy'
  | 'misc';

export interface DramaCategory {
  id: CategoryId;
  poolKey: string;
  i18nKey: string;
}

export const DRAMA_CATEGORY_DEFINITIONS: DramaCategory[] = [
  { id: 'politics', poolKey: 'Politique', i18nKey: 'cat_Politique' },
  { id: 'sport', poolKey: 'Sport', i18nKey: 'cat_Sport' },
  { id: 'pop-culture', poolKey: 'Pop Culture', i18nKey: 'cat_PopCulture' },
  { id: 'science', poolKey: 'Science', i18nKey: 'cat_Science' },
  { id: 'history', poolKey: 'Histoire', i18nKey: 'cat_Histoire' },
  { id: 'religion', poolKey: 'Religion', i18nKey: 'cat_Religion' },
  { id: 'tech', poolKey: 'Tech', i18nKey: 'cat_Tech' },
  { id: 'youtube-fr', poolKey: 'YouTubeurs FR', i18nKey: 'cat_YtFR' },
  { id: 'youtube-us', poolKey: 'YouTubeurs US', i18nKey: 'cat_YtUS' },
  { id: 'countries', poolKey: 'Pays', i18nKey: 'cat_Pays' },
  { id: 'video-games', poolKey: 'Jeux Vidéo', i18nKey: 'cat_JeuxVideo' },
  { id: 'philosophy', poolKey: 'Philosophy', i18nKey: 'cat_Philosophy' },
  { id: 'misc', poolKey: 'Divers', i18nKey: 'cat_Divers' },
];

const CATEGORY_LOOKUP = new Map<string, DramaCategory>();

DRAMA_CATEGORY_DEFINITIONS.forEach((category) => {
  CATEGORY_LOOKUP.set(category.id, category);
  CATEGORY_LOOKUP.set(category.poolKey, category);
});

const LEGACY_CATEGORY_ALIASES: Record<string, CategoryId> = {
  Politics: 'politics',
  History: 'history',
  Sport: 'sport',
  'Pop Culture': 'pop-culture',
  Science: 'science',
  Religion: 'religion',
  Tech: 'tech',
  Politique: 'politics',
  Histoire: 'history',
  'YouTubeurs FR': 'youtube-fr',
  'YouTubeurs US': 'youtube-us',
  Pays: 'countries',
  Country: 'countries',
  Countries: 'countries',
  'Jeux Vidéo': 'video-games',
  'Jeux Video': 'video-games',
  'Video Games': 'video-games',
  Philosophy: 'philosophy',
  Philosophie: 'philosophy',
  Divers: 'misc',
};

export function getCategoryDefinition(category: string): DramaCategory | undefined {
  return CATEGORY_LOOKUP.get(category) ?? CATEGORY_LOOKUP.get(LEGACY_CATEGORY_ALIASES[category]);
}

export function getCategoryId(category?: string): CategoryId | undefined {
  if (!category) return undefined;
  return getCategoryDefinition(category)?.id;
}

export function getCategoryPoolKey(category: string): string {
  return getCategoryDefinition(category)?.poolKey ?? category;
}

export function getCategoryI18nKey(category?: string): string | undefined {
  if (!category) return undefined;
  return getCategoryDefinition(category)?.i18nKey;
}
