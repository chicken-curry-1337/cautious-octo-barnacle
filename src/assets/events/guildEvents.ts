export type GuildEventOption = {
  id: string;
  label: string;
  description?: string;
  resourceCost?: Record<string, number>;
  resourceReward?: Record<string, number>;
  statusId?: string;
};

export type GuildEvent = {
  id: string;
  title: string;
  description: string;
  minDay: number;
  baseChance: number; // вероятность в день (0-1)
  repeatable?: boolean;
  requiredResources?: Record<string, number>;
  options: GuildEventOption[];
};

export const GUILD_EVENTS: GuildEvent[] = [
  {
    id: 'village_supplies',
    title: 'Проблемы в пригородной деревне',
    description:
      'Староста соседней деревни просит помощи с продовольствием и стройматериалами. Гильдия может укрепить отношения, пожертвовав ресурсы.',
    minDay: 2,
    baseChance: 0.2,
    options: [
      {
        id: 'support',
        label: 'Выделить припасы и лес',
        description: 'Отправить часть запасов, чтобы укрепить доверие жителей.',
        resourceCost: { timber: 80, healing_herbs: 30 },
        statusId: 'blessing_of_city',
      },
      {
        id: 'decline',
        label: 'Отказать — ресурсов мало',
        description: 'Сосредоточиться на внутренних делах гильдии.',
        statusId: 'bad_press',
      },
    ],
  },
  {
    id: 'arcane_research',
    title: 'Запрос от Архива Арканы',
    description:
      'Архив магов просит предоставить аркана-прах и редкие трофеи для исследования порталов. Успех проектов принесёт выгоду гильдии.',
    minDay: 4,
    baseChance: 0.15,
    requiredResources: { guild_charter_fragment: 1 },
    options: [
      {
        id: 'fund_research',
        label: 'Вложиться в исследования',
        resourceCost: { arcane_dust: 40, monster_parts: 10 },
        statusId: 'scout_insight',
        resourceReward: { guild_renown: 10 },
      },
      {
        id: 'refuse_research',
        label: 'Отказать — слишком рискованно',
        statusId: 'supply_shortage',
      },
    ],
  },
  {
    id: 'city_patrol',
    title: 'Патрульные ищут поддержку',
    description:
      'Городская стража просит временно предоставить отряду артефакты и реликты, чтобы усилить барьеры. Можно помочь или сослаться на занятость.',
    minDay: 6,
    baseChance: 0.1,
    options: [
      {
        id: 'lend_artifacts',
        label: 'Одолжить артефакты',
        resourceCost: { ancient_relic: 1, sunstone: 1 },
        statusId: 'healers_grace',
      },
      {
        id: 'no_help',
        label: 'Отказать стражам',
        statusId: 'overworked_healers',
      },
    ],
  },
];
