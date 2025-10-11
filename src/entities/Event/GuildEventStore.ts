import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import type { GuildEvent, GuildEventOption } from '../../assets/events/guildEvents';
import { GUILD_EVENTS } from '../../assets/events/guildEvents';
import { GuildFinanceStore } from '../Finance/Finance.store';
import { GameStateStore } from '../GameState/GameStateStore';
import { TimeStore } from '../TimeStore/TimeStore';

type ActiveGuildEvent = GuildEvent & {
  dayTriggered: number;
};

@singleton()
export class GuildEventStore {
  currentEvent: ActiveGuildEvent | null = null;
  history: { eventId: string; optionId: string; day: number }[] = [];
  private completedNonRepeatable = new Set<string>();

  constructor(
    @inject(TimeStore) private timeStore: TimeStore,
    @inject(GuildFinanceStore) private financeStore: GuildFinanceStore,
    @inject(GameStateStore) private gameStateStore: GameStateStore,
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.absoluteDay,
      (day) => {
        this.onNewDay(day);
      },
      { fireImmediately: false },
    );
  }

  private onNewDay(day: number) {
    if (this.currentEvent) return;

    const availableEvents = GUILD_EVENTS.filter((event) => {
      if (event.minDay > day) return false;
      if (!event.repeatable && this.completedNonRepeatable.has(event.id)) return false;

      if (event.requiredResources && !this.financeStore.canAffordResources(event.requiredResources)) {
        return false;
      }

      return true;
    });

    for (const event of availableEvents) {
      if (Math.random() <= event.baseChance) {
        this.currentEvent = {
          ...event,
          dayTriggered: day,
        };

        break;
      }
    }
  }

  resolveEvent(optionId: string) {
    if (!this.currentEvent) return false;

    const option = this.currentEvent.options.find(opt => opt.id === optionId);
    if (!option) return false;

    if (option.resourceCost && !this.financeStore.canAffordResources(option.resourceCost)) {
      return false;
    }

    if (option.resourceCost) {
      const spent = this.financeStore.spendResources(option.resourceCost);
      if (!spent) return false;
    }

    if (option.resourceReward) {
      Object.entries(option.resourceReward).forEach(([resourceId, amount]) => {
        if (amount > 0) {
          this.financeStore.addResource(resourceId, amount);
        }
      });
    }

    if (option.statusId) {
      this.gameStateStore.applyStatus(option.statusId);
    }

    if (!this.currentEvent.repeatable) {
      this.completedNonRepeatable.add(this.currentEvent.id);
    }

    this.history.push({
      eventId: this.currentEvent.id,
      optionId,
      day: this.timeStore.absoluteDay,
    });

    this.currentEvent = null;

    return true;
  }

  dismissEvent() {
    this.currentEvent = null;
  }

  get pendingOptions(): GuildEventOption[] {
    return this.currentEvent?.options ?? [];
  }

  canResolveOption(optionId: string): boolean {
    if (!this.currentEvent) return false;
    const option = this.currentEvent.options.find(opt => opt.id === optionId);
    if (!option) return false;

    return !option.resourceCost || this.financeStore.canAffordResources(option.resourceCost);
  }
}
