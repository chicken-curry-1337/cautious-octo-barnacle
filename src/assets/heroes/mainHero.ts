import type { IHero } from '../../shared/types/hero';

export const MAIN_HERO_ID = 'hero_main_guildmaster';

export const mainHeroData: IHero = {
  id: MAIN_HERO_ID,
  name: 'Фин',
  description: 'Глава гильдии, который собрал вокруг себя первых соратников. Никогда не покидает гильдию.',
  type: 'warrior',
  level: 3,
  strength: 12,
  agility: 8,
  intelligence: 6,
  minStake: 0,
  injured: false,
  recruitCost: 0,
  traits: ['inspiring_leader'],
  assignedQuestId: null,
  isMainHero: true,
};
