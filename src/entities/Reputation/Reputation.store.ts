import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

@singleton()
export class ReputationStore {
  reputation: number = 100;

  constructor() {
    makeAutoObservable(this);
  }

  changeReputation = (amount: number) => {
    this.setReputation(this.reputation + amount);
  };

  setReputation = (newReputation: number) => {
    this.reputation = newReputation;
  };

  get isGood() {
    return this.reputation >= 100;
  }

  get isLawful() {
    return this.reputation <= 100 && this.reputation >= 0;
  }

  get isEvil() {
    return this.reputation < 0;
  }
}
