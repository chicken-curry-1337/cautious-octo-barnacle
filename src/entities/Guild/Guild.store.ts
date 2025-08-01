import { makeAutoObservable, reaction } from 'mobx';
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

    reaction(
      () => this.timeStore.currentDay,
      () => {
        this.onNextDay();
      }
    );
  }

  assignHeroToQuest = (heroId: string, questId: string) => {
    const hero = this.heroesStore.heroes.find((h) => h.id === heroId);
    const quest = this.questStore.quests.find((q) => q.id === questId);
    if (hero && quest && !quest.completed) {
      // Проверяем, что герой не назначен на другой квест
      if (hero.assignedQuestId && hero.assignedQuestId !== questId) {
        // Герой уже занят другим квестом — не назначаем
        return false;
      }

      // Если герой уже назначен на этот квест, ничего не меняем
      if (hero.assignedQuestId === questId) {
        return true;
      }

      hero.assignedQuestId = questId;
      quest.assignedHeroIds.push(heroId);
      quest.status = QuestStatus.InProgress;
      return true;
    }
    return false;
  };

  assignHeroesToQuest = (heroes: string[], questId: string) => {
    // todo: добавить итоговую комиссию в квест, потому что после квеста может измениться уровень героев, что сломает комиссию в результате
    heroes.forEach((hero) => this.assignHeroToQuest(hero, questId));
  };

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

  onNextDay = () => {
    // Обновляем срок действия кандидатов
    this.recruitStore.candidates = this.recruitStore.candidates
      .map((c) => ({ ...c, daysRemaining: c.daysRemaining - 1 }))
      .filter((c) => c.daysRemaining > 0);

    // Проверяем задания с дедлайном — выполнить или удалить
    this.questStore.quests = this.questStore.quests.filter((quest) => {
      if (quest.status === QuestStatus.CompletedSuccess) return true; // Уже выполнено — оставляем

      if (this.timeStore.currentDay > quest.deadlineDay) {
        // Дедлайн прошёл — проверяем героев
        const assignedHeroes = this.heroesStore.heroes.filter((h) =>
          quest.assignedHeroIds.includes(h.id)
        );

        if (assignedHeroes.length === 0) {
          quest.status = QuestStatus.FailedDeadline;
          // Задание провалено из-за отсутствия героев — удаляем задание
          if (this.timeStore.currentDay > quest.deadlineDay + 2) {
            return false;
          }

          return true;
        }

        // Проверяем требования
        const chance = this.getQuestSuccessChance(quest.id);
        const roll = Math.random() * 100;
        const success = roll <= chance;

        if (success) {
          quest.status = QuestStatus.CompletedSuccess;
          const heroComission = assignedHeroes.reduce(
            (sum, h) => sum + (h.minStake ?? 0),
            0
          );
          console.log(`hero comission: ${heroComission}`);
          this.financeStore.addGold(quest.reward - heroComission);
          assignedHeroes.forEach((h) => this.increaseHeroLevel(h));
          console.log(`hero comission: ${heroComission}`);
        } else {
          quest.status = QuestStatus.CompletedFail;
        }
        return true;
      }

      return true; // Если дедлайн ещё не наступил — задание остаётся
    });

    this.recruitStore.onNextDay();
    this.questStore.onNextDay();
  };

  hireCandidate = (id: string) => {
    const candidateIndex = this.recruitStore.candidates.findIndex(
      (c) => c.id === id
    );
    if (candidateIndex === -1) return;

    const candidate = this.recruitStore.candidates[candidateIndex];

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
    this.recruitStore.candidates.splice(candidateIndex, 1);
  };

  startQuest = (questId: string) => {
    const quest = this.questStore.quests.find((q) => q.id === questId);
    if (!quest) {
      console.warn(`Квест с id ${questId} не найден`);
      return;
    }

    if (quest.status === QuestStatus.CompletedSuccess) {
      console.warn(`Квест "${quest.title}" уже завершён`);
      return;
    }

    if (quest.assignedHeroIds.length === 0) {
      console.warn(
        `Нельзя стартовать квест "${quest.title}" без назначенных героев`
      );
      return;
    }

    // Назначаем героям этот квест, если ещё не назначен
    quest.assignedHeroIds.forEach((heroId) => {
      const hero = this.heroesStore.heroes.find((h) => h.id === heroId);
      if (hero && hero.assignedQuestId !== questId) {
        hero.assignedQuestId = questId;
      }
    });

    console.log(`Квест "${quest.title}" стартовал`);
    quest.status = QuestStatus.InProgress;
    // Тут можно добавить дополнительную логику старта, если понадобится
  };

  getQuestSuccessChance = (
    questId: string,
    heroesToAssign?: string[]
  ): number => {
    const quest = this.questStore.quests.find((q) => q.id === questId);
    if (!quest) return 0;

    const heroes = heroesToAssign ?? quest.assignedHeroIds;

    const assignedHeroes = this.heroesStore.heroes.filter((h) =>
      heroes.includes(h.id)
    );
    if (assignedHeroes.length === 0) return 0;

    const totalStrength = assignedHeroes.reduce(
      (sum, h) => sum + h.strength,
      0
    );
    const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
    const totalIntelligence = assignedHeroes.reduce(
      (sum, h) => sum + h.intelligence,
      0
    );

    const strengthRatio =
      quest.requiredStrength > 0 ? totalStrength / quest.requiredStrength : 1;
    const agilityRatio =
      quest.requiredAgility > 0 ? totalAgility / quest.requiredAgility : 1;
    const intelligenceRatio =
      quest.requiredIntelligence > 0
        ? totalIntelligence / quest.requiredIntelligence
        : 1;

    // Усредняем и ограничиваем максимум 1
    const averageRatio = Math.min(
      (strengthRatio + agilityRatio + intelligenceRatio) / 3,
      1
    );

    // Возвращаем процент (0–100)
    return Math.round(averageRatio * 100);
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
