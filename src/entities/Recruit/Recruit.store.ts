import { makeObservable, observable } from 'mobx';

import type { IRecruitCandidate } from '../../shared/types/hero';
import { Character } from '../Character/Character';

export class RecruitStore extends Character {
  daysRemaining: number;
  recruitCost: number;

  constructor({ ...args }: IRecruitCandidate) {
    super(args);

    this.recruitCost = args.recruitCost;
    this.daysRemaining = args.daysRemaining;

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
      daysRemaining: observable,
    });
  }

  decreaseRemainingDays = () => {
    this.daysRemaining--;
  };
}
