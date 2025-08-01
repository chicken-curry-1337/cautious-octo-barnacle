// Типы героя
export type HeroType = 'warrior' | 'mage' | 'rogue';

export interface Hero {
  id: string;
  name: string;
  level: number;
  assignedQuestId: string | null;

  strength: number;
  agility: number;
  intelligence: number;
  type: HeroType;
  description: string;
  minStake: number;
}

export interface RecruitCandidate extends Hero {
  daysRemaining: number;
  recruitCost: number;
}
