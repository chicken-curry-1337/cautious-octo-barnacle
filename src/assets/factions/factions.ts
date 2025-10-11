export type FactionId = 'guild' | 'guard' | 'cartel' | 'merchants' | 'citizens';

export type Faction = {
  id: FactionId;
  name: string;
  description: string;
  illegal?: boolean;
  baseWeight: number;
  minReputation: number;
  successRepDelta: number;
  failureRepDelta: number;
  successHeatDelta?: number;
  failureHeatDelta?: number;
  heatWeightPenalty?: number;
  heatWeightBonus?: number;
};

export const FACTIONS: Faction[] = [
  {
    id: 'guild',
    name: 'Совет гильдий',
    description: 'Ваша внутренняя репутация — чем она выше, тем больше доверия к вам в пределах гильдии.',
    baseWeight: 1.1,
    minReputation: -20,
    successRepDelta: 3,
    failureRepDelta: -4,
    successHeatDelta: -1,
  },
  {
    id: 'guard',
    name: 'Городская стража',
    description: 'Официальные патрули и законы. При высоком heat доверие падает.',
    baseWeight: 1,
    minReputation: -10,
    successRepDelta: 5,
    failureRepDelta: -7,
    successHeatDelta: -2,
    failureHeatDelta: 4,
    heatWeightPenalty: 0.015,
  },
  {
    id: 'merchants',
    name: 'Торговая лига',
    description: 'Коммерческие контракты, зависящие от надёжности и выгоды.',
    baseWeight: 1.2,
    minReputation: -5,
    successRepDelta: 4,
    failureRepDelta: -5,
    successHeatDelta: -1,
  },
  {
    id: 'cartel',
    name: 'Подпольный картель',
    description: 'Нелегальные сделки, растущее внимание стражи.',
    illegal: true,
    baseWeight: 0.9,
    minReputation: -40,
    successRepDelta: 3,
    failureRepDelta: -6,
    successHeatDelta: 4,
    failureHeatDelta: 6,
    heatWeightBonus: 0.02,
  },
  {
    id: 'citizens',
    name: 'Жители Равенфорда',
    description: 'Обычные горожане со своими мелкими проблемами — им нужна помощь и они быстро распространяют слухи.',
    baseWeight: 1.5,
    minReputation: -50,
    successRepDelta: 2,
    failureRepDelta: -2,
    successHeatDelta: -1,
    failureHeatDelta: 1,
  },
];

export const factionMap: Record<FactionId, Faction> = FACTIONS.reduce((acc, faction) => {
  acc[faction.id] = faction;

  return acc;
}, {} as Record<FactionId, Faction>);

export type ReputationState = Record<FactionId, number>;

export const pickFaction = (reputation: ReputationState, heat: number): Faction | null => {
  const weighted = FACTIONS.map((faction) => {
    const rep = reputation[faction.id] ?? 0;
    let weight = faction.baseWeight;

    weight += rep / 40; // положительная репутация — больше контрактов

    if (rep < faction.minReputation) {
      weight -= 100; // фактически блокируем контракты
    }

    if (faction.heatWeightPenalty && heat > 0) {
      weight -= heat * faction.heatWeightPenalty;
    }

    if (faction.heatWeightBonus && heat > 0) {
      weight += heat * faction.heatWeightBonus;
    }

    return { faction, weight };
  }).filter(entry => entry.weight > 0);

  if (weighted.length === 0) return null;

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.faction;
  }

  return weighted[weighted.length - 1].faction;
};
