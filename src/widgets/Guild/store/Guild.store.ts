import { makeAutoObservable } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { GuildFinanceStore } from '../../../entities/Finance/Finance.store';
import { HeroStore } from '../../../entities/Hero/Hero.store';
import { TimeStore } from '../../../entities/TimeStore/TimeStore';
import { HeroesStore } from '../../../features/Heroes/Heroes.store';
import { QuestStore } from '../../../features/Quest/Quest.store';
import { RecruitsStore } from '../../../features/Recruits/Recruits.store';
import type { HeroType } from '../../../shared/types/hero';
import { QuestStatus } from '../../../shared/types/quest';

@singleton()
export class GuildStore {
  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(RecruitsStore) public recruitsStore: RecruitsStore,
    @inject(HeroesStore) public heroesStore: HeroesStore,
    @inject(QuestStore) public questStore: QuestStore,
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
      const totalMinStake = assignedHeroes.reduce(
        (sum, hero) => sum + hero.minStake,
        0,
      );
      const reward = quest.reward;

      if (reward >= totalMinStake) {
        const guildProfit = reward - totalMinStake;
        this.financeStore.addGold(guildProfit);
      } else {
        const shortage = totalMinStake - reward;

        if (this.financeStore.canAffordGold(shortage)) {
          this.financeStore.spendGold(shortage);
        } else {
          const affordableShortage = Math.min(shortage, this.financeStore.gold);
          this.financeStore.spendGold(affordableShortage);
          console.warn('Гильдия не может полностью покрыть ставки героев!');
        }
      }

      assignedHeroes.forEach(h => h.increaseLevel());
    }
  };

  randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  hireCandidate = (id: string) => {
    const candidate = this.recruitsStore.recruitMap[id];

    // Проверяем, хватает ли золота
    if (!this.financeStore.canAffordGold(candidate.recruitCost)) {
      console.warn(`Недостаточно золота, чтобы нанять ${candidate.name}`);

      return;
    }

    // Снимаем золото
    this.financeStore.spendGold(candidate.recruitCost);

    this.heroesStore.heroesMap[candidate.id] = new HeroStore({
      ...candidate,
    });

    delete this.recruitsStore.recruitMap[id];
  };

  calculateMinStake = (level: number, type: HeroType): number => {
    const base = 10;
    const typeMultiplier = {
      warrior: 1.2,
      mage: 1.1,
      rogue: 1.3,
    };

    return Math.floor(base * level * (typeMultiplier[type] || 1));
  };
}
