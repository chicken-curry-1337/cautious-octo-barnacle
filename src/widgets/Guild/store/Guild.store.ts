import { makeAutoObservable } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { GuildFinanceStore } from '../../../entities/Finance/Finance.store';
import { HeroStore } from '../../../entities/Hero/Hero.store';
import { TimeStore } from '../../../entities/TimeStore/TimeStore';
import { HeroesStore } from '../../../features/Heroes/Heroes.store';
import { QuestsStore } from '../../../features/Quests/Quests.store';
import { RecruitsStore } from '../../../features/Recruits/store/Recruits.store';
import type { HeroType } from '../../../shared/types/hero';
import { QuestStatus } from '../../../shared/types/quest';

@singleton()
export class GuildStore {
  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(RecruitsStore) public recruitsStore: RecruitsStore,
    @inject(HeroesStore) public heroesStore: HeroesStore,
    @inject(QuestsStore) public questStore: QuestsStore,
  ) {
    makeAutoObservable(this);
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
