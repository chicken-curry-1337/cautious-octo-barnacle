import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { DifficultyStore } from '../../entities/Difficulty/Difficulty.store';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import { TimeStore } from '../../entities/TimeStore/TimeStore';
import { QuestStatus, type IQuest } from '../../shared/types/quest';
import { HeroesStore } from '../Heroes/Heroes.store';
import { questChainsConfig } from '../QuestChains/QuestChains.store';

@singleton()
export class QuestStore implements IQuest {
  id: string;
  title: string;
  description: string;
  reward: number;
  dateCreated: number;
  assignedHeroIds: string[];
  completed: boolean;
  requiredStrength: number;
  requiredAgility: number;
  requiredIntelligence: number;
  deadlineAccept: number;
  executionTime: number;
  executionDeadline: number | null = null;
  failResult: string;
  deadlineResult: string;
  successResult: string;
  status: QuestStatus;
  resourcePenalty?: { goldLoss?: number; injuryChance?: number; itemLossChance?: number } | undefined;

  constructor({
    id,
    title,
    description,
    reward,
    dateCreated,
    assignedHeroIds,
    completed,
    requiredStrength,
    requiredAgility,
    requiredIntelligence,
    deadlineAccept,
    executionTime,
    executionDeadline,
    failResult,
    deadlineResult,
    successResult,
    status,
  }: IQuest) {
    makeAutoObservable(this);
    this.id = id;
    this.title = title;
    this.description = description;
    this.reward = reward;
    this.dateCreated = dateCreated;
    this.assignedHeroIds = assignedHeroIds;
    this.completed = completed;
    this.requiredStrength = requiredStrength;
    this.requiredAgility = requiredAgility;
    this.requiredIntelligence = requiredIntelligence;
    this.deadlineAccept = deadlineAccept;
    this.executionTime = executionTime;
    if (executionDeadline) this.executionDeadline = executionDeadline;
    this.failResult = failResult;
    this.deadlineResult = deadlineResult;
    this.successResult = successResult;
    this.status = status;

    //   reaction(
    //     () => this.timeStore.absoluteDay,
    //     () => {
    //       this.onNextDay();
    //     },
    //   );
  }

  timeoutResult: string;

  //   takeQuestIntoWork = (quest: IQuest) => {
  //     this.quests.push(quest);
  //   };

  //   createQuest = (
  //     title: string,
  //     description: string,
  //     successResult: string,
  //     deadlineResult: string,
  //     failResult: string,
  //     reward?: number,
  //   ) => {
  //     const questReward = reward ?? this.randomInRange(50, 150);
  //     const deadlineAccept = this.timeStore.absoluteDay + this.randomInRange(3, 5); // срок на принятие
  //     const executionTime = this.randomInRange(2, 4); // дни на выполнение после старта

  //     const requiredStrength = this.randomInRange(5, 15);
  //     const requiredAgility = this.randomInRange(5, 15);
  //     const requiredIntelligence = this.randomInRange(5, 15);

  //     const newQuest: IQuest = {
  //       id: crypto.randomUUID(),
  //       title,
  //       description,
  //       dateCreated: this.timeStore.absoluteDay,
  //       reward: questReward,
  //       assignedHeroIds: [],
  //       completed: false,
  //       requiredStrength,
  //       requiredAgility,
  //       requiredIntelligence,
  //       deadlineAccept,
  //       executionTime,
  //       executionDeadline: null,
  //       failResult,
  //       deadlineResult,
  //       successResult,
  //       status: QuestStatus.NotStarted,
  //     };
  //     this.quests.push(newQuest);
  //   };

  //   onNextDay = () => {
  //     this.quests = this.quests.filter((quest) => {
  //       // Проверка на истечение времени принятия
  //       if (quest.status === QuestStatus.NotStarted && this.timeStore.absoluteDay > quest.deadlineAccept) {
  //         quest.status = QuestStatus.FailedDeadline;

  //         return false;
  //       }

  //       // Для выполненных заданий Проверка на истечение времени выполнения
  //       if (quest.status === QuestStatus.InProgress && quest.executionDeadline && this.timeStore.absoluteDay >= quest.executionDeadline) {
  //         // Проверяем требования
  //         const chance = this.getNewQuestSuccessChance(quest.id);
  //         const roll = Math.random() * 100;
  //         const success = roll <= chance;

  //         const assignedHeroes = this.heroesStore.heroes.filter(h =>
  //           quest.assignedHeroIds.includes(h.id),
  //         );

  //         if (success) {
  //           quest.status = QuestStatus.CompletedSuccess;
  //           const heroComission = assignedHeroes.reduce(
  //             (sum, h) => sum + (h.minStake ?? 0),
  //             0,
  //           );
  //           console.log(`hero comission: ${heroComission}`);
  //           this.financeStore.addGold(quest.reward - heroComission);
  //           console.log(`hero comission: ${heroComission}`);
  //         } else if (!success) {
  //           quest.status = QuestStatus.CompletedFail;

  //           if (quest.resourcePenalty?.goldLoss) {
  //             this.financeStore.spendGold(quest.resourcePenalty.goldLoss);
  //           }

  //           if (quest.resourcePenalty?.injuryChance) {
  //             assignedHeroes.forEach((hero) => {
  //               const roll = Math.random() * 100;

  //               if (roll < quest.resourcePenalty!.injuryChance!) {
  //                 hero.injured = true; // можно ввести такую механику
  //                 hero.injuredTimeout = 5;
  //               }
  //             });
  //           }
  //         }

  //         assignedHeroes.forEach(h => h.increaseLevel());
  //         assignedHeroes.forEach(h => h.assignedQuestId = null);

  //         return true;
  //       }

  //       // дедлайн еще не наступил - оставляем
  //       return true;
  //     });

  //     this.quests = this.quests.filter(
  //       q => q.status !== QuestStatus.FailedDeadline,
  //     );

  //     const QUEST_LENGTH_MAX = 5;
  //     const QUEST_GENERATE_COUNT = 5;

  //     if (this.newQuests.length < QUEST_LENGTH_MAX) {
  //       const newQuestsCount = Math.floor(
  //         Math.random() * (QUEST_GENERATE_COUNT - this.newQuests.length),
  //       );

  //       for (let i = 0; i < newQuestsCount; i++) {
  //         const quest = this.generateRandomQuest();
  //         this.quests.push(quest);
  //       }
  //     }
  //   };

  //   completeQuest = (questId: string) => {
  //     const quest = this.quests.find(q => q.id === questId);

  //     if (quest && !quest.completed) {
  //       quest.status = QuestStatus.CompletedSuccess;

  //       const assignedHeroes = this.heroesStore.heroes.filter(h =>
  //         quest.assignedHeroIds.includes(h.id),
  //       );
  //       const totalMinStake = assignedHeroes.reduce(
  //         (sum, hero) => sum + hero.minStake,
  //         0,
  //       );
  //       const reward = quest.reward;

  //       if (reward >= totalMinStake) {
  //         const guildProfit = reward - totalMinStake;
  //         this.financeStore.addGold(guildProfit);
  //       } else {
  //         const shortage = totalMinStake - reward;

  //         if (this.financeStore.canAffordGold(shortage)) {
  //           this.financeStore.spendGold(shortage);
  //         } else {
  //           const affordableShortage = Math.min(shortage, this.financeStore.gold);
  //           this.financeStore.spendGold(affordableShortage);
  //           console.warn('Гильдия не может полностью покрыть ставки героев!');
  //         }
  //       }
  //     }
  //   };

  //   getNewQuestSuccessChance = (
  //     questId: string,
  //     heroesToAssign?: string[],
  //   ): number => {
  //     const quest = this.quests.find(q => q.id === questId);
  //     if (!quest) return 0;

  //     const heroes = heroesToAssign ?? quest.assignedHeroIds;

  //     const assignedHeroes = this.heroesStore.heroes.filter(h =>
  //       heroes.includes(h.id),
  //     );
  //     if (assignedHeroes.length === 0) return 0;

  //     const totalStrength = assignedHeroes.reduce(
  //       (sum, h) => sum + h.strength,
  //       0,
  //     );
  //     const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
  //     const totalIntelligence = assignedHeroes.reduce(
  //       (sum, h) => sum + h.intelligence,
  //       0,
  //     );

  //     const strengthRatio
  //       = quest.requiredStrength > 0 ? totalStrength / quest.requiredStrength : 1;
  //     const agilityRatio
  //       = quest.requiredAgility > 0 ? totalAgility / quest.requiredAgility : 1;
  //     const intelligenceRatio
  //       = quest.requiredIntelligence > 0
  //         ? totalIntelligence / quest.requiredIntelligence
  //         : 1;

  //     // Усредняем и ограничиваем максимум 1
  //     const averageRatio = Math.min(
  //       (strengthRatio + agilityRatio + intelligenceRatio) / 3,
  //       1,
  //     );

  //     // Возвращаем процент (0–100)
  //     return Math.round(averageRatio * 100);
  //   };

  //   assignHeroToQuest = (heroId: string, questId: string) => {
  //     const hero = this.heroesStore.heroes.find(h => h.id === heroId);
  //     const quest = this.quests.find(q => q.id === questId);

  //     // todo: выбрасывать ошибки вместо return
  //     if (hero && quest && !quest.completed) {
  //       // Проверяем, что герой не назначен на другой квест
  //       if (hero.assignedQuestId && hero.assignedQuestId !== questId) {
  //         // Герой уже занят другим квестом — не назначаем
  //         return false;
  //       }

  //       // Если герой уже назначен на этот квест, ничего не меняем
  //       if (hero.assignedQuestId === questId) {
  //         return true;
  //       }

  //       hero.assignedQuestId = questId;
  //       quest.assignedHeroIds.push(heroId);
  //       quest.status = QuestStatus.InProgress;
  //       this.quests = this.quests.filter(q => q.id !== questId);
  //       this.quests.push(quest);

  //       return true;
  //     }

  //     return false;
  //   };

  //   assignHeroesToQuest = (heroes: string[], questId: string) => {
  //     // todo: добавить итоговую комиссию в квест, потому что после квеста может измениться уровень героев, что сломает комиссию в результате
  //     heroes.forEach(hero => this.assignHeroToQuest(hero, questId));
  //   };

  //   startQuest = (questId: string, heroIds: string[]) => {
  //     const quest = this.quests.find(q => q.id === questId);
  //     if (!quest) throw new Error('Quest not found');

  //     heroIds.forEach((heroId) => {
  //       const hero = this.heroesStore.heroes.find(h => h.id === heroId);
  //       if (!hero) return;
  //       hero.assignedQuestId = questId;

  //       if (!quest.assignedHeroIds.includes(heroId)) {
  //         quest.assignedHeroIds.push(heroId);
  //       }
  //     });

  //     quest.status = QuestStatus.InProgress;
  //     quest.executionDeadline = quest.executionTime;
  //   };

  //   generateRandomQuest = (): IQuest => {

  //     const idx = Math.floor(Math.random() * titles.length);
  //     const reward = this.randomInRange(50, 150);
  //     const deadlineAccept = this.timeStore.absoluteDay + this.randomInRange(3, 5);
  //     const executionTime = this.timeStore.absoluteDay + this.randomInRange(3, 5);

  //     // Требования к статам — чтобы было разное, сделаем рандом в разумных пределах
  //     const multiplier = 1 + this.difficultyStore.difficultyLevel * 0.2;

  //     const requiredStrength = Math.floor(this.randomInRange(5, 15) * multiplier);
  //     const requiredAgility = Math.floor(this.randomInRange(5, 15) * multiplier);
  //     const requiredIntelligence = Math.floor(
  //       this.randomInRange(5, 15) * multiplier,
  //     );

  //     // todo: сюжетные цепочки надо создавать сразу. И показывать каждый новый квест только в том случае, если предыдущий выполнен
  //     for (const chainId in questChainsConfig) {
  //       const stageIndex = this.questChainsProgress[chainId] ?? 0;

  //       if (stageIndex < questChainsConfig[chainId].length) {
  //         console.log(2);
  //         const stage = questChainsConfig[chainId][stageIndex];
  //         this.questChainsProgress[chainId] = stageIndex + 1;

  //         return {
  //           id: crypto.randomUUID(),
  //           dateCreated: this.timeStore.absoluteDay,
  //           title: stage.title,
  //           description: stage.description,
  //           successResult: stage.successResult,
  //           failResult: stage.failResult,
  //           deadlineResult: stage.deadlineResult,
  //           reward: this.randomInRange(stage.rewardMin, stage.rewardMax),
  //           assignedHeroIds: [],
  //           completed: false,
  //           deadlineAccept,
  //           requiredStrength: this.randomInRange(...stage.reqStats.str),
  //           requiredAgility: this.randomInRange(...stage.reqStats.agi),
  //           requiredIntelligence: this.randomInRange(...stage.reqStats.int),
  //           status: QuestStatus.NotStarted,
  //           executionTime: 10,
  //           executionDeadline: null,
  //         };
  //       } else {
  //         console.log(3);
  //       }
  //     }

  //     // 🎲 Генерация штрафов
  //     const shouldHavePenalty = Math.random() < 0.7; // 70% шанс на штраф

  //     let resourcePenalty;

  //     if (shouldHavePenalty) {
  //       const baseMultiplier = 1 + this.difficultyStore.difficultyLevel * 0.3;

  //       const goldLoss = this.randomInRange(10, 50) * baseMultiplier;
  //       const injuryChance = this.randomInRange(10, 50) * baseMultiplier;
  //       const itemLossChance
  //         = Math.random() < 0.3 ? this.randomInRange(10, 30) : 0;

  //       resourcePenalty = {
  //         goldLoss: Math.round(goldLoss),
  //         injuryChance: Math.min(Math.round(injuryChance), 100),
  //         itemLossChance: Math.round(itemLossChance),
  //       };
  //     }

  //     return {
  //       id: crypto.randomUUID(),
  //       dateCreated: this.timeStore.absoluteDay,
  //       title: titles[idx],
  //       description: descriptions[idx],
  //       successResult: successResults[idx],
  //       failResult: failResults[idx],
  //       deadlineResult: timeoutResults[idx],
  //       reward,
  //       assignedHeroIds: [],
  //       completed: false,
  //       deadlineAccept,
  //       executionTime,
  //       executionDeadline: null,
  //       requiredStrength,
  //       requiredAgility,
  //       requiredIntelligence,
  //       status: QuestStatus.NotStarted,
  //       resourcePenalty,
  //     };
  //   };

  //   get sortedQuests() {
  //     return this.quests.slice().sort((a, b) => {
  //       if (
  //         a.status === QuestStatus.NotStarted
  //         && b.status !== QuestStatus.NotStarted
  //       ) {
  //         return -1; // a раньше b
  //       }

  //       if (
  //         b.status === QuestStatus.NotStarted
  //         && a.status !== QuestStatus.NotStarted
  //       ) {
  //         return 1; // b раньше a
  //       }

  //       return a.deadlineAccept - b.deadlineAccept; // сортируем по дедлайну
  //     });
  //   }

  //   get activeQuests() {
  //     return this.sortQuestsByDate(
  //       this.quests.filter(q => q.status === QuestStatus.InProgress),
  //     );
  //   }

  //   get completedQuests() {
  //     return this.sortQuestsByDate(
  //       this.quests.filter(
  //         q =>
  //           q.status === QuestStatus.CompletedSuccess
  //           || q.status === QuestStatus.CompletedFail,
  //       ),
  //     );
  //   }

  //   sortQuestsByDate = (quests: IQuest[]) => {
  //     return quests.slice().sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
  //   };

//   get newQuests() {
//     return this.sortQuestsByDate(
//       this.quests.filter(q => q.status === QuestStatus.NotStarted),
//     );
//   }
}
