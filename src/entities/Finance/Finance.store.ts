import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { TimeStore } from '../TimeStore/TimeStore';

@singleton()
export class GuildFinanceStore {
  gold: number = 100; // начальный запас золота
  resources: Record<string, number> = {
    wood: 500,
    iron: 300,
    herbs: 150,
  };

  constructor(@inject(TimeStore) public timeStore: TimeStore) {
    makeAutoObservable(this);

    reaction(() => this.timeStore.monthName, (month) => {
      console.log(month);
    });
  }

  addGold(amount: number) {
    this.gold += amount;
  }

  spendGold(amount: number) {
    if (this.gold >= amount) {
      this.gold -= amount;

      return true;
    }

    return false;
  }

  addResource(type: string, amount: number) {
    if (!this.resources[type]) this.resources[type] = 0;
    this.resources[type] += amount;
  }

  spendResource(type: string, amount: number) {
    if ((this.resources[type] ?? 0) >= amount) {
      this.resources[type] -= amount;

      return true;
    }

    return false;
  }

  canAffordGold(amount: number): boolean {
    return this.gold >= amount;
  }

  canAffordResource(type: string, amount: number): boolean {
    return (this.resources[type] ?? 0) >= amount;
  }
}
