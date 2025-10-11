import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';
import { container } from 'tsyringe';

import type { FactionId } from '../../assets/factions/factions';
import { TimeStore } from '../TimeStore/TimeStore';
import { UpgradeStore } from '../Upgrade/Upgrade.store';

export type ReputationState = Record<FactionId, number>;
export type FactionLeadersState = Record<FactionId, boolean>;

export type FactionsSnapshot = {
  reputation: ReputationState;
  factionLeadersUnlocked: FactionLeadersState;
};

const INITIAL_REPUTATION: ReputationState = {
  guild: 0,
  guard: 0,
  cartel: 0,
  merchants: 0,
  citizens: 0,
};

const INITIAL_LEADER_STATE: FactionLeadersState = {
  guild: false,
  guard: false,
  cartel: false,
  merchants: false,
  citizens: false,
};

@singleton()
export class FactionsStore {
  private static readonly MONTHLY_REPUTATION_DECAY = 1;

  reputation: ReputationState = { ...INITIAL_REPUTATION };
  factionLeadersUnlocked: FactionLeadersState = { ...INITIAL_LEADER_STATE };
  private syncing = false;

  constructor(@inject(TimeStore) private timeStore: TimeStore) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.monthIndex,
      () => {
        if (this.syncing) return;
        if (this.timeStore.absoluteDay === 0) return;
        this.applyMonthlyDecay();
      },
      { fireImmediately: false },
    );
  }

  setSyncing = (value: boolean) => {
    this.syncing = value;
  };

  getFactionReputation = (factionId: FactionId) => {
    return this.reputation[factionId] ?? 0;
  };

  changeFactionReputation = (factionId: FactionId, delta: number) => {
    let adjusted = Math.round(delta);
    if (adjusted === 0) return;

    if (factionId === 'guard') {
      const upgradeStore = container.resolve(UpgradeStore);

      if (adjusted > 0) {
        const gainMult = upgradeStore.getNumericEffectProduct('rep_gain_mult_guard');

        if (gainMult !== 1) {
          adjusted = Math.round(adjusted * gainMult);
        }
      } else if (adjusted < 0) {
        const lossMult = upgradeStore.getNumericEffectProduct('fail_rep_loss_mult_guard');

        if (lossMult !== 1) {
          adjusted = Math.round(adjusted * lossMult);
        }
      }
    }

    if (adjusted === 0) return;

    const current = this.getFactionReputation(factionId);
    this.reputation[factionId] = current + adjusted;
  };

  unlockFactionLeader = (factionId: FactionId) => {
    if (this.factionLeadersUnlocked[factionId]) return;

    this.factionLeadersUnlocked[factionId] = true;
  };

  isFactionLeaderUnlocked = (factionId: FactionId) => {
    return this.factionLeadersUnlocked[factionId] ?? false;
  };

  loadSnapshot = (snapshot: FactionsSnapshot) => {
    this.reputation = { ...INITIAL_REPUTATION, ...snapshot.reputation };
    this.factionLeadersUnlocked = { ...INITIAL_LEADER_STATE, ...snapshot.factionLeadersUnlocked };
  };

  buildSnapshot = (): FactionsSnapshot => ({
    reputation: { ...this.reputation },
    factionLeadersUnlocked: { ...this.factionLeadersUnlocked },
  });

  private applyMonthlyDecay = () => {
    (Object.keys(this.reputation) as FactionId[]).forEach((factionId) => {
      this.changeFactionReputation(factionId, -FactionsStore.MONTHLY_REPUTATION_DECAY);
    });
  };
}
