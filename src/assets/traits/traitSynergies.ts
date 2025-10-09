import { traitMap } from './traits';

export type PartySynergyResult = {
  successBonus: number;
  injuryMultiplier: number;
  notes: { id: string; text: string; type: 'bonus' | 'penalty' }[];
};

export type TraitSynergyRule = {
  id: string;
  name: string;
  description: string;
  requiredTraits?: string[];
  requiredTags?: string[];
  minCount?: number;
  successBonus?: number;
  injuryMultiplier?: number;
};

export const TRAIT_SYNERGIES: TraitSynergyRule[] = [
  {
    id: 'command_triangle',
    name: 'Командный треугольник',
    description: 'Лидер, стратег и поддержка слаженно работают, повышая шанс успеха.',
    requiredTags: ['leader', 'tactician', 'support'],
    successBonus: 8,
  },
  {
    id: 'healing_circle',
    name: 'Круг исцеления',
    description: 'Целитель и эмпат снижают риск серьёзных травм.',
    requiredTags: ['healer', 'morale'],
    injuryMultiplier: 0.85,
    successBonus: 3,
  },
  {
    id: 'shadow_network',
    name: 'Теневая сеть',
    description: 'Информаторы в тени повышают шансы на скрытые операции.',
    requiredTags: ['shadow', 'intel'],
    successBonus: 6,
  },
  {
    id: 'mentor_chain',
    name: 'Связка наставников',
    description: 'Ветеран и трудяга выжимают максимум из тренировок.',
    requiredTags: ['mentor', 'discipline'],
    successBonus: 5,
  },
  {
    id: 'reckless_lucky_combo',
    name: 'Слепой удачник',
    description: 'Безрассудный герой под защитой удачи.',
    requiredTraits: ['reckless', 'lucky'],
    successBonus: 4,
  },
  {
    id: 'night_strike',
    name: 'Ночной рейд',
    description: 'Отряд в тени действует слаженно и с меньшим риском.',
    requiredTags: ['shadow', 'night', 'burst'],
    successBonus: 7,
    injuryMultiplier: 0.9,
  },
  {
    id: 'economic_council',
    name: 'Совет присяжных купцов',
    description: 'Обаяние и деловая хватка увеличивают выгоду контрактов.',
    requiredTags: ['economy', 'diplomat'],
    successBonus: 3,
  },
  {
    id: 'vanguard_wall',
    name: 'Живая стена',
    description: 'Ветераны и медики работают в связке, снижая риск потерь.',
    requiredTags: ['vanguard', 'defense', 'healer'],
    injuryMultiplier: 0.82,
    successBonus: 4,
  },
  {
    id: 'arcane_gambit',
    name: 'Арканный гамбит',
    description: 'Магическая подготовка и тактика повышают шансы сложных операций.',
    requiredTraits: ['arcane_savant'],
    requiredTags: ['tactician'],
    successBonus: 6,
  },
  {
    id: 'discipline_chain',
    name: 'Цепь дисциплины',
    description: 'Наставники и трудяги выжимают максимум из тренировок и планирования.',
    requiredTags: ['discipline', 'grinder'],
    successBonus: 5,
  },
];

export const TRAIT_CONFLICTS: TraitSynergyRule[] = [
  {
    id: 'greed_vs_altruism',
    name: 'Разногласие ценностей',
    description: 'Жадный и альтруист спорят о распределении наград.',
    requiredTraits: ['greedy', 'altruist'],
    successBonus: -5,
  },
  {
    id: 'reckless_vs_cautious',
    name: 'Столкновение подходов',
    description: 'Безрассудный и осторожный планировщик тянут отряд в разные стороны.',
    requiredTraits: ['reckless', 'cautious_planner'],
    successBonus: -6,
    injuryMultiplier: 1.15,
  },
  {
    id: 'leader_rivalry',
    name: 'Соперничество лидеров',
    description: 'Два сильных лидера спорят, кто главнее.',
    requiredTags: ['leader'],
    minCount: 2,
    successBonus: -4,
  },
  {
    id: 'shadow_vs_leader',
    name: 'Тени и прожекторы',
    description: 'Теневая работа конфликтует с открытым руководством.',
    requiredTags: ['shadow', 'leader'],
    successBonus: -4,
  },
  {
    id: 'wildcard_vs_planner',
    name: 'Хаос против порядка',
    description: 'Импровизация мешает строгому плану операции.',
    requiredTags: ['wildcard', 'planner'],
    successBonus: -5,
    injuryMultiplier: 1.1,
  },
];

export const evaluatePartySynergy = (traitSets: string[][]): PartySynergyResult => {
  if (!traitSets.length) {
    return { successBonus: 0, injuryMultiplier: 1, notes: [] };
  }

  const traitCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  traitSets.forEach((set) => {
    set.forEach((traitId) => {
      traitCounts.set(traitId, (traitCounts.get(traitId) ?? 0) + 1);
      const trait = traitMap[traitId];
      trait?.synergyTags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });
  });

  let successBonus = 0;
  let injuryMultiplier = 1;
  const notes: { id: string; text: string; type: 'bonus' | 'penalty' }[] = [];

  const checkRule = (rule: TraitSynergyRule) => {
    if (rule.requiredTraits) {
      const ok = rule.requiredTraits.every(traitId => (traitCounts.get(traitId) ?? 0) > 0);
      if (!ok) return false;
    }
    if (rule.requiredTags) {
      const ok = rule.requiredTags.every(tag => (tagCounts.get(tag) ?? 0) >= (rule.minCount ?? 1));
      if (!ok) return false;
    }

    return true;
  };

  TRAIT_SYNERGIES.forEach((rule) => {
    if (!checkRule(rule)) return;
    if (rule.successBonus) successBonus += rule.successBonus;
    if (rule.injuryMultiplier) injuryMultiplier *= rule.injuryMultiplier;
    notes.push({ id: rule.id, text: `+ ${rule.name}: ${rule.description}`, type: 'bonus' });
  });

  TRAIT_CONFLICTS.forEach((rule) => {
    if (!checkRule(rule)) return;
    if (rule.successBonus) successBonus += rule.successBonus; // отрицательное значение
    if (rule.injuryMultiplier) injuryMultiplier *= rule.injuryMultiplier;
    notes.push({ id: rule.id, text: `− ${rule.name}: ${rule.description}`, type: 'penalty' });
  });

  return {
    successBonus,
    injuryMultiplier,
    notes,
  };
};
