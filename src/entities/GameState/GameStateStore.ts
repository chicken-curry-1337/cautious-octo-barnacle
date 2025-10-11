import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import type { GuildStatus } from '../../assets/statuses/guildStatuses';
import { GUILD_BUFFS, GUILD_DEBUFFS } from '../../assets/statuses/guildStatuses';
import { GuildFinanceStore } from '../Finance/Finance.store';
import { TimeStore } from '../TimeStore/TimeStore';
import { UpgradeStore } from '../Upgrade/Upgrade.store';

type ActiveGuildStatus = {
  id: string;
  remainingDays: number;
  source: GuildStatus;
};

@singleton()
export class GameStateStore {
  gold: number = 100;
  heat: number = 0;

  activeStatuses: ActiveGuildStatus[] = [];
  private syncing: boolean = false;

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(UpgradeStore) public upgradeStore: UpgradeStore,
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
        if (this.syncing) return;
        this.tickStatuses();
        this.decayHeat();
      },
      { fireImmediately: false },
    );
  }

  get questSuccessChanceBonus() {
    return this.activeStatuses.reduce((sum, status) => sum + (status.source.effects.questSuccessChanceBonus ?? 0), 0);
  }

  get questRewardMultiplier() {
    return this.activeStatuses.reduce((mult, status) => mult * (status.source.effects.questRewardMultiplier ?? 1), 1);
  }

  get injuryChanceMultiplier() {
    return this.activeStatuses.reduce((mult, status) => mult * (status.source.effects.injuryChanceMultiplier ?? 1), 1);
  }

  get resourceGainMultiplier() {
    return this.activeStatuses.reduce((mult, status) => mult * (status.source.effects.resourceGainMultiplier ?? 1), 1);
  }

  applyStatus = (statusId: string) => {
    const status = [...GUILD_BUFFS, ...GUILD_DEBUFFS].find(s => s.id === statusId);
    if (!status) return;

    const existing = this.activeStatuses.find(active => active.id === status.id);

    if (existing) {
      existing.remainingDays = Math.max(existing.remainingDays, status.durationDays);
      existing.source = status;
    } else {
      this.activeStatuses.push({
        id: status.id,
        remainingDays: status.durationDays,
        source: status,
      });
    }
  };

  clearStatus = (statusId: string) => {
    this.activeStatuses = this.activeStatuses.filter(status => status.id !== statusId);
  };

  tickStatuses = () => {
    this.activeStatuses = this.activeStatuses
      .map(status => ({
        ...status,
        remainingDays: status.remainingDays - 1,
      }))
      .filter(status => status.remainingDays > 0);
  };

  addHeat = (amount: number) => {
    const value = Math.max(0, Math.round(amount));
    if (value <= 0) return;

    this.heat += value;
  };

  applyHeatDelta = (delta: number) => {
    const adjusted = Math.round(delta);
    if (adjusted === 0) return;

    if (adjusted > 0) {
      this.addHeat(adjusted);
    } else {
      this.heat = Math.max(0, this.heat + adjusted);
    }
  };

  decayHeat = () => {
    if (this.heat <= 0) return;
    const baseDecay = 1;
    const upgradeStore = this.getUpgradeStore();
    const multiplier = upgradeStore.getNumericEffectProduct('heat_decay_mult');
    const decay = Math.max(1, Math.round(baseDecay * multiplier));
    this.heat = Math.max(0, this.heat - decay);
  };

  setSyncing = (value: boolean) => {
    this.syncing = value;
  };

  loadSnapshot = (snapshot: GameStateSnapshot) => {
    this.gold = snapshot.gold ?? this.gold;
    this.heat = snapshot.heat ?? this.heat;

    if (snapshot.activeStatuses) {
      this.activeStatuses = snapshot.activeStatuses
        .map(({ id, remainingDays }) => {
          const source = this.findStatusById(id);
          if (!source) return null;

          return {
            id,
            remainingDays,
            source,
          };
        })
        .filter((status): status is ActiveGuildStatus => Boolean(status));
    } else {
      this.activeStatuses = [];
    }
  };

  private findStatusById = (statusId: string) => {
    return [...GUILD_BUFFS, ...GUILD_DEBUFFS].find(status => status.id === statusId) ?? null;
  };
}

export type GameStateSnapshot = {
  gold: number;
  heat: number;
  activeStatuses: Array<{ id: string; remainingDays: number }>;
};
