import { makeAutoObservable } from 'mobx';
import { inject, singleton } from 'tsyringe';
import type { Hero, HeroType } from '../../shared/types/hero';
import { QuestStatus } from '../../shared/types/quest';
import { GuildFinanceStore } from '../Finance/Finance.store';
import { HeroesStore } from '../Heroes/Heroes.store';
import { QuestStore } from '../Quest/Quest.store';
import { RecruitStore } from '../Recruit/Recruit.store';
import { TimeStore } from '../TimeStore/TimeStore';

@singleton()
export class GuildStore {
  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(RecruitStore) public recruitStore: RecruitStore,
    @inject(HeroesStore) public heroesStore: HeroesStore,
    @inject(QuestStore) public questStore: QuestStore
  ) {
    makeAutoObservable(this);
  }

  increaseHeroLevel = (hero: Hero) => {
    hero.assignedQuestId = null;
    hero.level += 1;

    switch (hero.type) {
      case 'warrior':
        hero.strength += 3;
        hero.agility += 1;
        hero.intelligence += 1;
        break;
      case 'mage':
        hero.strength += 1;
        hero.agility += 1;
        hero.intelligence += 3;
        break;
      case 'rogue':
        hero.strength += 1;
        hero.agility += 3;
        hero.intelligence += 1;
        break;
    }

    hero.minStake = this.calculateMinStake(hero.level, hero.type);
  };

  completeQuest = (questId: string) => {
    const quest = this.questStore.quests.find((q) => q.id === questId);
    if (quest && !quest.completed) {
      quest.status = QuestStatus.CompletedSuccess;

      const assignedHeroes = this.heroesStore.heroes.filter((h) =>
        quest.assignedHeroIds.includes(h.id)
      );
      const totalMinStake = assignedHeroes.reduce(
        (sum, hero) => sum + hero.minStake,
        0
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

      for (const hero of assignedHeroes) {
        this.increaseHeroLevel(hero);
        hero.assignedQuestId = null;
      }
    }
  };

  randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  hireCandidate = (id: string) => {
    const candidateIndex = this.recruitStore.recruits.findIndex(
      (c) => c.id === id
    );
    if (candidateIndex === -1) return;

    const candidate = this.recruitStore.recruits[candidateIndex];

    // Проверяем, хватает ли золота
    if (!this.financeStore.canAffordGold(candidate.recruitCost)) {
      console.warn(`Недостаточно золота, чтобы нанять ${candidate.name}`);
      return;
    }

    // Снимаем золото
    this.financeStore.spendGold(candidate.recruitCost);

    this.heroesStore.heroes.push({
      ...candidate,
    });
    this.recruitStore.recruits.splice(candidateIndex, 1);
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
