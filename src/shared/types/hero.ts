// Типы героя
export type HeroType = 'warrior' | 'mage' | 'rogue';

export interface IChar {
  id: string;
  name: string;
  level: number;
  isMainHero?: boolean;

  strength: number;
  agility: number;
  intelligence: number;
  type: HeroType;
  description: string;
  monthlySalary: number;
  injured: boolean; // Герой может быть травмирован
  injuredTimeout?: number; // Время, в течение которого герой не может участвовать в квестах из-за травмы
  recruitCost: number;
  traits: string[];
}

export interface IHero extends IChar {
  assignedQuestId?: string | null;
}

export interface IRecruitCandidate extends IChar {
  daysRemaining: number;
}
