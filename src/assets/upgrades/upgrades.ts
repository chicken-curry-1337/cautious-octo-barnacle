export type TUpgrade = {
  id: string;
  name: string;
  icon: string;
  requires: string[];
  done: boolean;
  dependents: string[]; // <-- список апгрейдов, которые зависят от этого
  cost: number;
  effects: Record<string, number | boolean>;
  tags?: string[];
  resourceCost?: Record<string, number>;
};

const PERCENT_KEYS = new Set([
  'reroll_discount',
  'fail_refund_mult',
  'salary_satisfaction_bonus',
  'fail_evidence_cleanup_chance',
  'injury_fail_protect_chance',
  'loan_interest_per_day',
  'prewarn_fail_chance',
]);

const MULTIPLIER_KEYS = new Set([
  'travel_time_mult',
  'legal_reward_mult',
  'illegal_reward_mult',
  'injury_days_mult',
  'injury_chance_mult',
  'heat_decay_mult',
  'recruit_quality_mult',
  'xp_gain_mult',
  'rare_contract_chance_mult',
  'repair_cost_mult',
  'rep_gain_mult_guard',
  'bribe_cost_mult',
  'fail_rep_loss_mult_guard',
  'heat_on_fail_mult',
]);

const SIMPLE_NUMBER_KEYS = new Set([
  'contract_board_slots',
  'parallel_missions',
  'parallel_missions_bonus',
  'queue_missions',
  'gear_tier_bonus',
  'fatigue_recovery_per_day',
  'recruit_pool_slots',
  'party_size_max_bonus',
  'scout_bonus',
  'formation_bonus',
  'emergency_loan',
  'reroll_traits_token_daily',
  'new_hero_start_level',
]);

const passThroughKeys = new Map<string, string>([
  ['reveal_hidden', 'Раскрывает все скрытые требования и награды в заданиях'],
  ['board_enabled', 'Открывает доступ к доске заказов и базовым контрактам'],
]);

export const describeUpgradeEffects = (upgrade: TUpgrade): string[] => {
  const descriptions: string[] = [];

  Object.entries(upgrade.effects).forEach(([key, rawValue]) => {
    if (typeof rawValue === 'boolean') {
      if (rawValue) {
        const text = passThroughKeys.get(key) ?? `Активирует эффект: ${key}`;
        descriptions.push(text);
      }

      return;
    }

    const value = rawValue;

    if (SIMPLE_NUMBER_KEYS.has(key)) {
      switch (key) {
        case 'contract_board_slots':
          descriptions.push(`Располагает дополнительных контрактов: +${value}`);
          break;
        case 'parallel_missions':
          descriptions.push(`Отрядов, которые можно отправить одновременно: ${value}`);
          break;
        case 'parallel_missions_bonus':
          descriptions.push(`Дополнительных отрядов от управления: +${value}`);
          break;
        case 'queue_missions':
          descriptions.push(`Заданий в очереди на исполнение: +${value}`);
          break;
        case 'gear_tier_bonus':
          descriptions.push(`Повышение уровня экипировки и характеристик героев: +${value}`);
          break;
        case 'fatigue_recovery_per_day':
          descriptions.push(`Скорость восстановления героев: +${value} ед./день`);
          break;
        case 'recruit_pool_slots':
          descriptions.push(`Дополнительных кандидатов на рынке: +${value}`);
          break;
        case 'party_size_max_bonus':
          descriptions.push(`Максимальный размер боевого отряда: +${value}`);
          break;
        case 'scout_bonus':
          descriptions.push(`Бонус к шансу успеха миссий: +${value * 5}%`);
          break;
        case 'formation_bonus':
          descriptions.push(`Бонус строевых формирований: +${value * 3}%`);
          break;
        case 'emergency_loan':
          descriptions.push(`Открывает экстренный займ на ${value} золота`);
          break;
        case 'new_hero_start_level':
          descriptions.push(`Минимальный уровень новых героев: ${value}`);
          break;
        case 'reroll_traits_token_daily':
          descriptions.push(`Ежедневно выдаёт жетонов для смены черт: +${value}`);
          break;
        default:
          descriptions.push(`${key}: ${value}`);
      }

      return;
    }

    if (MULTIPLIER_KEYS.has(key)) {
      switch (key) {
        case 'travel_time_mult':
          descriptions.push(`Время выполнения заданий умножается на ×${value}`);
          break;
        case 'legal_reward_mult':
          descriptions.push(`Награды за легальные задания умножаются на ×${value}`);
          break;
        case 'illegal_reward_mult':
          descriptions.push(`Награды за нелегальные задания умножаются на ×${value}`);
          break;
        case 'injury_days_mult':
          descriptions.push(`Длительность травм умножается на ×${value}`);
          break;
        case 'injury_chance_mult':
          descriptions.push(`Шанс получить травму умножается на ×${value}`);
          break;
        case 'heat_decay_mult':
          descriptions.push(`Темп снижения внимания властей умножается на ×${value}`);
          break;
        case 'recruit_quality_mult':
          descriptions.push(`Качество рекрутов повышено в ×${value}`);
          break;
        case 'xp_gain_mult':
          descriptions.push(`Получаемый опыт героев умножается на ×${value}`);
          break;
        case 'rare_contract_chance_mult':
          descriptions.push(`Шанс получить редкие задания умножается на ×${value}`);
          break;
        case 'repair_cost_mult':
          descriptions.push(`Стоимость ремонта экипировки умножается на ×${value}`);
          break;
        case 'rep_gain_mult_guard':
          descriptions.push(`Прирост репутации у стражи умножается на ×${value}`);
          break;
        case 'bribe_cost_mult':
          descriptions.push(`Стоимость взяток умножается на ×${value}`);
          break;
        case 'fail_rep_loss_mult_guard':
          descriptions.push(`Потеря репутации у стражи при провале умножается на ×${value}`);
          break;
        case 'heat_on_fail_mult':
          descriptions.push(`Накопление внимания властей при провале умножается на ×${value}`);
          break;
        default:
          descriptions.push(`${key} умножается на ×${value}`);
      }

      return;
    }

    if (PERCENT_KEYS.has(key)) {
      switch (key) {
        case 'reroll_discount':
          descriptions.push(`Скидка на обновление списка заданий: ${Math.round(value * 100)}%`);
          break;
        case 'fail_refund_mult':
          descriptions.push(`Возврат награды при провале: ${Math.round(value * 100)}%`);
          break;
        case 'salary_satisfaction_bonus':
          descriptions.push(`Снижение минимальной ставки героев: ${Math.round(value * 100)}%`);
          break;
        case 'fail_evidence_cleanup_chance':
          descriptions.push(`Шанс замести следы после провала: ${Math.round(value * 100)}%`);
          break;
        case 'injury_fail_protect_chance':
          descriptions.push(`Шанс целителей спасти героя от травмы: ${Math.round(value * 100)}%`);
          break;
        case 'loan_interest_per_day':
          descriptions.push(`Процент по экстренному займу: ${Math.round(value * 100)}% в день`);
          break;
        case 'prewarn_fail_chance':
          descriptions.push(`Шанс предупредить отряд о провале: ${Math.round(value * 100)}%`);
          break;
        default:
          descriptions.push(`${key}: ${Math.round(value * 100)}%`);
      }

      return;
    }

    descriptions.push(`${key}: ${value}`);
  });

  return descriptions;
};

export const UPGRADE_1_ID = '1';

export const GUILD_UPGRADES: TUpgrade[] = [
  {
    id: UPGRADE_1_ID,
    name: 'Доска заказов',
    cost: 100,
    effects: { board_enabled: true },
    icon: '#',
    done: false,
    requires: [],
    dependents: [],
    resourceCost: {
      timber: 80,
      guild_renown: 5,
    },
  },
  {
    id: 'up_board_plus',
    name: 'Доска заказов+',
    icon: '#',
    done: false,
    cost: 120,
    effects: { contract_board_slots: 2 },
    requires: [UPGRADE_1_ID],
    dependents: ['up_board_plus_2'],
    tags: ['capacity', 'info'],
    resourceCost: {
      timber: 100,
      arcane_dust: 20,
    },
  },
  {
    id: 'up_board_plus_2',
    name: 'Большая доска заказов',
    icon: '#',
    done: false,
    cost: 220,
    effects: { contract_board_slots: 4, reroll_discount: 0.25 },
    requires: ['up_board_plus'],
    dependents: [],
    tags: ['capacity', 'economy'],
    resourceCost: {
      timber: 180,
      iron_ore: 120,
      city_favor_token: 1,
    },
  },
  {
    id: 'up_scouthub',
    name: 'Разведцентр',
    cost: 150,
    effects: {
      reveal_hidden: true,
      scout_bonus: 1,
    },
    icon: '#',
    done: false,
    requires: [],
    dependents: [],
    tags: ['info'],
    resourceCost: {
      timber: 90,
      healing_herbs: 40,
      monster_parts: 12,
    },
  },
  {
    id: 'up_insurance',
    name: 'Страховка контрактов',
    cost: 300,
    effects: {
      fail_refund_mult: 0.5,
    },
    requires: [],
    dependents: ['up_parallel'],
    done: false,
    icon: '#',
    tags: ['economy'],
    resourceCost: {
      guild_renown: 15,
      city_favor_token: 1,
    },
  },
  {
    id: 'up_parallel',
    name: 'Второй отряд',
    cost: 250,
    effects: {
      parallel_missions: 2,
    },
    icon: '#',
    done: false,
    requires: [],
    dependents: ['up_parallel_2'],
    tags: ['capacity'],
    resourceCost: {
      timber: 140,
      iron_ore: 100,
      healing_herbs: 30,
    },
  },
  {
    id: 'up_parallel_2',
    name: 'Третий отряд',
    cost: 450,
    effects: {
      parallel_missions: 3,
    },
    icon: '#',
    done: false,
    requires: ['up_parallel'],
    dependents: [],
    tags: ['capacity'],
    resourceCost: {
      timber: 220,
      iron_ore: 160,
      sunstone: 2,
    },
  },
  {
    id: 'up_dispatch',
    name: 'Диспетчерский стол',
    icon: '#',
    done: false,
    cost: 140,
    effects: { queue_missions: 1, parallel_missions_bonus: 1 },
    requires: [],
    dependents: ['up_dispatch_pro'],
    tags: ['capacity'],
    resourceCost: {
      timber: 110,
      arcane_dust: 25,
    },
  },
  {
    id: 'up_dispatch_pro',
    name: 'Диспетчерская служба',
    icon: '#',
    done: false,
    cost: 260,
    effects: { queue_missions: 2, travel_time_mult: 0.85 },
    requires: ['up_dispatch'],
    dependents: [],
    tags: ['capacity', 'logistics'],
    resourceCost: {
      timber: 160,
      arcane_dust: 40,
      city_favor_token: 1,
    },
  },
  {
    id: 'up_quarters',
    name: 'Жилые кварталы',
    icon: '#',
    done: false,
    cost: 150,
    effects: { fatigue_recovery_per_day: 1 },
    requires: [],
    dependents: ['up_quarters_lux'],
    tags: ['training', 'economy'],
  },
  {
    id: 'up_quarters_lux',
    name: 'Люкс-казармы',
    icon: '#',
    done: false,
    cost: 300,
    effects: { fatigue_recovery_per_day: 2, salary_satisfaction_bonus: 1 },
    requires: ['up_quarters'],
    dependents: [],
    tags: ['training'],
  },
  {
    id: 'up_medic',
    name: 'Лазарет',
    icon: '#',
    done: false,
    cost: 170,
    effects: { injury_days_mult: 0.8, injury_chance_mult: 0.9 },
    requires: [],
    dependents: ['up_medic_surgeon'],
    tags: ['ops', 'safety'],
  },
  {
    id: 'up_medic_surgeon',
    name: 'Хирург гильдии',
    icon: '#',
    done: false,
    cost: 320,
    effects: { injury_days_mult: 0.6, injury_fail_protect_chance: 0.35 },
    requires: ['up_medic'],
    dependents: [],
    tags: ['ops', 'safety'],
  },
  {
    id: 'up_workshop',
    name: 'Мастерская',
    icon: '#',
    done: false,
    cost: 160,
    effects: { gear_tier_bonus: 1, repair_cost_mult: 0.7 },
    requires: [],
    dependents: ['up_workshop_arcane'],
    tags: ['economy', 'ops'],
  },
  {
    id: 'up_workshop_arcane',
    name: 'Арканная мастерская',
    icon: '#',
    done: false,
    cost: 420,
    effects: { gear_tier_bonus: 2, rare_contract_chance_mult: 1.25 },
    requires: ['up_workshop'],
    dependents: [],
    tags: ['ops', 'rarity'],
  },
  {
    id: 'up_lobby',
    name: 'Связи в ратуше',
    icon: '#',
    done: false,
    cost: 130,
    effects: { legal_reward_mult: 1.1, rep_gain_mult_guard: 1.2 },
    requires: [],
    dependents: ['up_lobby_guild'],
    tags: ['factions', 'economy'],
  },
  {
    id: 'up_lobby_guild',
    name: 'Совет гильдий',
    icon: '#',
    done: false,
    cost: 260,
    effects: { legal_reward_mult: 1.15, heat_decay_mult: 1.2 },
    requires: ['up_lobby'],
    dependents: [],
    tags: ['factions', 'economy'],
  },
  {
    id: 'up_fence',
    name: 'Скупщик краденого',
    icon: '#',
    done: false,
    requires: [],
    cost: 150,
    effects: { illegal_reward_mult: 1.2, bribe_cost_mult: 0.9 },
    dependents: ['up_safehouse'],
    tags: ['shadow', 'economy'],
  },
  {
    id: 'up_safehouse',
    name: 'Явочная квартира',
    icon: '#',
    done: false,
    requires: ['up_fence'],
    cost: 280,
    effects: { heat_decay_mult: 1.4, fail_rep_loss_mult_guard: 0.8 },
    dependents: [],
    tags: ['shadow', 'safety'],
  },
  {
    id: 'up_whispernet',
    name: 'Шёпот-сеть информаторов',
    icon: '#',
    done: false,
    requires: [],
    cost: 240,
    effects: { reveal_hidden_count: 1, scout_bonus: 1 },
    dependents: ['up_whispernet_black'],
    tags: ['info'],
  },
  {
    id: 'up_whispernet_black',
    name: 'Чёрный шёпот',
    icon: '#',
    done: false,
    requires: ['up_whispernet'],
    cost: 380,
    effects: { reveal_hidden_count: 2, prewarn_fail_chance: 0.3 },
    dependents: [],
    tags: ['info', 'safety'],
  },
  {
    id: 'up_tactics',
    name: 'Тактический штаб',
    icon: '#',
    done: false,
    requires: [],
    cost: 260,
    effects: { party_size_max_bonus: 1, formation_bonus: 1 },
    dependents: [],
    tags: ['ops'],
  },
  {
    id: 'up_mentors',
    name: 'Наставники',
    icon: '#',
    done: false,
    requires: [],
    cost: 140,
    effects: { xp_gain_mult: 1.25, reroll_traits_token_daily: 1 },
    dependents: ['up_mentors_guildschool'],
    tags: ['training'],
  },
  {
    id: 'up_mentors_guildschool',
    name: 'Школа гильдии',
    icon: '#',
    done: false,
    requires: ['up_mentors'],
    cost: 420,
    effects: { xp_gain_mult: 1.5, new_hero_start_level: 2 },
    dependents: [],
    tags: ['training', 'capacity'],
  },
  {
    id: 'up_black_budget',
    name: 'Чёрная касса',
    icon: '#',
    done: false,
    requires: [],
    cost: 0,
    effects: { emergency_loan: 200, loan_interest_per_day: 0.03 },
    dependents: [],
    tags: ['economy', 'shadow'],
  },
  {
    id: 'up_cleaners',
    name: 'Чистильщики',
    icon: '#',
    done: false,
    requires: [],
    cost: 260,
    effects: { fail_evidence_cleanup_chance: 0.5, heat_on_fail_mult: 0.7 },
    dependents: [],
    tags: ['shadow', 'safety'],
  },
  {
    id: 'up_barracks',
    name: 'Гарнизонный двор',
    icon: '#',
    done: false,
    requires: [],
    dependents: ['up_barracks_elite'],
    cost: 130,
    effects: { recruit_pool_slots: 2, recruit_refresh_discount: 0.3 },
    tags: ['capacity', 'recruitment'],
  },
  {
    id: 'up_barracks_elite',
    name: 'Элитный набор',
    cost: 400,
    icon: '#',
    done: false,
    requires: ['up_barracks'],
    dependents: [],
    effects: { recruit_quality_mult: 1.25, recruit_pool_slots: 1 },
    tags: ['recruitment', 'rarity'],
  },
];
