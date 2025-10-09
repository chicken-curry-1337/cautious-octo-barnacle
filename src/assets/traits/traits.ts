
export type TraitRarity = 'common' | 'rare' | 'unique';

export type Trait = {
  id: string;
  name: string;
  description: string;
  effects?: Record<string, number>;
  rarity: TraitRarity;
  synergyTags: string[];
  incompatibleWith?: string[];
};

export const traits: Trait[] = [
  {
    id: 'greedy',
    name: 'Жадный',
    description: 'Любит золото больше, чем славу — просит повышенные выплаты и старается урвать бонус.',
    effects: { salary_mult: 1.15, bonus_cut_mult: 1.1 },
    rarity: 'common',
    synergyTags: ['mercantile', 'selfish'],
    incompatibleWith: ['altruist'],
  },
  {
    id: 'altruist',
    name: 'Альтруист',
    description: 'Готов работать за идею, повышая мораль команды и снижая последствия провалов.',
    effects: { salary_mult: 0.9, morale_bonus: 1 },
    rarity: 'rare',
    synergyTags: ['support', 'altruist'],
    incompatibleWith: ['greedy'],
  },
  {
    id: 'workaholic',
    name: 'Трудоголик',
    description: 'Проводит в тренировочном зале больше времени, чем дома — быстрее восстанавливается после заданий.',
    effects: { fatigue_gain_mult: 1.25, cooldown_mult: 0.85 },
    rarity: 'common',
    synergyTags: ['discipline'],
  },
  {
    id: 'takes_blame',
    name: 'Берёт вину',
    description: 'Не сдаёт команду — прикрывает ошибки, но порой скрывает важные детали.',
    effects: { fail_rep_loss_mult: 0.8, shadow_gain_mult: 1.1 },
    rarity: 'common',
    synergyTags: ['loyal', 'support'],
  },
  {
    id: 'lucky',
    name: 'Фартовый',
    description: 'Всегда оказывается в нужном месте — повышает общий шанс успеха.',
    effects: { success_chance_bonus: 0.05 },
    rarity: 'rare',
    synergyTags: ['fortune'],
  },
  {
    id: 'glass_cannon',
    name: 'Стеклянная пушка',
    description: 'Бьёт сильно, но не любит держать удар — яркий стиль с риском получить травму.',
    effects: { strength_mult: 1.1, injury_chance_mult: 1.2 },
    rarity: 'common',
    synergyTags: ['burst'],
  },
  {
    id: 'veteran',
    name: 'Ветеран',
    description: 'Много видел, знает, чему учить — требует немного больше, зато быстрее растёт.',
    effects: { xp_gain_mult: 1.15, salary_mult: 1.05 },
    rarity: 'rare',
    synergyTags: ['mentor', 'discipline'],
  },
  {
    id: 'strategist',
    name: 'Стратег',
    description: 'Продумывает план до мелочей — улучшает подготовку и эффективность команды.',
    effects: { intelligence_mult: 1.1, planning_time_mult: 0.9 },
    rarity: 'rare',
    synergyTags: ['tactician', 'planner'],
  },
  {
    id: 'reckless',
    name: 'Безрассудный',
    description: 'Всегда готов рвануть вперёд — приносит больше наград, но поднимает риск.',
    effects: { risk_delta: 1, reward_mult: 1.05 },
    rarity: 'common',
    synergyTags: ['risk'],
    incompatibleWith: ['cautious_planner'],
  },
  {
    id: 'cautious_planner',
    name: 'Осторожный планировщик',
    description: 'Предпочитает продуманную подготовку и снижает риск ошибки.',
    effects: { risk_delta: -1 },
    rarity: 'rare',
    synergyTags: ['planner', 'discipline'],
    incompatibleWith: ['reckless'],
  },
  {
    id: 'charmer',
    name: 'Обаяшка',
    description: 'Легко заводит связи — помогает в переговорах и выторгует лучшую цену.',
    effects: { diplomacy_bonus: 1, recruit_cost_discount_mult: 0.9 },
    rarity: 'common',
    synergyTags: ['diplomat', 'morale'],
  },
  {
    id: 'night_owl',
    name: 'Ночная птица',
    description: 'Предпочитает действовать в темноте — приносит бонус скрытности ночью и штраф днём.',
    effects: { stealth_mult: 1.1, daytime_penalty: 0.1 },
    rarity: 'rare',
    synergyTags: ['shadow'],
  },
  {
    id: 'medic_training',
    name: 'Полевая медсестра',
    description: 'Знает, как перевязать рану на бегу — снижает риск травм и ускоряет восстановление.',
    effects: { injury_recovery_bonus: 1, injury_chance_mult: 0.9 },
    rarity: 'rare',
    synergyTags: ['healer', 'support'],
  },
  {
    id: 'empath',
    name: 'Эмпат',
    description: 'Считывает эмоции команды и успокаивает горячие головы.',
    rarity: 'rare',
    synergyTags: ['support', 'morale'],
  },
  {
    id: 'shadow_broker',
    name: 'Теневой посредник',
    description: 'Умеет добывать информацию и снижать риск провала операций в тени.',
    rarity: 'unique',
    synergyTags: ['shadow', 'intel'],
  },
  {
    id: 'inspiring_leader',
    name: 'Вдохновляющий лидер',
    description: 'Ведёт отряд, поднимая боевой дух и организуя слаженную работу.',
    rarity: 'unique',
    synergyTags: ['leader', 'morale'],
  },
  {
    id: 'arcane_savant',
    name: 'Арканный одарённый',
    description: 'Пропитывает миссии магической подготовкой и повышает точность планирования.',
    rarity: 'unique',
    synergyTags: ['tactician', 'magical'],
  },
];

export const traitMap: Record<string, Trait> = Object.fromEntries(
  traits.map(trait => [trait.id, trait]),
);

const rarityWeights: Record<TraitRarity, number> = {
  common: 6,
  rare: 3,
  unique: 1,
};

export function pickRandomTraitsForHero(maxTraits: number): string[] {
  const result: string[] = [];
  let uniqueTaken = 0;

  const canAdd = () => result.length < maxTraits;

  while (canAdd()) {
    const available = traits.filter(trait =>
      !result.includes(trait.id)
      && !(trait.incompatibleWith?.some(conflict => result.includes(conflict))),
    );

    if (available.length === 0) break;

    const filtered = available.filter(trait => trait.rarity !== 'unique' || uniqueTaken === 0);
    const pool = filtered.length > 0 ? filtered : available;

    const totalWeight = pool.reduce((sum, trait) => sum + rarityWeights[trait.rarity], 0);
    if (totalWeight <= 0) break;

    let roll = Math.random() * totalWeight;
    let selected = pool[0];

    for (const trait of pool) {
      roll -= rarityWeights[trait.rarity];
      if (roll <= 0) {
        selected = trait;
        break;
      }
    }

    result.push(selected.id);
    if (selected.rarity === 'unique') uniqueTaken = 1;
  }

  return result;
}

export function getTraitById(id: string): Trait | undefined {
  return traitMap[id];
}
