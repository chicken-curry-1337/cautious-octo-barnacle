import type { ICharacter, HeroType } from '../../shared/types/hero';

export class Character implements ICharacter {
  id: string;
  name: string;
  level: number;
  assignedQuestId: string | null = null;

  strength: number;
  agility: number;
  intelligence: number;
  type: HeroType;
  description: string;
  minStake: number;
  injured: boolean; // Герой может быть травмирован
  injuredTimeout?: number; // Время, в течение которого герой не может участвовать в квестах из-за травмы
  recruitCost: number;

  constructor({
    id = crypto.randomUUID(),
    name,
    level = 1,
    strength,
    agility,
    intelligence,
    type,
    description,
    minStake,
    injured,
    injuredTimeout,
    recruitCost = 0,
  }: ICharacter) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.strength = strength;
    this.agility = agility;
    this.intelligence = intelligence;
    this.type = type;
    this.description = description;
    this.minStake = minStake;
    this.injured = injured;
    this.injuredTimeout = injuredTimeout;
    this.recruitCost = recruitCost;
  }

  generateStatsByType = (type: 'warrior' | 'mage' | 'rogue') => {
    switch (type) {
      case 'warrior':
        return {
          strength: this.randomInRange(7, 10),
          agility: this.randomInRange(3, 7),
          intelligence: this.randomInRange(1, 4),
        };
      case 'mage':
        return {
          strength: this.randomInRange(1, 4),
          agility: this.randomInRange(3, 6),
          intelligence: this.randomInRange(7, 10),
        };
      case 'rogue':
        return {
          strength: this.randomInRange(3, 6),
          agility: this.randomInRange(7, 10),
          intelligence: this.randomInRange(3, 6),
        };
    }
  };

  randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  randomInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
}
