import { makeObservable, observable } from 'mobx';

import type { HeroType, IHero } from '../../shared/types/hero';
import { Character } from '../Character/Character';

export class HeroStore extends Character implements IHero {
  assignedQuestId: string | null = null;

  constructor({
    assignedQuestId = null,
      ...args
  }: IHero) {
    super(args);
    this.assignedQuestId = assignedQuestId;

    makeObservable(this, {
      id: observable,
      name: observable,
      level: observable,
      strength: observable,
      agility: observable,
      intelligence: observable,
      type: observable,
      description: observable,
      minStake: observable,
      injured: observable,
      injuredTimeout: observable,
      recruitCost: observable,
      assignedQuestId: observable,
    });
  }

  increaseLevel = () => {
    this.assignedQuestId = null;
    this.level += 1;
    console.log('increase level');

    switch (this.type) {
      case 'warrior':
        this.strength += 3;
        this.agility += 1;
        this.intelligence += 1;
        break;
      case 'mage':
        this.strength += 1;
        this.agility += 1;
        this.intelligence += 3;
        break;
      case 'rogue':
        this.strength += 1;
        this.agility += 3;
        this.intelligence += 1;
        break;
    }

    this.minStake = this.calculateMinStake(this.level, this.type);
  };

  calculateMinStake = (level: number, type: HeroType): number => {
    const base = 10;
    const typeMultiplier = {
      warrior: 1.2,
      mage: 1.1,
      rogue: 1.3,
    };

    return Math.floor(base * level * (typeMultiplier[type] || 1));
  };

  setInjuredTimeout = ({
    injuredTimeout,
  }: Required<Pick<IHero, 'injuredTimeout'>>) => {
    this.injuredTimeout = injuredTimeout;

    if (injuredTimeout <= 0) {
      this.injured = false; // герой выздоравливает
      this.injuredTimeout = undefined; // сбрасываем таймаут
    }
  };
}
