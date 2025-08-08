export type TUpgrade = {
  id: string;
  name: string;
  icon: string;
  requires: string[];
  done: boolean;
  dependents: string[]; // <-- список апгрейдов, которые зависят от этого
};

export const UPGRADE_1_ID = '1';

export const GUILD_UPGRADES: TUpgrade[] = [
  {
    id: UPGRADE_1_ID,
    name: 'Доска объявлений',
    icon: '#',
    requires: [],
    dependents: ['1'],
    done: false,
  },
  {
    id: '2',
    name: 'Доска объявлений уровень 2',
    icon: '#',
    requires: ['1'],
    dependents: [],
    done: false,
  },
];
