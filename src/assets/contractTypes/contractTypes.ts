export const contractTypes = [
  {
    id: 'ct_guard',
    name: 'Охрана каравана',
    tags: ['legal', 'escort'],
    base: {
      duration_hours: { min: 6, max: 12 },
      base_reward: 90,
      base_risk: 2,
    },
    requirements: {
      roles: [
        { tag: 'melee', min: 2 },
        { tag: 'ranged', min: 2 },
      ],
      min_party: 2,
      max_party: 4,
    },
    effects: {
      on_success: { gold: '+reward', rep: { guard: 1 } },
      on_fail: { gold: -30, injury_chance: 0.35, rep: { guard: -1 } },
    },
    hidden_mod_pool: ['m_night', 'm_bandit_activity', 'm_poison_fog'],
    weights: { common: 6, rare: 0, illegal: 0 },
  },
  {
    id: 'ct_sabotage',
    name: 'Саботаж на складе',
    tags: ['illegal', 'stealth'],
    base: {
      duration_hours: { min: 3, max: 6 },
      base_reward: 140,
      base_risk: 3,
    },
    requirements: {
      roles: [
        { tag: 'stealth', min: 3 },
      ],
      min_party: 1,
      max_party: 2,
    },
    effects: {
      on_success: { gold: '+reward', rep: { cartel: 1 }, shadow: 1 },
      on_fail: { gold: -40, heat: 2, rep: { guard: -2 }, injury_chance: 0.5 },
    },
    hidden_mod_pool: ['m_night', 'm_patrols'],
    weights: { common: 2, rare: 1, illegal: 5 },
  },
];

export const contractTypesRewardFormula = {
  reward_mult_per_risk: 0.35,
  stat_to_risk_reduction: 0.25,
  hidden_mod_reward_bonus: 0.15,
};
