import { makeAutoObservable } from 'mobx';
import { inject, singleton } from 'tsyringe';

import type { GuildEventSnapshot } from '../../entities/Event/GuildEventStore';
import { GuildEventStore } from '../../entities/Event/GuildEventStore';
import type { FinanceSnapshot } from '../../entities/Finance/Finance.store';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import type { GameStateSnapshot } from '../../entities/GameState/GameStateStore';
import { GameStateStore } from '../../entities/GameState/GameStateStore';
import { TimeStore } from '../../entities/TimeStore/TimeStore';
import { UpgradeStore } from '../../entities/Upgrade/Upgrade.store';
import type { IHero, IRecruitCandidate } from '../../shared/types/hero';
import { HeroesStore } from '../Heroes/Heroes.store';
import { QuestsStore, type QuestsSnapshot } from '../Quests/Quests.store';
import { RecruitsStore } from '../Recruits/store/Recruits.store';

type GameSnapshot = {
  version: number;
  timestamp: number;
  time: {
    absoluteDay: number;
  };
  finance: FinanceSnapshot;
  gameState: GameStateSnapshot;
  heroes: IHero[];
  recruits: IRecruitCandidate[];
  quests: QuestsSnapshot;
  upgrades: {
    completed: string[];
  };
  events: GuildEventSnapshot;
};

@singleton()
export class SaveStore {
  private static STORAGE_KEY = 'cautious-octo-barnacle-save-v1';
  lastSavedAt: number | null = null;
  lastLoadedAt: number | null = null;

  constructor(
    @inject(TimeStore) private timeStore: TimeStore,
    @inject(GuildFinanceStore) private financeStore: GuildFinanceStore,
    @inject(GameStateStore) private gameStateStore: GameStateStore,
    @inject(HeroesStore) private heroesStore: HeroesStore,
    @inject(RecruitsStore) private recruitsStore: RecruitsStore,
    @inject(QuestsStore) private questsStore: QuestsStore,
    @inject(UpgradeStore) private upgradeStore: UpgradeStore,
    @inject(GuildEventStore) private guildEventStore: GuildEventStore,
  ) {
    makeAutoObservable(this);

    const snapshot = this.readSnapshot();

    if (snapshot) {
      this.lastSavedAt = snapshot.timestamp;
    }
  }

  get hasSave() {
    return this.lastSavedAt !== null;
  }

  saveGame = () => {
    if (typeof window === 'undefined') return false;

    try {
      const snapshot = this.buildSnapshot();
      window.localStorage.setItem(SaveStore.STORAGE_KEY, JSON.stringify(snapshot));
      this.lastSavedAt = snapshot.timestamp;

      return true;
    } catch (error) {
      console.error('Не удалось сохранить игру', error);

      return false;
    }
  };

  loadGame = () => {
    if (typeof window === 'undefined') return false;

    const raw = window.localStorage.getItem(SaveStore.STORAGE_KEY);
    if (!raw) return false;

    try {
      const snapshot: GameSnapshot = JSON.parse(raw);

      if (snapshot.version !== 1) {
        console.warn('Версия сохранения не поддерживается', snapshot.version);

        return false;
      }
      this.applySnapshot(snapshot);
      this.lastLoadedAt = Date.now();
      this.lastSavedAt = snapshot.timestamp ?? this.lastSavedAt;

      return true;
    } catch (error) {
      console.error('Не удалось загрузить игру', error);

      return false;
    }
  };

  deleteSave = () => {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(SaveStore.STORAGE_KEY);
    this.lastSavedAt = null;
  };

  private buildSnapshot(): GameSnapshot {
    return {
      version: 1,
      timestamp: Date.now(),
      time: {
        absoluteDay: this.timeStore.absoluteDay,
      },
      finance: {
        gold: this.financeStore.gold,
        resources: { ...this.financeStore.resources },
        loanBalance: this.financeStore.loanBalance,
        loanInterestPerDay: this.financeStore.loanInterestPerDay,
        emergencyLoanTaken: this.financeStore.emergencyLoanTaken,
      },
      gameState: {
        gold: this.gameStateStore.gold,
        heat: this.gameStateStore.heat,
        reputation: { ...this.gameStateStore.reputation },
        activeStatuses: this.gameStateStore.activeStatuses.map(status => ({
          id: status.id,
          remainingDays: status.remainingDays,
        })),
        factionLeadersUnlocked: { ...this.gameStateStore.factionLeadersUnlocked },
      },
      heroes: this.heroesStore.heroes.map(hero => ({
        id: hero.id,
        name: hero.name,
        level: hero.level,
        strength: hero.strength,
        agility: hero.agility,
        intelligence: hero.intelligence,
        type: hero.type,
        description: hero.description,
        minStake: hero.minStake,
        injured: hero.injured,
        injuredTimeout: hero.injuredTimeout ?? undefined,
        recruitCost: hero.recruitCost,
        traits: [...hero.traits],
        assignedQuestId: hero.assignedQuestId,
        isMainHero: hero.isMainHero ?? false,
      })),
      recruits: this.recruitsStore.recruits.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        level: candidate.level,
        strength: candidate.strength,
        agility: candidate.agility,
        intelligence: candidate.intelligence,
        type: candidate.type,
        description: candidate.description,
        minStake: candidate.minStake,
        injured: candidate.injured,
        injuredTimeout: candidate.injuredTimeout ?? undefined,
        recruitCost: candidate.recruitCost,
        traits: [...candidate.traits],
        daysRemaining: candidate.daysRemaining,
      })),
      quests: {
        quests: this.questsStore.quests.map(quest => ({ ...quest })),
        questChainsProgress: { ...this.questsStore.questChainsProgress },
      },
      upgrades: {
        completed: this.upgradeStore.completedUpgrades.map(upgrade => upgrade.id),
      },
      events: {
        currentEvent: this.guildEventStore.currentEvent
          ? {
              id: this.guildEventStore.currentEvent.id,
              dayTriggered: this.guildEventStore.currentEvent.dayTriggered,
            }
          : null,
        history: [...this.guildEventStore.history],
        completedNonRepeatable: this.guildEventStore.getCompletedNonRepeatableIds(),
      },
    };
  }

  private applySnapshot(snapshot: GameSnapshot) {
    this.setSyncing(true);

    try {
      this.timeStore.setAbsoluteDay(snapshot.time?.absoluteDay ?? 0);

      this.financeStore.loadSnapshot(snapshot.finance);
      this.gameStateStore.loadSnapshot(snapshot.gameState);
      this.upgradeStore.loadSnapshot(snapshot.upgrades?.completed ?? []);
      this.heroesStore.loadSnapshot(snapshot.heroes ?? []);
      this.recruitsStore.loadSnapshot(snapshot.recruits ?? []);
      const questsSnapshot = snapshot.quests ?? { quests: [], questChainsProgress: {} };
      this.questsStore.loadSnapshot(questsSnapshot);

      const eventsSnapshot = snapshot.events ?? { currentEvent: null, history: [], completedNonRepeatable: [] };
      this.guildEventStore.loadSnapshot({
        currentEvent: eventsSnapshot.currentEvent ?? null,
        history: eventsSnapshot.history ?? [],
        completedNonRepeatable: eventsSnapshot.completedNonRepeatable ?? [],
      });

      const assignmentMap = new Map<string, string>();
      this.questsStore.quests.forEach((quest) => {
        quest.assignedHeroIds.forEach((heroId) => {
          assignmentMap.set(heroId, quest.id);
        });
      });
      this.heroesStore.heroes.forEach((hero) => {
        hero.assignedQuestId = assignmentMap.get(hero.id) ?? null;
      });
    } finally {
      this.setSyncing(false);
    }
  }

  private setSyncing(value: boolean) {
    this.financeStore.setSyncing(value);
    this.gameStateStore.setSyncing(value);
    this.heroesStore.setSyncing(value);
    this.recruitsStore.setSyncing(value);
    this.questsStore.setSyncing(value);
    this.guildEventStore.setSyncing(value);
  }

  private readSnapshot(): GameSnapshot | null {
    if (typeof window === 'undefined') return null;

    const raw = window.localStorage.getItem(SaveStore.STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Не удалось прочитать сохранение', error);

      return null;
    }
  }
}
