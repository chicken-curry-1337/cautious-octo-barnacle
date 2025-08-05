// Типы героя
export type HeroType = 'warrior' | 'mage' | 'rogue';

export interface ICharacter {
  id: string;
  name: string;
  level: number;

  strength: number;
  agility: number;
  intelligence: number;
  type: HeroType;
  description: string;
  minStake: number;
  injured: boolean; // Герой может быть травмирован
  injuredTimeout?: number; // Время, в течение которого герой не может участвовать в квестах из-за травмы
  recruitCost: number;
}

export interface IHero extends ICharacter {
  assignedQuestId?: string | null;
}

export interface IRecruitCandidate extends ICharacter {
  daysRemaining: number;
}
