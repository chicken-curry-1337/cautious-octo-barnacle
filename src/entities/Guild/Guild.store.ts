import { makeAutoObservable, reaction, runInAction, toJS } from 'mobx';
import { TimeStore } from '../TimeStore/TimeStore';
import { inject, singleton } from 'tsyringe';
import { GuildFinanceStore } from '../Finance/Finance.store';

// Типы героя
export type HeroType = 'warrior' | 'mage' | 'rogue';

export interface Hero {
  id: string;
  name: string;
  level: number;
  assignedQuestId: string | null;

  strength: number;
  agility: number;
  intelligence: number;
  type: HeroType;
  description: string;
   minStake: number;
}

export interface RecruitCandidate extends Hero {
  daysRemaining: number;
  recruitCost: number;
}

export enum QuestStatus {
    NotStarted = 'NotStarted',
    InProgress = 'InProgress',
    CompletedSuccess = 'CompletedSuccess',
    CompletedFail = 'CompletedFail',
    FailedDeadline = 'FailedDeadline',
    Cancelled = 'Cancelled', // если понадобится
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  successResult: string;
  failResult: string;
  deadlineResult: string;
  reward: number;
  assignedHeroIds: string[];
  completed: boolean;
  failed?: boolean;
  deadlineDay: number; // День, до которого нужно выполнить
  requiredStrength: number;
  requiredAgility: number;
  requiredIntelligence: number;
  status: QuestStatus;
}

@singleton()
export class GuildStore {
  heroes: Hero[] = [];
  quests: Quest[] = [];
  candidates: RecruitCandidate[] = [];
  funnyDescriptionsByType: Record<HeroType, string[]> = {
    warrior: [
      'Когда-то пытался стать бардом, но медведь украл его лютню.',
      'Уверен, что его меч — это на самом деле дракон.',
      'Мастер маскировки. Теряется даже в очереди.',
    ],
    mage: [
      'Считает, что огненные шары — отличный способ готовить завтрак.',
      'Скрывается от налоговой магов.',
      'Говорит с крысами. Иногда они отвечают.',
    ],
    rogue: [
      'Никогда не снимает капюшон. Даже в бане.',
      'Считает себя экспертом в побеге от драконов. Успешным — один раз.',
      'Пытался однажды приручить тролля. У тролля теперь травма.',
    ],
  };

  constructor(@inject(TimeStore) public timeStore: TimeStore, @inject(GuildFinanceStore) public financeStore: GuildFinanceStore) {
    makeAutoObservable(this);

    reaction(() => this.timeStore.currentDay, () => {
        this.onNextDay();
    })

    reaction(() => this.heroes, (heroes) => {
        runInAction(() => {
            console.log({heroes: toJS(heroes)});
        })
    })
  }

 createHero = (name: string, type: HeroType) => {
  const stats = this.generateRandomStats(type);
  const level = 1;
  const minStake = this.calculateMinStake(level, type);

  const newHero: Hero = {
    id: crypto.randomUUID(),
    name,
    type,
    level,
    assignedQuestId: null,
    ...stats,
    minStake,
  };
  this.heroes.push(newHero);
}

  createQuest = (title: string, description: string, reward?: number) =>{
  const questReward = reward ?? this.randomInRange(50, 150);
  const deadlineDay = this.timeStore.currentDay + this.randomInRange(3, 5);

  // Требования к статам — чтобы было разное, сделаем рандом в разумных пределах
  const requiredStrength = this.randomInRange(5, 15);
  const requiredAgility = this.randomInRange(5, 15);
  const requiredIntelligence = this.randomInRange(5, 15);
    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title,
      description,
      reward: questReward,
      assignedHeroIds: [],
      completed: false,
    requiredStrength,
     requiredAgility,
     requiredIntelligence,
    deadlineDay,
    status: QuestStatus.NotStarted
    };
    this.quests.push(newQuest);
  }

  assignHeroToQuest = (heroId: string, questId: string) => {
  const hero = this.heroes.find(h => h.id === heroId);
  const quest = this.quests.find(q => q.id === questId);
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
}

  assignHeroesToQuest = (heroes: string[], questId: string) => {
    // todo: добавить итоговую комиссию в квест, потому что после квеста может измениться уровень героев, что сломает комиссию в результате
    heroes.forEach((hero) => this.assignHeroToQuest(hero, questId));
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
}

  completeQuest = (questId: string) => {
  const quest = this.quests.find(q => q.id === questId);
  if (quest && !quest.completed) {
    quest.status = QuestStatus.CompletedSuccess;

    const assignedHeroes = this.heroes.filter(h => quest.assignedHeroIds.includes(h.id));
    const totalMinStake = assignedHeroes.reduce((sum, hero) => sum + hero.minStake, 0);
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
}

  generateRandomStats =(type: HeroType) =>{
    switch (type) {
      case 'warrior':
        return {
          strength: this.randomBetween(7, 10),
          agility: this.randomBetween(3, 6),
          intelligence: this.randomBetween(1, 4),
        };
      case 'mage':
        return {
          strength: this.randomBetween(1, 3),
          agility: this.randomBetween(3, 5),
          intelligence: this.randomBetween(7, 10),
        };
      case 'rogue':
        return {
          strength: this.randomBetween(3, 6),
          agility: this.randomBetween(7, 10),
          intelligence: this.randomBetween(2, 5),
        };
    }
  }

  randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onNextDay = () => {
  // Обновляем срок действия кандидатов
  this.candidates = this.candidates
    .map(c => ({ ...c, daysRemaining: c.daysRemaining - 1 }))
    .filter(c => c.daysRemaining > 0);

  // Проверяем задания с дедлайном — выполнить или удалить
  this.quests = this.quests.filter(quest => {
    if (quest.status === QuestStatus.CompletedSuccess) return true; // Уже выполнено — оставляем

    if (this.timeStore.currentDay > quest.deadlineDay) {
      // Дедлайн прошёл — проверяем героев
      const assignedHeroes = this.heroes.filter(h => quest.assignedHeroIds.includes(h.id));
      
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
        const heroComission = assignedHeroes.reduce((sum, h) => sum + (h.minStake ?? 0), 0)
        console.log(`hero comission: ${heroComission}`)
        this.financeStore.addGold(quest.reward - heroComission);
        assignedHeroes.forEach(h => this.increaseHeroLevel(h));
        console.log(`hero comission: ${heroComission}`)
    } else {
        quest.status = QuestStatus.CompletedFail;
    }
      return true;
    }

    return true; // Если дедлайн ещё не наступил — задание остаётся
  });

    // Обновляем срок действия кандидатов
    this.candidates = this.candidates
      .map(c => ({ ...c, daysRemaining: c.daysRemaining - 1 }))
      .filter(c => c.daysRemaining > 0);

    // Генерация новых кандидатов
    const newHeroesCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < newHeroesCount; i++) {
      const name = this.generateRandomName();
      const type = this.generateRandomHeroType();
      const stats = this.generateRandomStats(type);
      const recruitCost = this.calculateRecruitCost(stats);
      const minStake = this.calculateMinStake(1, type); // у новичка уровень 1
      const description = this.funnyDescriptionsByType[type][Math.floor(Math.random() * this.funnyDescriptionsByType[type].length)];

    this.candidates.push({
        id: crypto.randomUUID(),
        name,
        type,
        level: 1,
        assignedQuestId: null,
        daysRemaining: 2,
        recruitCost,
        description,
        minStake,
        ...stats,
    });
    }

    const newQuestsCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < newQuestsCount; i++) {
        const quest = this.generateRandomQuest();
        this.quests.push(quest);
    }
  }

  hireCandidate = (id: string) => {
    const candidateIndex = this.candidates.findIndex(c => c.id === id);
    if (candidateIndex === -1) return;

    const candidate = this.candidates[candidateIndex];

    // Проверяем, хватает ли золота
    if (!this.financeStore.canAffordGold(candidate.recruitCost)) {
      console.warn(`Недостаточно золота, чтобы нанять ${candidate.name}`);
      return;
    }

    // Снимаем золото
    this.financeStore.spendGold(candidate.recruitCost);

    this.heroes.push({
      ...candidate,
    });
    this.candidates.splice(candidateIndex, 1);
  };

  generateRandomName = (): string => {
    const names = ['Лира', 'Гром', 'Серена', 'Тракс', 'Вэлл', 'Кора', 'Арчибальд', 'Фелис'];
    return names[Math.floor(Math.random() * names.length)];
  }

  generateRandomHeroType = (): HeroType => {
    const types: HeroType[] = ['warrior', 'mage', 'rogue'];
    return types[Math.floor(Math.random() * types.length)];
  }

  generateStatsByType = (type: 'warrior' | 'mage' | 'rogue') => {
  switch (type) {
    case 'warrior':
      return {
        strength: this.randomInRange(7, 10),
        agility: this.randomInRange(3, 7),
        intelligence: this.randomInRange(1, 4),
      };
    case 'mage':
      return {
        strength: this.randomInRange(1, 4),
        agility: this.randomInRange(3, 6),
        intelligence: this.randomInRange(7, 10),
      };
    case 'rogue':
      return {
        strength: this.randomInRange(3, 6),
        agility: this.randomInRange(7, 10),
        intelligence: this.randomInRange(3, 6),
      };
  }
}

randomInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

generateRandomQuest = (): Quest => {
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
  const deadlineDay = this.timeStore.currentDay + this.randomInRange(3, 5);

  // Требования к статам — чтобы было разное, сделаем рандом в разумных пределах
  const requiredStrength = this.randomInRange(5, 15);
  const requiredAgility = this.randomInRange(5, 15);
  const requiredIntelligence = this.randomInRange(5, 15);

  return {
    id: crypto.randomUUID(),
    title: titles[idx],
    description: descriptions[idx],
    successResult: successResults[idx],
    failResult: failResults[idx],
    deadlineResult: timeoutResults[idx],
    reward,
    assignedHeroIds: [],
    completed: false,
    deadlineDay,
    requiredStrength,
    requiredAgility,
    requiredIntelligence,
    status: QuestStatus.NotStarted
  };
}
    startQuest = (questId: string) => {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) {
      console.warn(`Квест с id ${questId} не найден`);
      return;
    }

    if (quest.status === QuestStatus.CompletedSuccess) {
      console.warn(`Квест "${quest.title}" уже завершён`);
      return;
    }

    if (quest.assignedHeroIds.length === 0) {
      console.warn(`Нельзя стартовать квест "${quest.title}" без назначенных героев`);
      return;
    }

    // Назначаем героям этот квест, если ещё не назначен
    quest.assignedHeroIds.forEach(heroId => {
      const hero = this.heroes.find(h => h.id === heroId);
      if (hero && hero.assignedQuestId !== questId) {
        hero.assignedQuestId = questId;
      }
    });

    console.log(`Квест "${quest.title}" стартовал`);
    quest.status = QuestStatus.InProgress;
    // Тут можно добавить дополнительную логику старта, если понадобится
  }

  getQuestSuccessChance = (questId: string, heroesToAssign?: string[]): number => {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return 0;

    const heroes = heroesToAssign ?? quest.assignedHeroIds;

    const assignedHeroes = this.heroes.filter(h => heroes.includes(h.id));
    if (assignedHeroes.length === 0) return 0;

    const totalStrength = assignedHeroes.reduce((sum, h) => sum + h.strength, 0);
    const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
    const totalIntelligence = assignedHeroes.reduce((sum, h) => sum + h.intelligence, 0);

    const strengthRatio = quest.requiredStrength > 0 ? totalStrength / quest.requiredStrength : 1;
    const agilityRatio = quest.requiredAgility > 0 ? totalAgility / quest.requiredAgility : 1;
    const intelligenceRatio = quest.requiredIntelligence > 0 ? totalIntelligence / quest.requiredIntelligence : 1;

    // Усредняем и ограничиваем максимум 1
    const averageRatio = Math.min((strengthRatio + agilityRatio + intelligenceRatio) / 3, 1);

    // Возвращаем процент (0–100)
    return Math.round(averageRatio * 100);
  };

  calculateRecruitCost = (hero: Pick<Hero, 'strength' | 'agility' | 'intelligence'>): number => {
    const baseCost = 10;
    return baseCost + hero.strength * 2 + hero.agility * 2 + hero.intelligence * 3;
    }

    calculateMinStake = (level: number, type: HeroType): number => {
  const base = 10;
  const typeMultiplier = {
    warrior: 1.2,
    mage: 1.1,
    rogue: 1.3,
  };

  return Math.floor(base * level * (typeMultiplier[type] || 1));
}
    getMinStake(heroId: string): number {
    // Вернём minStake из героя, если он есть, иначе 0
    // Предполагаю, что в объекте героя есть поле minStake
    return this.heroes.find(h => h.id = heroId)?.minStake ?? 0;
    }
}
