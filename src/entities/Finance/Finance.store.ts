import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { GUILD_RESOURCES } from '../../assets/resources/resources';
import { TimeStore } from '../TimeStore/TimeStore';
import { FinanceAnalyticsStore, type FinanceCategory } from '../../features/FinanceAnalytics/FinanceAnalytics.store';

@singleton()
export class GuildFinanceStore {
  gold: number = 1000; // начальный запас золота
  resources: Record<string, number> = {};
  loanBalance: number = 0;
  loanInterestPerDay: number = 0;
  emergencyLoanTaken: boolean = false;
  private syncing: boolean = false;

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(FinanceAnalyticsStore) private analyticsStore: FinanceAnalyticsStore,
  ) {
    makeAutoObservable(this);

    this.initializeResources();

    reaction(() => this.timeStore.monthName, (month) => {
      if (this.syncing) return;
      console.log(month);
    });

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
        if (this.syncing) return;
        this.applyDailyInterest();
      },
      { fireImmediately: false },
    );
  }

  addGold(amount: number, category: FinanceCategory = 'other') {
    const value = Math.max(0, Math.round(amount));
    if (value <= 0) return;

    this.gold += value;
    this.analyticsStore.recordIncome(category, value);
  }

  spendGold(amount: number, category: FinanceCategory = 'other') {
    const value = Math.max(0, Math.round(amount));
    if (value <= 0) return false;

    if (this.gold >= value) {
      this.gold -= value;
      this.analyticsStore.recordExpense(category, value);

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
    this.addGold(amount, 'loan_in');

    return true;
  }

  repayLoan(amount: number) {
    if (this.loanBalance <= 0) return true;
    const payment = Math.min(amount, this.gold, this.loanBalance);
    if (payment <= 0) return false;

    if (!this.spendGold(payment, 'loan_out')) return false;
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

  setSyncing = (value: boolean) => {
    this.syncing = value;
  };

  loadSnapshot = (snapshot: FinanceSnapshot) => {
    this.gold = snapshot.gold ?? this.gold;
    this.loanBalance = snapshot.loanBalance ?? 0;
    this.loanInterestPerDay = snapshot.loanInterestPerDay ?? 0;
    this.emergencyLoanTaken = snapshot.emergencyLoanTaken ?? false;

    const mergedResources: Record<string, number> = {};
    GUILD_RESOURCES.forEach((resource) => {
      const amount = snapshot.resources?.[resource.id];
      mergedResources[resource.id] = typeof amount === 'number'
        ? amount
        : resource.startingAmount ?? 0;
    });
    this.resources = mergedResources;
  };
}

export type FinanceSnapshot = {
  gold: number;
  resources: Record<string, number>;
  loanBalance: number;
  loanInterestPerDay: number;
  emergencyLoanTaken: boolean;
};
