import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { DifficultyStore } from '../../entities/Difficulty/Difficulty.store';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import { TimeStore } from '../../entities/TimeStore/TimeStore';
import { QuestStatus, type IQuest } from '../../shared/types/quest';
import { HeroesStore } from '../Heroes/Heroes.store';

@singleton()
export class QuestStore {
  quests: IQuest[] = [];

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(HeroesStore) public heroesStore: HeroesStore,
    @inject(DifficultyStore) public difficultyStore: DifficultyStore,
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
        this.onNextDay();
      },
    );
  }

  randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  takeQuestIntoWork = (quest: IQuest) => {
    this.quests.push(quest);
  };

  createQuest = (
    title: string,
    description: string,
    successResult: string,
    deadlineResult: string,
    failResult: string,
    reward?: number,
  ) => {
    const questReward = reward ?? this.randomInRange(50, 150);
    const deadlineAccept = this.timeStore.absoluteDay + this.randomInRange(3, 5); // срок на принятие
    const executionTime = this.randomInRange(2, 4); // дни на выполнение после старта

    const requiredStrength = this.randomInRange(5, 15);
    const requiredAgility = this.randomInRange(5, 15);
    const requiredIntelligence = this.randomInRange(5, 15);

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
      failResult,
      deadlineResult,
      successResult,
      status: QuestStatus.NotStarted,
    };
    this.quests.push(newQuest);
  };

  onNextDay = () => {
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

        if (success) {
          quest.status = QuestStatus.CompletedSuccess;
          const heroComission = assignedHeroes.reduce(
            (sum, h) => sum + (h.minStake ?? 0),
            0,
          );
          console.log(`hero comission: ${heroComission}`);
          this.financeStore.addGold(quest.reward - heroComission);
          console.log(`hero comission: ${heroComission}`);
        } else if (!success) {
          quest.status = QuestStatus.CompletedFail;

          if (quest.resourcePenalty?.goldLoss) {
            this.financeStore.spendGold(quest.resourcePenalty.goldLoss);
          }

          if (quest.resourcePenalty?.injuryChance) {
            assignedHeroes.forEach((hero) => {
              const roll = Math.random() * 100;

              if (roll < quest.resourcePenalty!.injuryChance!) {
                hero.injured = true; // можно ввести такую механику
                hero.injuredTimeout = 5;
              }
            });
          }
        }

        assignedHeroes.forEach(h => h.increaseLevel());
        assignedHeroes.forEach(h => h.assignedQuestId = null);

        return true;
      }

      // дедлайн еще не наступил - оставляем
      return true;
    });

    this.quests = this.quests.filter(
      q => q.status !== QuestStatus.FailedDeadline,
    );

    const QUEST_LENGTH_MAX = 5;
    const QUEST_GENERATE_COUNT = 5;

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

    // Возвращаем процент (0–100)
    return Math.round(averageRatio * 100);
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

  startQuest = (questId: string, heroIds: string[]) => {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) throw new Error('Quest not found');

    heroIds.forEach((heroId) => {
      const hero = this.heroesStore.heroes.find(h => h.id === heroId);
      if (!hero) return;
      hero.assignedQuestId = questId;

      if (!quest.assignedHeroIds.includes(heroId)) {
        quest.assignedHeroIds.push(heroId);
      }
    });

    quest.status = QuestStatus.InProgress;
    quest.executionDeadline = quest.executionTime;
  };

  randomInRange = (min: number, max: number): number => {
    const low = Math.ceil(min);
    const high = Math.floor(max);

    return Math.floor(Math.random() * (high - low + 1)) + low;
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
    const reward = this.randomInRange(50, 150);
    const deadlineAccept = this.timeStore.absoluteDay + this.randomInRange(3, 5);
    const rand = this.randomInRange(3, 5);
    console.log(rand);
    const executionTime = this.timeStore.absoluteDay + rand;

    // Требования к статам — чтобы было разное, сделаем рандом в разумных пределах
    const multiplier = 1 + this.difficultyStore.difficultyLevel * 0.2;

    const requiredStrength = Math.floor(this.randomInRange(5, 15) * multiplier);
    const requiredAgility = Math.floor(this.randomInRange(5, 15) * multiplier);
    const requiredIntelligence = Math.floor(
      this.randomInRange(5, 15) * multiplier,
    );

    // 🎲 Генерация штрафов
    const shouldHavePenalty = Math.random() < 0.7; // 70% шанс на штраф

    let resourcePenalty;

    if (shouldHavePenalty) {
      const baseMultiplier = 1 + this.difficultyStore.difficultyLevel * 0.3;

      const goldLoss = this.randomInRange(10, 50) * baseMultiplier;
      const injuryChance = this.randomInRange(10, 50) * baseMultiplier;
      const itemLossChance
        = Math.random() < 0.3 ? this.randomInRange(10, 30) : 0;

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
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
      status: QuestStatus.NotStarted,
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
}
