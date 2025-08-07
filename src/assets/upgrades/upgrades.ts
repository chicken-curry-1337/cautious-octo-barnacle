export type TUpgrade = {
  id: string;
  name: string;
  icon: string;
  requires: string[];
  done: boolean;
  dependents: string[]; // <-- список апгрейдов, которые зависят от этого
};

export const GUILD_UPGRADES: TUpgrade[] = [
  {
    id: '1',
    name: 'Доска объявлений',
    icon: '#',
    requires: [],
    dependents: ['1'],
    done: true,
  },
  {
    id: '2',
    name: 'Доска объявлений уровень 2',
    icon: '#',
    requires: ['1'],
    dependents: [],
    done: true,
  },
];
