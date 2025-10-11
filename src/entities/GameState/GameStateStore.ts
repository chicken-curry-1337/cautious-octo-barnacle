import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import type { FactionId } from '../../assets/factions/factions';
import type { GuildStatus } from '../../assets/statuses/guildStatuses';
import { GUILD_BUFFS, GUILD_DEBUFFS } from '../../assets/statuses/guildStatuses';
import { GuildFinanceStore } from '../Finance/Finance.store';
import { TimeStore } from '../TimeStore/TimeStore';
import { UpgradeStore } from '../Upgrade/Upgrade.store';

type TReputation = {
  guild: number;
  guard: number;
  cartel: number;
  merchants: number;
  citizens: number;
};

type ActiveGuildStatus = {
  id: string;
  remainingDays: number;
  source: GuildStatus;
};

@singleton()
export class GameStateStore {
  gold: number = 100;
  heat: number = 0;
  reputation: TReputation = {
    guild: 0,
    guard: 0,
    cartel: 0,
    merchants: 0,
    citizens: 0,
  };
  factionLeadersUnlocked: Record<FactionId, boolean> = {
    guild: false,
    guard: false,
    cartel: false,
    merchants: false,
    citizens: false,
  };

  activeStatuses: ActiveGuildStatus[] = [];

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(UpgradeStore) public upgradeStore: UpgradeStore,
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
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
    const multiplier = this.upgradeStore.getNumericEffectProduct('heat_decay_mult');
    const decay = Math.max(1, Math.round(baseDecay * multiplier));
    this.heat = Math.max(0, this.heat - decay);
  };

  changeFactionReputation = (factionId: FactionId, delta: number) => {
    const adjusted = Math.round(delta);
    if (adjusted === 0) return;

    const current = this.reputation[factionId] ?? 0;
    this.reputation[factionId] = current + adjusted;
  };

  unlockFactionLeader = (factionId: FactionId) => {
    if (this.factionLeadersUnlocked[factionId]) return;

    this.factionLeadersUnlocked[factionId] = true;
  };

  isFactionLeaderUnlocked = (factionId: FactionId) => {
    return this.factionLeadersUnlocked[factionId] ?? false;
  };

  getFactionReputation = (factionId: FactionId) => {
    return this.reputation[factionId];
  };
}
