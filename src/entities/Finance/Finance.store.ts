import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { GUILD_RESOURCES } from '../../assets/resources/resources';
import { TimeStore } from '../TimeStore/TimeStore';

@singleton()
export class GuildFinanceStore {
  gold: number = 1000; // начальный запас золота
  resources: Record<string, number> = {};
  loanBalance: number = 0;
  loanInterestPerDay: number = 0;
  emergencyLoanTaken: boolean = false;

  constructor(@inject(TimeStore) public timeStore: TimeStore) {
    makeAutoObservable(this);

    this.initializeResources();

    reaction(() => this.timeStore.monthName, (month) => {
      console.log(month);
    });

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
        this.applyDailyInterest();
      },
      { fireImmediately: false },
    );
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

  spendResources(cost: Record<string, number>) {
    if (!this.canAffordResources(cost)) return false;

    Object.entries(cost).forEach(([resourceId, amount]) => {
      this.spendResource(resourceId, amount);
    });

    return true;
  }

  canAffordGold(amount: number): boolean {
    return this.gold >= amount;
  }

  canAffordResource(type: string, amount: number): boolean {
    return (this.resources[type] ?? 0) >= amount;
  }

  canAffordResources(cost: Record<string, number>): boolean {
    return Object.entries(cost).every(([resourceId, amount]) => this.canAffordResource(resourceId, amount));
  }

  private initializeResources() {
    this.resources = GUILD_RESOURCES.reduce<Record<string, number>>((acc, resource) => {
      acc[resource.id] = resource.startingAmount ?? 0;

      return acc;
    }, {});
  }

  applyEmergencyLoan(amount: number, interestPerDay: number) {
    if (this.emergencyLoanTaken) return false;
    if (amount <= 0) return false;

    this.loanBalance = amount;
    this.loanInterestPerDay = interestPerDay;
    this.emergencyLoanTaken = true;
    this.addGold(amount);

    return true;
  }

  repayLoan(amount: number) {
    if (this.loanBalance <= 0) return true;
    const payment = Math.min(amount, this.gold, this.loanBalance);
    if (payment <= 0) return false;

    this.gold -= payment;
    this.loanBalance -= payment;

    if (this.loanBalance <= 0) {
      this.loanBalance = 0;
      this.loanInterestPerDay = 0;
      this.emergencyLoanTaken = false;
    }

    return true;
  }

  private applyDailyInterest() {
    if (this.loanBalance <= 0 || this.loanInterestPerDay <= 0) return;
    const interest = Math.max(0, this.loanBalance * this.loanInterestPerDay);
    this.loanBalance = Math.round(this.loanBalance + interest);
  }
}
