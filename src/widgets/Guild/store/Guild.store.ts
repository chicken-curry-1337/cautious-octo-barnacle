import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { GuildFinanceStore } from '../../../entities/Finance/Finance.store';
import { HeroStore } from '../../../entities/Hero/Hero.store';
import { TimeStore } from '../../../entities/TimeStore/TimeStore';
import { HeroesStore } from '../../../features/Heroes/Heroes.store';
import { QuestsStore } from '../../../features/Quests/Quests.store';
import { RecruitsStore } from '../../../features/Recruits/store/Recruits.store';
import type { HeroType } from '../../../shared/types/hero';
import { QuestStatus } from '../../../shared/types/quest';
import { UpgradeStore } from '../../../entities/Upgrade/Upgrade.store';

@singleton()
export class GuildStore {
  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(RecruitsStore) public recruitsStore: RecruitsStore,
    @inject(HeroesStore) public heroesStore: HeroesStore,
    @inject(QuestsStore) public questStore: QuestsStore,
    @inject(UpgradeStore) public upgradeStore: UpgradeStore,
  ) {
    makeAutoObservable(this);
    
    // Pay rent monthly based on guild size level
    reaction(
      () => this.timeStore.monthIndex,
      () => {
        if (this.timeStore.absoluteDay === 0) return;
        this.payMonthlyRent();
      },
      { fireImmediately: false },
    );
  }

  // Capacity rules
  private get baseHeroCapacity() {
    return 6;
  }

  private get capacityPerLevel() {
    return 2;
  }

  get guildSizeLevel() {
    return this.upgradeStore.getNumericEffectSum('guild_size_level');
  }

  get maxHeroesExcludingMain() {
    return this.baseHeroCapacity + this.guildSizeLevel * this.capacityPerLevel;
  }

  get nonMainHeroCount() {
    return this.heroesStore.heroes.filter(h => !h.isMainHero).length;
  }

  get hasFreeHeroSlot() {
    return this.nonMainHeroCount < this.maxHeroesExcludingMain;
  }

  // Rent rules
  private get baseMonthlyRent() {
    return 30; // base rent
  }

  private get rentPerLevel() {
    return 15; // additional rent per guild size level
  }

  private computeMonthlyRent() {
    return this.baseMonthlyRent + this.guildSizeLevel * this.rentPerLevel;
  }

  private payMonthlyRent() {
    const rent = this.computeMonthlyRent();
    if (rent > 0) {
      const amount = Math.min(rent, this.financeStore.gold);
      if (amount > 0) this.financeStore.spendGold(amount, 'rent');
      const unpaid = rent - amount;
      if (unpaid > 0) {
        console.warn('Недостаточно золота для аренды гильдии. Неоплаченная сумма:', unpaid);
      }
    }
  }

  completeQuest = (questId: string) => {
    const quest = this.questStore.quests.find(q => q.id === questId);

    if (quest && !quest.completed) {
      quest.status = QuestStatus.CompletedSuccess;

      const assignedHeroes = this.heroesStore.heroes.filter(h =>
        quest.assignedHeroIds.includes(h.id),
      );
      const reward = quest.reward;

      this.financeStore.addGold(reward, 'quest_reward');

      assignedHeroes.forEach(h => h.increaseLevel());
    }
  };

  hireCandidate = (id: string) => {
    const candidate = this.recruitsStore.recruitMap[id];

    // Проверяем, хватает ли золота
    if (!this.financeStore.canAffordGold(candidate.recruitCost)) {
      console.warn(`Недостаточно золота, чтобы нанять ${candidate.name}`);

      return;
    }

    // Снимаем золото
    if (!this.hasFreeHeroSlot) {
      console.warn('Достигнут лимит героев для текущего размера гильдии. Увеличьте здание гильдии.');
      return;
    }

    this.financeStore.spendGold(candidate.recruitCost, 'recruitment');

    this.heroesStore.heroesMap[candidate.id] = new HeroStore({
      ...candidate,
    });

    delete this.recruitsStore.recruitMap[id];
  };

  calculateMonthlySalary = (level: number, type: HeroType): number => {
    const base = 10;
    const typeMultiplier = {
      warrior: 1.2,
      mage: 1.1,
      rogue: 1.3,
    };

    return Math.floor(base * level * (typeMultiplier[type] || 1));
  };
}
