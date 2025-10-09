export type GuildStatusType = 'buff' | 'debuff';

export type GuildStatus = {
  id: string;
  name: string;
  type: GuildStatusType;
  icon: string;
  description: string;
  durationDays: number;
  effects: Partial<{
    questSuccessChanceBonus: number;
    questRewardMultiplier: number;
    injuryChanceMultiplier: number;
    resourceGainMultiplier: number;
    moraleShift: number;
  }>;
};

export const GUILD_BUFFS: GuildStatus[] = [
  {
    id: 'blessing_of_city',
    name: 'Благословение города',
    type: 'buff',
    icon: '🏰',
    description: 'Горожане вдохновлены вашими действиями. Награды за задания растут.',
    durationDays: 3,
    effects: {
      questRewardMultiplier: 1.2,
      moraleShift: 5,
    },
  },
  {
    id: 'scout_insight',
    name: 'Глаз разведчика',
    type: 'buff',
    icon: '🦅',
    description: 'Разведчики делятся данными — задания проходят значительно легче.',
    durationDays: 2,
    effects: {
      questSuccessChanceBonus: 10,
    },
  },
  {
    id: 'healers_grace',
    name: 'Милость целителей',
    type: 'buff',
    icon: '💉',
    description: 'Целители работают не покладая рук: герои реже получают травмы.',
    durationDays: 4,
    effects: {
      injuryChanceMultiplier: 0.75,
    },
  },
];

export const GUILD_DEBUFFS: GuildStatus[] = [
  {
    id: 'supply_shortage',
    name: 'Нехватка припасов',
    type: 'debuff',
    icon: '🥖',
    description: 'Логистика дала трещину — награды за задания уменьшены.',
    durationDays: 3,
    effects: {
      questRewardMultiplier: 0.8,
      moraleShift: -5,
    },
  },
  {
    id: 'bad_press',
    name: 'Плохая пресса',
    type: 'debuff',
    icon: '📰',
    description: 'Газеты пишут о сомнительных методах гильдии. Задания даются сложнее.',
    durationDays: 2,
    effects: {
      questSuccessChanceBonus: -10,
    },
  },
  {
    id: 'overworked_healers',
    name: 'Переутомленные целители',
    type: 'debuff',
    icon: '😫',
    description: 'Целители еле стоят на ногах — шанс травм вырос.',
    durationDays: 4,
    effects: {
      injuryChanceMultiplier: 1.3,
    },
  },
];
