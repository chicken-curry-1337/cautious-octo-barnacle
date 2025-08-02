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
  injured: boolean; // Герой может быть травмирован
  inhuredTimeout?: number; // Время, в течение которого герой не может участвовать в квестах из-за травмы
  recruitCost: number;
}

export interface RecruitCandidate extends Hero {
  daysRemaining: number;
}
