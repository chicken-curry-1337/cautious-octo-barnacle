export const traits = [
  {
    id: 'greedy',
    name: 'Жадный',
    effects: { salary_mult: 1.15, bonus_cut_mult: 1.1 },
    description: 'Любит золото больше, чем славу — просит повышенные выплаты и старается урвать бонус.',
  },
  {
    id: 'workaholic',
    name: 'Трудоголик',
    effects: { fatigue_gain_mult: 1.25, cooldown_mult: 0.85 },
    description: 'Проводит в тренировочном зале больше времени, чем дома — быстрее восстанавливается после заданий.',
  },
  {
    id: 'takes_blame',
    name: 'Берёт вину',
    effects: { fail_rep_loss_mult: 0.8, shadow_gain_mult: 1.1 },
    description: 'Не сдаёт команду — прикрывает ошибки, но порой скрывает важные детали.',
  },
  {
    id: 'lucky',
    name: 'Фартовый',
    effects: { success_chance_bonus: 0.05 },
    description: 'Всегда оказывается в нужном месте — повышает общий шанс успеха.',
  },
  {
    id: 'glass_cannon',
    name: 'Стеклянная пушка',
    effects: { strength_mult: 1.1, injury_chance_mult: 1.2 },
    description: 'Бьёт сильно, но не любит держать удар — яркий стиль с риском получить травму.',
  },
  {
    id: 'veteran',
    name: 'Ветеран',
    effects: { xp_gain_mult: 1.15, salary_mult: 1.05 },
    description: 'Много видел, знает, чему учить — требует немного больше, зато быстрее растёт.',
  },
  {
    id: 'strategist',
    name: 'Стратег',
    effects: { intelligence_mult: 1.1, planning_time_mult: 0.9 },
    description: 'Продумывает план до мелочей — улучшает подготовку и эффективность команды.',
  },
  {
    id: 'reckless',
    name: 'Безрассудный',
    effects: { risk_delta: 1, reward_mult: 1.05 },
    description: 'Всегда готов рвануть вперёд — приносит больше наград, но поднимает риск.',
  },
  {
    id: 'charmer',
    name: 'Обаяшка',
    effects: { diplomacy_bonus: 1, recruit_cost_discount_mult: 0.9 },
    description: 'Легко заводит связи — помогает в переговорах и выторгует лучшую цену.',
  },
  {
    id: 'night_owl',
    name: 'Ночная птица',
    effects: { stealth_mult: 1.1, daytime_penalty: 0.1 },
    description: 'Предпочитает действовать в темноте — приносит бонус скрытности ночью и штраф днём.',
  },
  {
    id: 'medic_training',
    name: 'Полевая медсестра',
    effects: { injury_recovery_bonus: 1, injury_chance_mult: 0.9 },
    description: 'Знает, как перевязать рану на бегу — снижает риск травм и ускоряет восстановление.',
  },
];
