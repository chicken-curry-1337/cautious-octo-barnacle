export const modifiers = [
  {
    id: 'm_night',
    name: 'Ночь',
    description: 'Сумерки скрывают отряды — легче подкрасться, но можно недоглядеть опасность.',
    reveal_req: { scout: 3, upgrade: 'up_scouthub' },
    effects: {
      risk_delta: -1,
      reward_mult: 1.05,
      stat_bonuses: { stealth: 1 },
      rep: null,
    },
    weight: 3,
  },
  {
    id: 'm_bandit_activity',
    name: 'Активность бандитов',
    description: 'По округе ходят банды — платят больше, но вероятность засад растёт.',
    reveal_req: { scout: 4 },
    effects: {
      risk_delta: 1,
      reward_mult: 1.15,
      stat_bonuses: { ranged: -1 },
      rep: null,
    },
    weight: 2,
  },
  {
    id: 'm_patrols',
    name: 'Усиленные патрули',
    description: 'Стража начеку — больше риска провала и штраф к репутации при неудаче.',
    reveal_req: { scout: 5 },
    effects: {
      risk_delta: 2,
      reward_mult: 1.2,
      rep_on_fail: { guard: -1 },
    },
    weight: 1,
  },
  {
    id: 'm_poison_fog',
    name: 'Ядовитый туман',
    description: 'Отравленные испарения выматывают команды, но редкие ресурсы окупают риск.',
    reveal_req: { upgrade: 'up_lab' },
    effects: {
      risk_delta: 1,
      injury_mult: 1.3,
      reward_mult: 1.1,
    },
    weight: 1,
  },
];
