import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

import { type TUpgrade, GUILD_UPGRADES } from '../../assets/upgrades/upgrades';

@singleton()
export class UpgradeStore {
  upgradeMap: Record<string, TUpgrade> = {};

  constructor() {
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

  // computed: доступен ли апгрейд
  isAvailable = (upgradeId: string): boolean => {
    const upgrade = this.upgradeMap[upgradeId];
    if (!upgrade) return false;

    return upgrade.requires.every(reqId => this.upgradeMap[reqId]?.done);
  };

  completeUpgrade = (upgradeId: string) => {
    const upgrade = this.upgradeMap[upgradeId];

    if (upgrade && !upgrade.done && this.isAvailable(upgradeId)) {
      upgrade.done = true;
    }
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
}
