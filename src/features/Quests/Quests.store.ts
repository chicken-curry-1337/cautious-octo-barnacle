import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { modifiers as questModifiers } from '../../assets/modifiers/modifiers';
import { GUILD_RESOURCES } from '../../assets/resources/resources';
import { evaluatePartySynergy } from '../../assets/traits/traitSynergies';
import { UPGRADE_1_ID } from '../../assets/upgrades/upgrades';
import { DifficultyStore } from '../../entities/Difficulty/Difficulty.store';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import { GameStateStore } from '../../entities/GameState/GameStateStore';
import type { HeroStore } from '../../entities/Hero/Hero.store';
import { TimeStore } from '../../entities/TimeStore/TimeStore';
import { UpgradeStore } from '../../entities/Upgrade/Upgrade.store';
import { HeroesStore } from '../../features/Heroes/Heroes.store';
import { QuestStatus, type IQuest } from '../../shared/types/quest';
import { randomInRange } from '../../shared/utils/randomInRange';
// import { questChainsConfig } from '../QuestChains/QuestChains.store';

// todo: refactor accord to FSD
@singleton()
export class QuestsStore {
  quests: IQuest[] = [];
  questChainsProgress: Record<string, number> = { slime: 0 };

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(HeroesStore) public heroesStore: HeroesStore,
    @inject(DifficultyStore) public difficultyStore: DifficultyStore,
    @inject(GameStateStore) public gameStateStore: GameStateStore,
    @inject(UpgradeStore) public upgradeStore: UpgradeStore,
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
        this.onNextDay();
      },
    );
  }

  takeQuestIntoWork = (quest: IQuest) => {
    this.quests.push(quest);
  };

  get boardUnlocked() {
    return this.upgradeStore.upgradeMap[UPGRADE_1_ID]?.done ?? false;
  }

  private get maxContractBoardSlots() {
    if (!this.boardUnlocked) return 0;
    const baseSlots = 5;
    const additional = this.upgradeStore.getNumericEffectMax('contract_board_slots');

    return baseSlots + additional;
  }

  private get failRefundMultiplier() {
    return this.upgradeStore.getNumericEffectMax('fail_refund_mult');
  }

  private get maxParallelMissions() {
    const base = 1;
    const direct = this.upgradeStore.getNumericEffectMax('parallel_missions');
    const bonus = this.upgradeStore.getNumericEffectSum('parallel_missions_bonus');
    const queue = this.upgradeStore.getNumericEffectSum('queue_missions');

    return Math.max(base, direct, base + bonus, base + queue, direct + queue);
  }

  get activeMissionsLimit() {
    return this.maxParallelMissions;
  }

  get currentActiveMissions() {
    return this.quests.filter(q => q.status === QuestStatus.InProgress).length;
  }

  private get travelTimeMultiplier() {
    return this.upgradeStore.getNumericEffectProduct('travel_time_mult');
  }

  private get legalRewardMultiplier() {
    return this.upgradeStore.getNumericEffectProduct('legal_reward_mult');
  }

  private get illegalRewardMultiplier() {
    return this.upgradeStore.getNumericEffectProduct('illegal_reward_mult');
  }

  private get injuryChanceMultiplierFromUpgrades() {
    return this.upgradeStore.getNumericEffectProduct('injury_chance_mult');
  }

  private get injuryDurationMultiplier() {
    return this.upgradeStore.getNumericEffectProduct('injury_days_mult');
  }

  private get injuryProtectChance() {
    return this.upgradeStore.getNumericEffectMax('injury_fail_protect_chance');
  }

  private get heatOnFailMultiplier() {
    return this.upgradeStore.getNumericEffectProduct('heat_on_fail_mult');
  }

  private get evidenceCleanupChance() {
    return this.upgradeStore.getNumericEffectMax('fail_evidence_cleanup_chance');
  }

  get maxPartySize() {
    const base = 3;
    const bonus = this.upgradeStore.getNumericEffectSum('party_size_max_bonus');

    return base + bonus;
  }

  private get xpGainMultiplier() {
    return Math.max(1, this.upgradeStore.getNumericEffectProduct('xp_gain_mult'));
  }

  private computePartySynergy = (heroes: HeroStore[]): ReturnType<typeof evaluatePartySynergy> => {
    if (!heroes.length) {
      return { successBonus: 0, injuryMultiplier: 1, notes: [] };
    }

    const traitSets = heroes.map(hero => hero.traits ?? []);

    return evaluatePartySynergy(traitSets);
  };

  getPartySynergySummary = (heroIds: string[]) => {
    if (!heroIds.length) {
      return { successBonus: 0, injuryMultiplier: 1, notes: [] };
    }

    const heroes = this.heroesStore.heroes.filter(hero => heroIds.includes(hero.id));

    return this.computePartySynergy(heroes);
  };

  createQuest = (
    title: string,
    description: string,
    successResult: string,
    deadlineResult: string,
    failResult: string,
    timeoutResult: string,
    reward?: number,
    options?: {
      isStory?: boolean;
      resourceRewards?: Record<string, number>;
      requiredResources?: Record<string, number>;
      isIllegal?: boolean;
    },
  ) => {
    const questReward = reward ?? randomInRange(50, 150);
    if (!this.boardUnlocked && !options?.isStory) return;
    const deadlineAccept = this.timeStore.absoluteDay + randomInRange(3, 5); // срок на принятие
    const executionTime = randomInRange(2, 4); // дни на выполнение после старта

    const requiredStrength = randomInRange(5, 15);
    const requiredAgility = randomInRange(5, 15);
    const requiredIntelligence = randomInRange(5, 15);

    const newQuest: IQuest = {
      id: crypto.randomUUID(),
      title,
      description,
      dateCreated: this.timeStore.absoluteDay,
      reward: questReward,
      assignedHeroIds: [],
      completed: false,
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
      deadlineAccept,
      executionTime,
      executionDeadline: null,
      timeoutResult,
      failResult,
      deadlineResult,
      successResult,
      status: QuestStatus.NotStarted,
      modifiers: [],
      resourceRewards: options?.resourceRewards ?? {},
      requiredResources: options?.requiredResources ?? {},
      isStory: options?.isStory ?? false,
      isIllegal: options?.isIllegal ?? false,
    };
    this.quests.push(newQuest);
  };

  onNextDay = () => {
    if (!this.boardUnlocked) {
      this.quests = this.quests.filter(q => q.status !== QuestStatus.NotStarted || q.isStory);

      return;
    }

    this.quests = this.quests.filter((quest) => {
      // Проверка на истечение времени принятия
      if (quest.status === QuestStatus.NotStarted && this.timeStore.absoluteDay > quest.deadlineAccept) {
        quest.status = QuestStatus.FailedDeadline;

        return false;
      }

      // Для выполненных заданий Проверка на истечение времени выполнения
      if (quest.status === QuestStatus.InProgress && quest.executionDeadline && this.timeStore.absoluteDay >= quest.executionDeadline) {
        // Проверяем требования
        const chance = this.getNewQuestSuccessChance(quest.id);
        const roll = Math.random() * 100;
        const success = roll <= chance;

        const assignedHeroes = this.heroesStore.heroes.filter(h =>
          quest.assignedHeroIds.includes(h.id),
        );
        const synergy = this.computePartySynergy(assignedHeroes);

        if (success) {
          quest.status = QuestStatus.CompletedSuccess;
          quest.completed = true;
          const heroComission = assignedHeroes.reduce(
            (sum, h) => sum + (h.minStake ?? 0),
            0,
          );
          console.log(`hero comission: ${heroComission}`);
          const rewardWithBonus = Math.round(quest.reward * this.gameStateStore.questRewardMultiplier);
          const rewardMultiplier = quest.isIllegal ? this.illegalRewardMultiplier : this.legalRewardMultiplier;
          const rewardWithUpgrades = Math.round(rewardWithBonus * rewardMultiplier);
          this.financeStore.addGold(rewardWithUpgrades - heroComission);
          console.log(`hero comission: ${heroComission}`);
          this.grantQuestResources(quest);

          if (quest.isStory) {
            this.difficultyStore.onStoryQuestCompleted();
          }
        } else if (!success) {
          quest.status = QuestStatus.CompletedFail;
          quest.completed = true;

          if (quest.resourcePenalty?.goldLoss) {
            this.financeStore.spendGold(quest.resourcePenalty.goldLoss);
          }

          if (quest.resourcePenalty?.injuryChance) {
            assignedHeroes.forEach((hero) => {
              const roll = Math.random() * 100;
              const injuryChanceMultiplier = this.gameStateStore.injuryChanceMultiplier
                * this.injuryChanceMultiplierFromUpgrades
                * synergy.injuryMultiplier;
              const injuryChance = Math.min(
                100,
                quest.resourcePenalty!.injuryChance! * injuryChanceMultiplier,
              );

              if (roll < injuryChance) {
                const protectChance = this.injuryProtectChance;

                if (protectChance > 0 && Math.random() < protectChance) {
                  return;
                }

                hero.injured = true; // можно ввести такую механику
                hero.injuredTimeout = Math.max(
                  1,
                  Math.ceil(5 * this.injuryDurationMultiplier),
                );
              }
            });
          }

          const refund = this.failRefundMultiplier > 0
            ? Math.round(quest.reward * this.failRefundMultiplier)
            : 0;

          if (refund > 0) {
            this.financeStore.addGold(refund);
          }

          const cleanupChance = this.evidenceCleanupChance;

          if (Math.random() > cleanupChance) {
            const baseHeat = quest.isIllegal ? 10 : 4;
            const heatGain = Math.round(baseHeat * this.heatOnFailMultiplier);

            if (heatGain > 0) {
              this.gameStateStore.addHeat(heatGain);
            }
          }
        }

        if (success) {
          this.grantHeroExperience(assignedHeroes);
        }
        assignedHeroes.forEach(h => h.assignedQuestId = null);

        return true;
      }

      // дедлайн еще не наступил - оставляем
      return true;
    });

    this.quests = this.quests.filter(
      q => q.status !== QuestStatus.FailedDeadline,
    );

    const QUEST_LENGTH_MAX = this.maxContractBoardSlots;
    const QUEST_GENERATE_COUNT = this.maxContractBoardSlots;

    if (this.newQuests.length < QUEST_LENGTH_MAX) {
      const newQuestsCount = Math.floor(
        Math.random() * (QUEST_GENERATE_COUNT - this.newQuests.length),
      );

      for (let i = 0; i < newQuestsCount; i++) {
        const quest = this.generateRandomQuest();
        this.quests.push(quest);
      }
    }
  };

  completeQuest = (questId: string) => {
    const quest = this.quests.find(q => q.id === questId);

    if (quest && !quest.completed) {
      quest.status = QuestStatus.CompletedSuccess;
      quest.completed = true;

      const assignedHeroes = this.heroesStore.heroes.filter(h =>
        quest.assignedHeroIds.includes(h.id),
      );
      const totalMinStake = assignedHeroes.reduce(
        (sum, hero) => sum + hero.minStake,
        0,
      );
      const rewardWithBonus = Math.round(quest.reward * this.gameStateStore.questRewardMultiplier);
      const rewardMultiplier = quest.isIllegal ? this.illegalRewardMultiplier : this.legalRewardMultiplier;
      const rewardWithUpgrades = Math.round(rewardWithBonus * rewardMultiplier);

      if (rewardWithUpgrades >= totalMinStake) {
        const guildProfit = rewardWithUpgrades - totalMinStake;
        this.financeStore.addGold(guildProfit);
      } else {
        const shortage = totalMinStake - rewardWithUpgrades;

        if (this.financeStore.canAffordGold(shortage)) {
          this.financeStore.spendGold(shortage);
        } else {
          const affordableShortage = Math.min(shortage, this.financeStore.gold);
          this.financeStore.spendGold(affordableShortage);
          console.warn('Гильдия не может полностью покрыть ставки героев!');
        }
      }

      this.grantQuestResources(quest);
      this.grantHeroExperience(assignedHeroes);

      if (quest.isStory) {
        this.difficultyStore.onStoryQuestCompleted();
      }
    }
  };

  getNewQuestSuccessChance = (
    questId: string,
    heroesToAssign?: string[],
  ): number => {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return 0;

    const heroes = heroesToAssign ?? quest.assignedHeroIds;

    const assignedHeroes = this.heroesStore.heroes.filter(h =>
      heroes.includes(h.id),
    );
    if (assignedHeroes.length === 0) return 0;

    const synergy = this.computePartySynergy(assignedHeroes);

    const totalStrength = assignedHeroes.reduce(
      (sum, h) => sum + h.strength,
      0,
    );
    const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
    const totalIntelligence = assignedHeroes.reduce(
      (sum, h) => sum + h.intelligence,
      0,
    );

    const strengthRatio
      = quest.requiredStrength > 0 ? totalStrength / quest.requiredStrength : 1;
    const agilityRatio
      = quest.requiredAgility > 0 ? totalAgility / quest.requiredAgility : 1;
    const intelligenceRatio
      = quest.requiredIntelligence > 0
        ? totalIntelligence / quest.requiredIntelligence
        : 1;

    // Усредняем и ограничиваем максимум 1
    const averageRatio = Math.min(
      (strengthRatio + agilityRatio + intelligenceRatio) / 3,
      1,
    );

    const baseChance = Math.round(averageRatio * 100);
    const bonus = this.gameStateStore.questSuccessChanceBonus
      + this.upgradeStore.getNumericEffectSum('scout_bonus') * 5
      + this.upgradeStore.getNumericEffectSum('formation_bonus') * 3
      + synergy.successBonus;
    const modified = Math.max(0, Math.min(100, baseChance + bonus));

    return modified;
  };

  assignHeroToQuest = (heroId: string, questId: string) => {
    const hero = this.heroesStore.heroes.find(h => h.id === heroId);
    const quest = this.quests.find(q => q.id === questId);

    // todo: выбрасывать ошибки вместо return
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

      if (quest.assignedHeroIds.length >= this.maxPartySize) {
        return false;
      }

      hero.assignedQuestId = questId;
      quest.assignedHeroIds.push(heroId);
      quest.status = QuestStatus.InProgress;
      this.quests = this.quests.filter(q => q.id !== questId);
      this.quests.push(quest);

      return true;
    }

    return false;
  };

  assignHeroesToQuest = (heroes: string[], questId: string) => {
    // todo: добавить итоговую комиссию в квест, потому что после квеста может измениться уровень героев, что сломает комиссию в результате
    heroes.forEach(hero => this.assignHeroToQuest(hero, questId));
  };

  private getRandomModifiers = (): string[] => {
    if (questModifiers.length === 0) return [];

    const maxCount = Math.min(3, questModifiers.length);
    const count = randomInRange(1, maxCount);
    const pool = [...questModifiers];
    const selected: string[] = [];

    for (let i = 0; i < count && pool.length > 0; i++) {
      const totalWeight = pool.reduce(
        (sum, modifier) => sum + (modifier.weight ?? 1),
        0,
      );
      if (totalWeight <= 0) break;

      let roll = Math.random() * totalWeight;
      let index = 0;

      for (; index < pool.length; index++) {
        roll -= pool[index].weight ?? 1;
        if (roll <= 0) break;
      }

      const clampedIndex = Math.min(index, pool.length - 1);
      const [modifier] = pool.splice(clampedIndex, 1);

      if (modifier) selected.push(modifier.id);
    }

    return selected;
  };

  private getRandomResourceRewards = (): Record<string, number> => {
    if (GUILD_RESOURCES.length === 0) return {};

    const maxRewards = Math.min(4, GUILD_RESOURCES.length);
    const count = randomInRange(0, maxRewards);
    if (count === 0) return {};

    const pool = [...GUILD_RESOURCES];
    const rewards: Record<string, number> = {};

    const amountRanges: Record<string, [number, number]> = {
      common: [15, 40],
      uncommon: [8, 20],
      rare: [4, 12],
      exotic: [1, 5],
    };

    for (let i = 0; i < count && pool.length > 0; i++) {
      const index = Math.floor(Math.random() * pool.length);
      const [resource] = pool.splice(index, 1);
      if (!resource) continue;

      const [min, max]
        = amountRanges[resource.rarity] ?? amountRanges.common;
      const amount = randomInRange(min, max);

      if (amount > 0) {
        rewards[resource.id] = amount;
      }
    }

    return rewards;
  };

  private grantHeroExperience = (heroes: HeroStore[]) => {
    const xpMultiplier = this.xpGainMultiplier;
    const baseLevels = Math.floor(xpMultiplier);
    const fractional = xpMultiplier - baseLevels;

    heroes.forEach((hero) => {
      for (let i = 0; i < Math.max(1, baseLevels); i++) {
        hero.increaseLevel();
      }

      if (fractional > 0 && Math.random() < fractional) {
        hero.increaseLevel();
      }
    });
  };

  private grantQuestResources = (quest: IQuest) => {
    if (!quest.resourceRewards) return;

    const entries = Object.entries(quest.resourceRewards).filter(([, amount]) => amount > 0);
    if (entries.length === 0) return;

    entries.forEach(([resourceId, amount]) => {
      const modifiedAmount = Math.round(amount * this.gameStateStore.resourceGainMultiplier);

      if (modifiedAmount > 0) {
        this.financeStore.addResource(resourceId, modifiedAmount);
      }
    });
  };

  rerollNewQuests = (count = 1) => {
    if (!this.boardUnlocked) return false;
    const availableNewQuests = this.newQuests;
    if (availableNewQuests.length === 0) return false;

    const rerollCount = Math.min(count, availableNewQuests.length);
    const baseCost = 25 * rerollCount;
    const discount = this.upgradeStore.getNumericEffectMax('reroll_discount');
    const finalCost = Math.max(0, Math.round(baseCost * (1 - discount)));

    if (!this.financeStore.canAffordGold(finalCost)) return false;
    this.financeStore.spendGold(finalCost);

    for (let i = 0; i < rerollCount; i++) {
      const questToReplace = availableNewQuests[i];
      this.quests = this.quests.filter(q => q.id !== questToReplace.id);
      this.quests.push(this.generateRandomQuest());
    }

    return true;
  };

  startQuest = (questId: string, heroIds: string[]) => {
    console.log(questId, heroIds, this.quests.map(q => q.id));
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) throw new Error('Quest not found');

    if (quest.requiredResources && Object.keys(quest.requiredResources).length > 0) {
      const canAfford = this.financeStore.canAffordResources(quest.requiredResources);

      if (!canAfford) {
        throw new Error('Недостаточно ресурсов для начала задания');
      }

      this.financeStore.spendResources(quest.requiredResources);
    }

    if (!this.boardUnlocked) {
      throw new Error('Доска объявлений не построена. Постройте её, чтобы брать задания.');
    }

    const currentInProgress = this.quests.filter(q => q.status === QuestStatus.InProgress).length;

    if (quest.status === QuestStatus.NotStarted && currentInProgress >= this.maxParallelMissions) {
      throw new Error('Все отряды заняты. Расширьте инфраструктуру гильдии.');
    }

    heroIds.forEach((heroId) => {
      const hero = this.heroesStore.heroes.find(h => h.id === heroId);
      if (!hero) return;
      hero.assignedQuestId = questId;

      if (!quest.assignedHeroIds.includes(heroId)) {
        quest.assignedHeroIds.push(heroId);
      }
    });

    quest.status = QuestStatus.InProgress;
    const effectiveDuration = Math.max(1, Math.ceil(quest.executionTime * this.travelTimeMultiplier));
    quest.executionDeadline = this.timeStore.absoluteDay + effectiveDuration;
  };

  generateRandomQuest = (): IQuest => {
    const titles = [
      'Спасти деревню',
      'Найти древний артефакт',
      'Защитить караван',
      'Исследовать заброшенный храм',
      'Поймать разбойников',
    ];

    const descriptions = [
      'Деревня подвергается нападениям бандитов. Нужно защитить жителей.',
      'Артефакт обладает магической силой и должен быть возвращён в гильдию.',
      'Караван с товарами под угрозой нападения, нужна охрана.',
      'В заброшенном храме появляются странные создания, нужно разобраться.',
      'Группа разбойников терроризирует окрестности, необходимо их поймать.',
    ];

    const successResults = [
      'Деревня спасена, жители устроили пир в вашу честь.',
      'Артефакт найден и доставлен в гильдию. Мудрецы уже изучают его свойства.',
      'Караван благополучно добрался до города. Торговцы щедро отблагодарили героев.',
      'Храм очищен от чудовищ. Исследователи гильдии начали его изучение.',
      'Разбойники схвачены и переданы местным властям. Мир восстановлен.',
    ];

    const failResults = [
      'Деревня сожжена, уцелевшие жители в панике бежали.',
      'Артефакт так и не был найден. Его сила может попасть не в те руки.',
      'Караван был разграблен. Остатки сожжены, торговцы разорены.',
      'Герои не вернулись из храма. Оттуда доносятся всё более зловещие звуки.',
      'Разбойники ускользнули и теперь действуют ещё более дерзко.',
    ];

    const timeoutResults = [
      'Пока герои собирались, деревня была уничтожена. Спасать уже некого.',
      'Артефакт исчез из места силы. Кто-то другой успел первым.',
      'Караван ушёл без защиты и был атакован. Остались лишь обугленные повозки.',
      'Существа в храме усилились. Теперь туда не осмеливается сунуться ни один герой.',
      'Разбойники ушли в подполье. Теперь их будет куда сложнее выследить.',
    ];

    const idx = Math.floor(Math.random() * titles.length);
    const reward = randomInRange(50, 150);
    const deadlineAccept = this.timeStore.absoluteDay + randomInRange(3, 5);
    const executionTime = randomInRange(3, 5);

    // Требования к статам — чтобы было разное, сделаем рандом в разумных пределах
    const multiplier = 1 + this.difficultyStore.difficultyLevel * 0.2;

    const requiredStrength = Math.floor(randomInRange(5, 15) * multiplier);
    const requiredAgility = Math.floor(randomInRange(5, 15) * multiplier);
    const requiredIntelligence = Math.floor(
      randomInRange(5, 15) * multiplier,
    );

    // todo: сюжетные цепочки надо создавать сразу. И показывать каждый новый квест только в том случае, если предыдущий выполнен
    // for (const chainId in questChainsConfig) {
    //   const stageIndex = this.questChainsProgress[chainId] ?? 0;

    //   if (stageIndex < questChainsConfig[chainId].length) {
    //     console.log(2);
    //     const stage = questChainsConfig[chainId][stageIndex];
    //     this.questChainsProgress[chainId] = stageIndex + 1;

    //     return {
    //       id: crypto.randomUUID(),
    //       dateCreated: this.timeStore.absoluteDay,
    //       title: stage.title,
    //       description: stage.description,
    //       successResult: stage.successResult,
    //       failResult: stage.failResult,
    //       deadlineResult: stage.deadlineResult,
    //       reward: randomInRange(stage.rewardMin, stage.rewardMax),
    //       assignedHeroIds: [],
    //       completed: false,
    //       deadlineAccept,
    //       timeoutResult: '',
    //       requiredStrength: randomInRange(...stage.reqStats.str),
    //       requiredAgility: randomInRange(...stage.reqStats.agi),
    //       requiredIntelligence: randomInRange(...stage.reqStats.int),
    //       status: QuestStatus.NotStarted,
    //       executionTime: 10,
    //       executionDeadline: null,
    //     };
    //   } else {
    //     console.log(3);
    //   }
    // }

    // 🎲 Генерация штрафов
    const penaltyBaseChance = 0.7;
    const penaltyChanceModifier = this.upgradeStore.getNumericEffectProduct('rare_contract_chance_mult');
    const shouldHavePenalty = Math.random() < penaltyBaseChance / Math.max(1, penaltyChanceModifier);

    const isIllegal = Math.random() < 0.35;

    let resourcePenalty;

    if (shouldHavePenalty) {
      const baseMultiplier = 1 + this.difficultyStore.difficultyLevel * 0.3;

      const goldLoss = randomInRange(10, 50) * baseMultiplier;
      const injuryChance = randomInRange(10, 50) * baseMultiplier;
      const itemLossChance
        = Math.random() < 0.3 ? randomInRange(10, 30) : 0;

      resourcePenalty = {
        goldLoss: Math.round(goldLoss),
        injuryChance: Math.min(Math.round(injuryChance), 100),
        itemLossChance: Math.round(itemLossChance),
      };
    }

    return {
      id: crypto.randomUUID(),
      dateCreated: this.timeStore.absoluteDay,
      title: titles[idx],
      description: descriptions[idx],
      successResult: successResults[idx],
      failResult: failResults[idx],
      deadlineResult: timeoutResults[idx],
      reward,
      assignedHeroIds: [],
      completed: false,
      deadlineAccept,
      executionTime,
      executionDeadline: null,
      timeoutResult: timeoutResults[idx],
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
      modifiers: this.getRandomModifiers(),
      resourceRewards: this.getRandomResourceRewards(),
      requiredResources: {},
      status: QuestStatus.NotStarted,
      isStory: false,
      isIllegal,
      resourcePenalty,
    };
  };

  get sortedQuests() {
    return this.quests.slice().sort((a, b) => {
      if (
        a.status === QuestStatus.NotStarted
        && b.status !== QuestStatus.NotStarted
      ) {
        return -1; // a раньше b
      }

      if (
        b.status === QuestStatus.NotStarted
        && a.status !== QuestStatus.NotStarted
      ) {
        return 1; // b раньше a
      }

      return a.deadlineAccept - b.deadlineAccept; // сортируем по дедлайну
    });
  }

  get activeQuests() {
    return this.sortQuestsByDate(
      this.quests.filter(q => q.status === QuestStatus.InProgress),
    );
  }

  get completedQuests() {
    return this.sortQuestsByDate(
      this.quests.filter(
        q =>
          q.status === QuestStatus.CompletedSuccess
          || q.status === QuestStatus.CompletedFail,
      ),
    );
  }

  sortQuestsByDate = (quests: IQuest[]) => {
    return quests.slice().sort((a, b) => (a.dateCreated > b.dateCreated ? -1 : 1));
  };

  get newQuests() {
    return this.sortQuestsByDate(
      this.quests.filter(q => q.status === QuestStatus.NotStarted),
    );
  }

  getQuestById(questId: string) {
    return this.quests.find(q => q.id === questId) ?? null;
  }
}
