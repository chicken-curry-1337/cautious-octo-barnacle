import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import {
  GUILD_LEADER_ID,
  GUARD_LEADER_ID,
  MERCHANTS_LEADER_ID,
  CARTEL_LEADER_ID,
  CITIZENS_LEADER_ID,
} from '../../assets/characters/factionLeaders';
import { factionMap, pickFaction, type Faction, type FactionId } from '../../assets/factions/factions';
import { MAIN_HERO_ID } from '../../assets/heroes/mainHero';
import { modifiers as questModifiers } from '../../assets/modifiers/modifiers';
import {
  CITIZEN_TASKS,
  FACTION_CONTRACT_TEMPLATES,
  type CitizenTask,
  type FactionContractTemplate,
  type NonCitizenFactionId,
} from '../../assets/quests/quests';
import { GUILD_RESOURCES } from '../../assets/resources/resources';
import { evaluatePartySynergy } from '../../assets/traits/traitSynergies';
import { UPGRADE_1_ID } from '../../assets/upgrades/upgrades';
import { CityStore } from '../../entities/City/City.store';
import { DifficultyStore } from '../../entities/Difficulty/Difficulty.store';
import { FactionsStore } from '../../entities/Factions/Factions.store';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import { GameStateStore } from '../../entities/GameState/GameStateStore';
import type { HeroStore } from '../../entities/Hero/Hero.store';
import { RelationshipsStore } from '../../entities/Relationships/Relationships.store';
import { TimeStore } from '../../entities/TimeStore/TimeStore';
import { UpgradeStore } from '../../entities/Upgrade/Upgrade.store';
import { HeroesStore } from '../../features/Heroes/Heroes.store';
import { QuestStatus, type IQuest } from '../../shared/types/quest';
import { randomInRange } from '../../shared/utils/randomInRange';
import {
  questChainsConfig,
  type QuestChainDefinition,
  type QuestChainStage,
} from '../QuestChains/QuestChains.store';
// import { questChainsConfig } from '../QuestChains/QuestChains.store';

const DEFAULT_FACTION_REWARD_RANGE: [number, number] = [70, 150];
const DEFAULT_FACTION_DEADLINE_RANGE: [number, number] = [3, 5];
const DEFAULT_FACTION_EXECUTION_RANGE: [number, number] = [3, 5];
const DEFAULT_STAT_REQUIREMENTS = {
  strength: [5, 15] as [number, number],
  agility: [5, 15] as [number, number],
  intelligence: [5, 15] as [number, number],
};

const FACTION_RELATION_TARGETS: Record<FactionId, string> = {
  guild: GUILD_LEADER_ID,
  guard: GUARD_LEADER_ID,
  merchants: MERCHANTS_LEADER_ID,
  cartel: CARTEL_LEADER_ID,
  citizens: CITIZENS_LEADER_ID,
};

const DISTRICT_RELATION_TARGETS: Record<string, string> = {
  harbor: 'caretaker_allen',
  market: 'caretaker_mila',
  crownward: 'caretaker_karen',
  shadows: 'caretaker_shade',
  arcane_spire: 'caretaker_kaia',
  outskirts: 'caretaker_lena',
};
const CITIZEN_DEADLINE_RANGE: [number, number] = [2, 3];
const CITIZEN_EXECUTION_RANGE: [number, number] = [1, 2];
const FALLBACK_CITIZEN_TASK: CitizenTask = {
  title: 'Помочь жителям',
  description: 'Горожане просят гильдию помочь с повседневными заботами.',
  successResult: 'Задача выполнена, жители благодарят гильдию.',
  failResult: 'Жители остались без помощи и разочарованы.',
  timeoutResult: 'Проблему решили другие добровольцы.',
  goldRange: [15, 30],
};

// todo: refactor accord to FSD
@singleton()
export class QuestsStore {
  quests: IQuest[] = [];
  private static readonly CHAIN_REPUTATION_THRESHOLD = 20;
  questChainsProgress: Record<string, number> = Object.keys(questChainsConfig).reduce<Record<string, number>>(
    (acc, chainId) => {
      acc[chainId] = 0;

      return acc;
    },
    {},
  );

  private syncing: boolean = false;

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(HeroesStore) public heroesStore: HeroesStore,
    @inject(DifficultyStore) public difficultyStore: DifficultyStore,
    @inject(GameStateStore) public gameStateStore: GameStateStore,
    @inject(UpgradeStore) public upgradeStore: UpgradeStore,
    @inject(FactionsStore) public factionsStore: FactionsStore,
    @inject(CityStore) public cityStore: CityStore,
    @inject(RelationshipsStore) public relationshipsStore: RelationshipsStore,
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
        if (this.syncing) return;
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
      factionId?: FactionId;
      reputationRequirement?: number;
      successHeatDelta?: number;
      failureHeatDelta?: number;
      districtId?: string;
    },
  ) => {
    const questReward = reward ?? randomInRange(50, 150);
    if (!this.boardUnlocked && !options?.isStory) return;
    const deadlineAccept = this.timeStore.absoluteDay + randomInRange(3, 5); // срок на принятие
    const executionTime = randomInRange(2, 4); // дни на выполнение после старта

    const requiredStrength = randomInRange(5, 15);
    const requiredAgility = randomInRange(5, 15);
    const requiredIntelligence = randomInRange(5, 15);

    const districtId = options?.districtId
      ?? this.cityStore.pickDistrictForFaction(options?.factionId)
      ?? this.cityStore.pickDistrictForFaction(undefined);

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
      factionId: options?.factionId,
      reputationRequirement: options?.reputationRequirement,
      successHeatDelta: options?.successHeatDelta,
      failureHeatDelta: options?.failureHeatDelta,
      districtId: districtId ?? undefined,
    };
    this.applyDistrictFlavor(newQuest, districtId ?? null);
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
        this.applyFactionOutcome(quest, 'timeout');
        this.cityStore.applyQuestOutcome(quest.districtId, 'timeout', quest.title, quest.factionId as FactionId | undefined);

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
          const rewardWithBonus = Math.round(quest.reward * this.gameStateStore.questRewardMultiplier);
          const rewardMultiplier = quest.isIllegal ? this.illegalRewardMultiplier : this.legalRewardMultiplier;
          const rewardWithUpgrades = Math.round(rewardWithBonus * rewardMultiplier);
          this.financeStore.addGold(rewardWithUpgrades, 'quest_reward');
          this.grantQuestResources(quest);
          this.applyFactionOutcome(quest, 'success');
          this.advanceQuestChainProgress(quest);
          this.cityStore.applyQuestOutcome(quest.districtId, 'success', quest.title, quest.factionId as FactionId | undefined);

          if (quest.isStory) {
            this.difficultyStore.onStoryQuestCompleted();
          }
        } else if (!success) {
          quest.status = QuestStatus.CompletedFail;
          quest.completed = true;

          if (quest.resourcePenalty?.goldLoss) {
            this.financeStore.spendGold(quest.resourcePenalty.goldLoss, 'quest_penalty');
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
            this.financeStore.addGold(refund, 'quest_refund');
          }

          const cleanupChance = this.evidenceCleanupChance;

          if (Math.random() > cleanupChance) {
            const baseHeat = quest.isIllegal ? 10 : 4;
            const heatGain = Math.round(baseHeat * this.heatOnFailMultiplier);

            if (heatGain > 0) {
              this.gameStateStore.addHeat(heatGain);
              this.cityStore.applyHeatChange(heatGain);
            }
          }

          this.applyFactionOutcome(quest, 'failure');
          this.cityStore.applyQuestOutcome(quest.districtId, 'failure', quest.title, quest.factionId as FactionId | undefined);
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
        if (quest) this.quests.push(quest);
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
      const rewardWithBonus = Math.round(quest.reward * this.gameStateStore.questRewardMultiplier);
      const rewardMultiplier = quest.isIllegal ? this.illegalRewardMultiplier : this.legalRewardMultiplier;
      const rewardWithUpgrades = Math.round(rewardWithBonus * rewardMultiplier);
      this.financeStore.addGold(rewardWithUpgrades, 'quest_reward');

      this.grantQuestResources(quest);
      this.applyFactionOutcome(quest, 'success');
      this.advanceQuestChainProgress(quest);
      this.cityStore.applyQuestOutcome(quest.districtId, 'success', quest.title, quest.factionId as FactionId | undefined);
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

  private pickCitizenTask = (): CitizenTask | null => {
    if (CITIZEN_TASKS.length === 0) return null;

    const index = randomInRange(0, CITIZEN_TASKS.length - 1);

    return CITIZEN_TASKS[index];
  };

  private buildCitizenResourceRewards = (task: CitizenTask): Record<string, number> => {
    const rewards: Record<string, number> = {};

    if (task.woodRange) {
      const amount = randomInRange(task.woodRange[0], task.woodRange[1]);
      if (amount > 0) rewards.timber = amount;
    }

    if (task.herbRange) {
      const amount = randomInRange(task.herbRange[0], task.herbRange[1]);
      if (amount > 0) rewards.healing_herbs = amount;
    }

    return rewards;
  };

  private resolveFactionTemplate = (faction: Faction): FactionContractTemplate | null => {
    if (faction.id === 'citizens') return null;

    const templates = FACTION_CONTRACT_TEMPLATES[faction.id as NonCitizenFactionId];
    if (!templates || templates.length === 0) return null;

    const index = randomInRange(0, templates.length - 1);

    return templates[index];
  };

  private buildTemplateResourceRewards = (template: FactionContractTemplate | null, multiplier: number): Record<string, number> => {
    if (!template?.resourceRewards) {
      return this.getRandomResourceRewards();
    }

    const rewards: Record<string, number> = {};

    Object.entries(template.resourceRewards).forEach(([resourceId, range]) => {
      const amount = Math.round(randomInRange(range[0], range[1]) * multiplier);

      if (amount > 0) {
        rewards[resourceId] = amount;
      }
    });

    return rewards;
  };

  private buildTemplateRequiredResources = (template: FactionContractTemplate | null): Record<string, number> => {
    if (!template?.requiredResources) return {};

    const requirements: Record<string, number> = {};

    Object.entries(template.requiredResources).forEach(([resourceId, range]) => {
      const amount = Math.round(randomInRange(range[0], range[1]));

      if (amount > 0) {
        requirements[resourceId] = amount;
      }
    });

    return requirements;
  };

  private rollStatRequirement = (range: [number, number], multiplier: number) => {
    const value = randomInRange(range[0], range[1]) * multiplier;

    return Math.max(1, Math.floor(value));
  };

  private rollReward = (range: [number, number], multiplier: number) => {
    return Math.max(0, Math.round(randomInRange(range[0], range[1]) * multiplier));
  };

  private rollResourcePenalty = (): IQuest['resourcePenalty'] | undefined => {
    const penaltyBaseChance = 0.7;
    const penaltyChanceModifier = this.upgradeStore.getNumericEffectProduct('rare_contract_chance_mult');
    const threshold = penaltyBaseChance / Math.max(1, penaltyChanceModifier);
    const shouldHavePenalty = Math.random() < threshold;

    if (!shouldHavePenalty) return undefined;

    const baseMultiplier = 1 + this.difficultyStore.difficultyLevel * 0.3;
    const goldLoss = randomInRange(10, 50) * baseMultiplier;
    const injuryChance = randomInRange(10, 50) * baseMultiplier;
    const itemLossChance = Math.random() < 0.3 ? randomInRange(10, 30) : 0;

    return {
      goldLoss: Math.round(goldLoss),
      injuryChance: Math.min(Math.round(injuryChance), 100),
      itemLossChance: Math.round(itemLossChance),
    };
  };

  private hasActiveChainStage = (chainId: string, stageIndex: number) => {
    return this.quests.some(
      quest =>
        quest.chainId === chainId
        && quest.chainStageIndex === stageIndex
        && (quest.status === QuestStatus.NotStarted || quest.status === QuestStatus.InProgress),
    );
  };

  private createChainQuest = (
    chain: QuestChainDefinition,
    stage: QuestChainStage,
    stageIndex: number,
  ): IQuest => {
    const faction = factionMap[chain.factionId];
    const multiplier = 1 + this.difficultyStore.difficultyLevel * 0.25;
    const deadlineRange = stage.deadlineRange ?? DEFAULT_FACTION_DEADLINE_RANGE;
    const executionRange = stage.executionRange ?? DEFAULT_FACTION_EXECUTION_RANGE;

    const deadlineAccept = this.timeStore.absoluteDay + randomInRange(deadlineRange[0], deadlineRange[1]);
    const executionTime = randomInRange(executionRange[0], executionRange[1]);
    const reward = this.rollReward([stage.rewardMin, stage.rewardMax], multiplier);

    const requiredStrength = randomInRange(stage.reqStats.str[0], stage.reqStats.str[1]);
    const requiredAgility = randomInRange(stage.reqStats.agi[0], stage.reqStats.agi[1]);
    const requiredIntelligence = randomInRange(stage.reqStats.int[0], stage.reqStats.int[1]);

    const resourceRewards = stage.resourceRewards ? { ...stage.resourceRewards } : {};
    const requiredResources = stage.requiredResources ? { ...stage.requiredResources } : {};
    const successHeatDelta = stage.successHeatDelta ?? faction.successHeatDelta;
    const failureHeatDelta = stage.failureHeatDelta ?? faction.failureHeatDelta;

    return {
      id: crypto.randomUUID(),
      dateCreated: this.timeStore.absoluteDay,
      title: stage.title,
      description: stage.description,
      successResult: stage.successResult,
      failResult: stage.failResult,
      deadlineResult: stage.deadlineResult,
      reward,
      assignedHeroIds: [],
      completed: false,
      deadlineAccept,
      executionTime,
      executionDeadline: null,
      timeoutResult: stage.deadlineResult,
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
      modifiers: [],
      resourceRewards,
      requiredResources,
      status: QuestStatus.NotStarted,
      isStory: true,
      isIllegal: stage.isIllegal ?? faction.illegal ?? false,
      factionId: chain.factionId,
      reputationRequirement: Math.max(
        QuestsStore.CHAIN_REPUTATION_THRESHOLD,
        faction.minReputation,
      ),
      successHeatDelta,
      failureHeatDelta,
      successRepDelta: faction.successRepDelta,
      failureRepDelta: faction.failureRepDelta,
      resourcePenalty: undefined,
      chainId: chain.id,
      chainStageIndex: stageIndex,
      unlocksLeader: stage.unlockLeader ?? false,
      chainLeaderName: chain.leaderName,
      chainLeaderTitle: chain.leaderTitle,
      chainTotalStages: chain.stages.length,
      chainLeaderPortrait: chain.leaderPortraitUrl,
      districtId: stage.districtId ?? this.cityStore.pickDistrictForFaction(chain.factionId) ?? undefined,
    };
  };

  private generateChainQuest = (): IQuest | null => {
    for (const chain of Object.values(questChainsConfig)) {
      const progress = this.questChainsProgress[chain.id] ?? 0;
      if (progress >= chain.stages.length) continue;

      const reputation = this.factionsStore.getFactionReputation(chain.factionId);
      if (reputation < QuestsStore.CHAIN_REPUTATION_THRESHOLD) continue;

      if (this.hasActiveChainStage(chain.id, progress)) continue;

      const stage = chain.stages[progress];

      return this.createChainQuest(chain, stage, progress);
    }

    return null;
  };

  private advanceQuestChainProgress = (quest: IQuest) => {
    if (!quest.chainId) return;
    const chain = questChainsConfig[quest.chainId];
    if (!chain) return;

    const currentIndex = quest.chainStageIndex ?? 0;
    const nextIndex = Math.max(this.questChainsProgress[quest.chainId] ?? 0, currentIndex + 1);
    this.questChainsProgress[quest.chainId] = Math.min(nextIndex, chain.stages.length);

    if (quest.unlocksLeader) {
      this.factionsStore.unlockFactionLeader(chain.factionId);
    }
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

  private adjustFactionRelationship = (quest: IQuest, outcome: 'success' | 'failure' | 'timeout') => {
    const leaderTargets = new Set<string>();
    const caretakerTargets = new Set<string>();

    const factionId = quest.factionId as FactionId | undefined;

    if (factionId) {
      const leaderId = FACTION_RELATION_TARGETS[factionId];
      if (leaderId) {
        leaderTargets.add(leaderId);
      }
    }

    if (quest.chainId) {
      const chain = questChainsConfig[quest.chainId];
      if (chain) {
        const leaderId = FACTION_RELATION_TARGETS[chain.factionId];
        if (leaderId) {
          leaderTargets.add(leaderId);
        }
      }
    }

    if (quest.districtId) {
      const caretakerId = DISTRICT_RELATION_TARGETS[quest.districtId];
      if (caretakerId) {
        caretakerTargets.add(caretakerId);
      }
    }

    if (leaderTargets.size === 0 && caretakerTargets.size === 0) {
      return;
    }

    const relationDeltas = {
      success: { leader: 8, caretaker: 6 },
      failure: { leader: -10, caretaker: -7 },
      timeout: { leader: -6, caretaker: -5 },
    } as const;

    const deltas = relationDeltas[outcome];

    leaderTargets.forEach((targetId) => {
      this.relationshipsStore.changeRelationship(targetId, deltas.leader);
    });

    caretakerTargets.forEach((targetId) => {
      this.relationshipsStore.changeRelationship(targetId, deltas.caretaker);
    });
  };

  private applyFactionOutcome = (quest: IQuest, outcome: 'success' | 'failure' | 'timeout') => {
    if (!quest.factionId) return;

    const factionId = quest.factionId as FactionId;
    const faction = factionMap[factionId];
    if (!faction) return;

    this.adjustFactionRelationship(quest, outcome);

    const heroismDelta = this.computeHeroismDelta(quest, outcome);

    if (heroismDelta) {
      this.gameStateStore.changeHeroism(heroismDelta);
    }

    if (outcome === 'timeout') {
      return;
    }

    if (outcome === 'success') {
      const successRepDelta = quest.successRepDelta ?? faction.successRepDelta;

      if (successRepDelta) {
        this.factionsStore.changeFactionReputation(factionId, successRepDelta);
      }
      const heatDelta = quest.successHeatDelta ?? faction.successHeatDelta ?? 0;

      if (heatDelta) {
        this.gameStateStore.applyHeatDelta(heatDelta);
        this.cityStore.applyHeatChange(heatDelta);
      }

      return;
    }

    const failureRepDelta = quest.failureRepDelta ?? faction.failureRepDelta;

    if (failureRepDelta) {
      this.factionsStore.changeFactionReputation(factionId, failureRepDelta);
    }
    const heatDelta = quest.failureHeatDelta ?? faction.failureHeatDelta ?? 0;

    if (heatDelta) {
      this.gameStateStore.applyHeatDelta(heatDelta);
      this.cityStore.applyHeatChange(heatDelta);
    }
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
      const replacement = this.generateRandomQuest();
      if (replacement) this.quests.push(replacement);
    }

    return true;
  };

  startQuest = (questId: string, heroIds: string[]) => {
    console.log(questId, heroIds, this.quests.map(q => q.id));
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) throw new Error('Quest not found');

    if (
      quest.chainId
      && !heroIds.includes(MAIN_HERO_ID)
      && !quest.assignedHeroIds.includes(MAIN_HERO_ID)
    ) {
      throw new Error('Главный герой должен быть в составе, чтобы начать цепочку заданий.');
    }

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

  private createCitizenQuest = (faction: Faction): IQuest => {
    const task = this.pickCitizenTask() ?? FALLBACK_CITIZEN_TASK;

    const deadlineAccept = this.timeStore.absoluteDay + randomInRange(
      CITIZEN_DEADLINE_RANGE[0],
      CITIZEN_DEADLINE_RANGE[1],
    );
    const executionTime = randomInRange(
      CITIZEN_EXECUTION_RANGE[0],
      CITIZEN_EXECUTION_RANGE[1],
    );

    const requiredStrength = randomInRange(2, 6);
    const requiredAgility = randomInRange(2, 6);
    const requiredIntelligence = randomInRange(2, 6);

    const resourceRewards = this.buildCitizenResourceRewards(task);
    const districtId = task.districtId
      ?? this.cityStore.pickDistrictForFaction(faction.id)
      ?? this.cityStore.pickDistrictForFaction('citizens');

    const quest: IQuest = {
      id: crypto.randomUUID(),
      dateCreated: this.timeStore.absoluteDay,
      title: task.title,
      description: task.description,
      successResult: task.successResult,
      failResult: task.failResult,
      deadlineResult: task.timeoutResult,
      reward: this.rollReward(task.goldRange, 1),
      assignedHeroIds: [],
      completed: false,
      deadlineAccept,
      executionTime,
      executionDeadline: null,
      timeoutResult: task.timeoutResult,
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
      modifiers: [],
      resourceRewards,
      requiredResources: {},
      status: QuestStatus.NotStarted,
      isStory: false,
      isIllegal: false,
      factionId: faction.id,
      reputationRequirement: faction.minReputation,
      successHeatDelta: faction.successHeatDelta,
      failureHeatDelta: faction.failureHeatDelta,
      districtId: districtId ?? undefined,
    };

    this.applyDistrictFlavor(quest, districtId ?? null);

    return quest;
  };

  private createFactionQuest = (faction: Faction): IQuest => {
    const template = this.resolveFactionTemplate(faction);
    const multiplier = 1 + this.difficultyStore.difficultyLevel * 0.25;

    const deadlineRange = template?.deadlineRange ?? DEFAULT_FACTION_DEADLINE_RANGE;
    const executionRange = template?.executionRange ?? DEFAULT_FACTION_EXECUTION_RANGE;

    const deadlineAccept = this.timeStore.absoluteDay + randomInRange(deadlineRange[0], deadlineRange[1]);
    const executionTime = randomInRange(executionRange[0], executionRange[1]);

    const rewardRange = template?.goldRange ?? DEFAULT_FACTION_REWARD_RANGE;
    const reward = this.rollReward(rewardRange, multiplier);

    const stats = template?.stats ?? DEFAULT_STAT_REQUIREMENTS;
    const requiredStrength = this.rollStatRequirement(stats.strength, multiplier);
    const requiredAgility = this.rollStatRequirement(stats.agility, multiplier);
    const requiredIntelligence = this.rollStatRequirement(stats.intelligence, multiplier);

    const resourcePenalty = this.rollResourcePenalty();
    const resourceRewards = this.buildTemplateResourceRewards(template, multiplier);
    const requiredResources = this.buildTemplateRequiredResources(template);

    const successHeatDelta = template?.successHeatDelta ?? faction.successHeatDelta;
    const failureHeatDelta = template?.failureHeatDelta ?? faction.failureHeatDelta;
    const districtId = template?.districtId
      ?? this.cityStore.pickDistrictForFaction(faction.id);

    const quest: IQuest = {
      id: crypto.randomUUID(),
      dateCreated: this.timeStore.absoluteDay,
      title: template?.title ?? 'Контракт фракции',
      description: template?.description ?? 'Фракция предлагает контракт со стандартными условиями.',
      successResult: template?.successResult ?? 'Контракт выполнен, доверие укрепилось.',
      failResult: template?.failResult ?? 'Контракт сорван, отношения ухудшились.',
      deadlineResult: template?.timeoutResult ?? 'Фракция нашла других исполнителей.',
      reward,
      assignedHeroIds: [],
      completed: false,
      deadlineAccept,
      executionTime,
      executionDeadline: null,
      timeoutResult: template?.timeoutResult ?? 'Контракт больше не актуален.',
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
      modifiers: this.getRandomModifiers(),
      resourceRewards,
      requiredResources,
      status: QuestStatus.NotStarted,
      isStory: false,
      isIllegal: template?.illegalOverride ?? (faction.illegal ?? false),
      factionId: faction.id,
      reputationRequirement: faction.minReputation,
      successHeatDelta,
      failureHeatDelta,
      successRepDelta: template?.successRepDelta,
      failureRepDelta: template?.failureRepDelta,
      resourcePenalty,
      districtId: districtId ?? undefined,
    };

    this.applyDistrictFlavor(quest, districtId ?? null);

    return quest;
  };

  generateRandomQuest = (): IQuest | null => {
    const chainQuest = this.generateChainQuest();
    if (chainQuest) return chainQuest;

    const faction = pickFaction(this.factionsStore.reputation, this.gameStateStore.heat);
    if (!faction) return null;

    if (faction.id === 'citizens') {
      return this.createCitizenQuest(faction);
    }

    return this.createFactionQuest(faction);
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

  setSyncing = (value: boolean) => {
    this.syncing = value;
  };

  loadSnapshot = (snapshot: QuestsSnapshot) => {
    const knownHeroIds = new Set(this.heroesStore.heroes.map(hero => hero.id));

    this.quests = (snapshot.quests ?? []).map(quest => ({
      ...quest,
      modifiers: quest.modifiers ?? [],
      assignedHeroIds: (quest.assignedHeroIds ?? []).filter(id => knownHeroIds.has(id)),
      resourceRewards: quest.resourceRewards ?? {},
      requiredResources: quest.requiredResources ?? {},
    }));

    const progress: Record<string, number> = {};
    Object.keys(questChainsConfig).forEach((chainId) => {
      progress[chainId] = snapshot.questChainsProgress?.[chainId] ?? 0;
    });
    this.questChainsProgress = progress;
  };

  private computeHeroismDelta = (quest: IQuest, outcome: 'success' | 'failure' | 'timeout'): number => {
    const factionId = quest.factionId as FactionId | undefined;
    const isIllegal = quest.isIllegal ?? false;

    const matrix: Record<'guard' | 'citizens' | 'guild' | 'merchants' | 'cartel' | 'neutral', { success: number; failure: number; timeout: number }> = {
      guard: { success: 45, failure: -30, timeout: -18 },
      citizens: { success: 35, failure: -22, timeout: -14 },
      guild: { success: 22, failure: -12, timeout: -8 },
      merchants: { success: 18, failure: -10, timeout: -6 },
      cartel: { success: -40, failure: 22, timeout: 10 },
      neutral: { success: 10, failure: -6, timeout: -4 },
    };

    const key: keyof typeof matrix = factionId && matrix[factionId as keyof typeof matrix]
      ? factionId as keyof typeof matrix
      : 'neutral';

    const baseDelta = matrix[key][outcome];
    if (!baseDelta) return 0;

    const illegalModifier = isIllegal
      ? (outcome === 'success' ? -20 : outcome === 'failure' ? 12 : -6)
      : 0;

    return baseDelta + illegalModifier;
  };

  private applyDistrictFlavor = (quest: IQuest, districtId: string | null) => {
    if (!districtId) return;
    const district = this.cityStore.getDistrictById(districtId);
    if (!district) return;

    const replaceText = (text?: string | null) => {
      if (!text) return text;

      return text.replace(/\{\{district\}\}/g, district.name);
    };

    quest.title = replaceText(quest.title) ?? quest.title;
    quest.description = replaceText(quest.description) ?? quest.description;
    quest.successResult = replaceText(quest.successResult) ?? quest.successResult;
    quest.failResult = replaceText(quest.failResult) ?? quest.failResult;
    quest.deadlineResult = replaceText(quest.deadlineResult) ?? quest.deadlineResult;
    quest.timeoutResult = replaceText(quest.timeoutResult) ?? quest.timeoutResult;
  };
}

export type QuestsSnapshot = {
  quests?: IQuest[];
  questChainsProgress?: Record<string, number>;
};
