import { makeAutoObservable } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { type TUpgrade, GUILD_UPGRADES } from '../../assets/upgrades/upgrades';
import { GuildFinanceStore } from '../Finance/Finance.store';

@singleton()
export class UpgradeStore {
  upgradeMap: Record<string, TUpgrade> = {};

  constructor(@inject(GuildFinanceStore) private financeStore: GuildFinanceStore) {
    makeAutoObservable(this);

    // Сначала инициализируем апгрейды без dependents
    GUILD_UPGRADES.forEach((upgrade) => {
      this.upgradeMap[upgrade.id] = {
        ...upgrade,
        dependents: [],
      };
    });

    // Затем строим зависимые связи (dependents)
    Object.values(this.upgradeMap).forEach((upgrade) => {
      upgrade.requires.forEach((depId) => {
        this.upgradeMap[depId]?.dependents.push(upgrade.id);
      });
    });
  }

  get upgrades() {
    return Object.values(this.upgradeMap);
  }

  get completedUpgrades() {
    return this.upgrades.filter(upgrade => upgrade.done);
  }

  // computed: доступен ли апгрейд
  isAvailable = (upgradeId: string): boolean => {
    const upgrade = this.upgradeMap[upgradeId];
    if (!upgrade) return false;

    return upgrade.requires.every(reqId => this.upgradeMap[reqId]?.done);
  };

  canPurchase = (upgradeId: string): boolean => {
    const upgrade = this.upgradeMap[upgradeId];
    if (!upgrade) return false;
    if (!this.isAvailable(upgradeId)) return false;

    const goldOk = this.financeStore.canAffordGold(upgrade.cost);
    const resourceOk = upgrade.resourceCost
      ? this.financeStore.canAffordResources(upgrade.resourceCost)
      : true;

    return goldOk && resourceOk;
  };

  completeUpgrade = (upgradeId: string) => {
    const upgrade = this.upgradeMap[upgradeId];

    if (upgrade && !upgrade.done && this.canPurchase(upgradeId)) {
      if (!this.financeStore.spendGold(upgrade.cost)) return false;

      if (upgrade.resourceCost) {
        const spent = this.financeStore.spendResources(upgrade.resourceCost);

        if (!spent) {
          // если не удалось списать ресурсы — возвращаем золото
          this.financeStore.addGold(upgrade.cost);

          return false;
        }
      }

      upgrade.done = true;

      return true;
    }

    return false;
  };

  getAllRequires = (upgradeId: string, visited = new Set<string>()): TUpgrade[] => {
    const upgrade = this.upgradeMap[upgradeId];
    if (!upgrade) return [];

    let allDeps: TUpgrade[] = [];

    for (const reqId of upgrade.requires) {
      if (!visited.has(reqId)) {
        visited.add(reqId);
        allDeps.push(this.upgradeMap[reqId]);
        allDeps = [...allDeps, ...this.getAllRequires(reqId, visited)];
      }
    }

    return Array.from(new Set(allDeps)); // удаляем дубликаты на всякий случай
  };

  getNumericEffectSum = (key: string): number => {
    return this.completedUpgrades.reduce((sum, upgrade) => {
      const value = upgrade.effects[key];

      return typeof value === 'number' ? sum + value : sum;
    }, 0);
  };

  getNumericEffectMax = (key: string): number => {
    let max = 10;

    this.completedUpgrades.forEach((upgrade) => {
      const value = upgrade.effects[key];

      if (typeof value === 'number') {
        max = Math.max(max, value);
      }
    });

    return max;
  };

  getNumericEffectProduct = (key: string): number => {
    let product = 1;
    let applied = false;

    this.completedUpgrades.forEach((upgrade) => {
      const value = upgrade.effects[key];

      if (typeof value === 'number') {
        product *= value;
        applied = true;
      }
    });

    return applied ? product : 1;
  };

  getBooleanEffect = (key: string): boolean => {
    return this.completedUpgrades.some(upgrade => Boolean(upgrade.effects[key]));
  };

  requestEmergencyLoan = () => {
    const amount = this.getNumericEffectMax('emergency_loan');
    if (!amount) return false;
    const interest = this.getNumericEffectMax('loan_interest_per_day');

    return this.financeStore.applyEmergencyLoan(amount, interest);
  };
}
