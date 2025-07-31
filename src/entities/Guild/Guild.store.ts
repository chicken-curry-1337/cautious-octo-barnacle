import { makeAutoObservable, reaction, runInAction, toJS } from 'mobx';
import { TimeStore } from '../TimeStore/TimeStore';
import { inject, singleton } from 'tsyringe';

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
}

export interface RecruitCandidate extends Hero {
  daysRemaining: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  assignedHeroIds: string[];
  completed: boolean;
  failed?: boolean;
  deadlineDay: number; // День, до которого нужно выполнить
  requiredStrength: number;
  requiredAgility: number;
  requiredIntelligence: number;
}

@singleton()
export class GuildStore {
  heroes: Hero[] = [];
  quests: Quest[] = [];
  candidates: RecruitCandidate[] = [];

  constructor(@inject(TimeStore) public timeStore: TimeStore) {
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
    const newHero: Hero = {
      id: crypto.randomUUID(),
      name,
      type,
      level: 1,
      assignedQuestId: null,
      ...stats,
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
    deadlineDay
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
    return true;
  }
  return false;
}

  assignHeroesToQuest = (heroes: string[], questId: string) => {
    heroes.forEach((hero) => this.assignHeroToQuest(hero, questId));
  }

  increaseHeroLevel = (hero: Hero) => {
    hero.level += 1;

    switch (hero.type) {
        case 'warrior':
        // Воин: +3 к силе, +1 к ловкости, +1 к интеллекту
        hero.strength += 3;
        hero.agility += 1;
        hero.intelligence += 1;
        break;
        case 'mage':
        // Маг: +1 к силе, +1 к ловкости, +3 к интеллекту
        hero.strength += 1;
        hero.agility += 1;
        hero.intelligence += 3;
        break;
        case 'rogue':
        // Вор: +1 к силе, +3 к ловкости, +1 к интеллекту
        hero.strength += 1;
        hero.agility += 3;
        hero.intelligence += 1;
        break;
        }
    }

  completeQuest = (questId: string) => {
     const quest = this.quests.find(q => q.id === questId);
  if (quest && !quest.completed) {
    quest.completed = true;
    for (const heroId of quest.assignedHeroIds) {
      const hero = this.heroes.find(h => h.id === heroId);
      if (hero) this.increaseHeroLevel(hero);
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
    if (quest.completed) return true; // Уже выполнено — оставляем

    if (this.timeStore.currentDay > quest.deadlineDay) {
      // Дедлайн прошёл — проверяем героев
      const assignedHeroes = this.heroes.filter(h => quest.assignedHeroIds.includes(h.id));
      
      if (assignedHeroes.length === 0) {
        // Задание провалено из-за отсутствия героев — удаляем задание
        return false;
      }

      // Считаем суммарные статы
      const totalStrength = assignedHeroes.reduce((sum, h) => sum + h.strength, 0);
      const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
      const totalIntelligence = assignedHeroes.reduce((sum, h) => sum + h.intelligence, 0);

      // Проверяем требования
      if (
        totalStrength >= quest.requiredStrength &&
        totalAgility >= quest.requiredAgility &&
        totalIntelligence >= quest.requiredIntelligence
      ) {
        // Успешное выполнение — повышаем уровень героев
        quest.completed = true;
        quest.failed = false;
        assignedHeroes.forEach(h => h.level++);
      } else {
        // Неуспешное выполнение — флаг и без повышения
        quest.completed = true;
        quest.failed = true;
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

      this.candidates.push({
        id: crypto.randomUUID(),
        name,
        type,
        level: 1,
        assignedQuestId: null,
        daysRemaining: 2,
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
    if (candidateIndex !== -1) {
      const candidate = this.candidates[candidateIndex];

      runInAction(() => {
          this.heroes.push({
            ...candidate,
          });
          this.candidates.splice(candidateIndex, 1);
      })
    }
  }

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
    reward,
    assignedHeroIds: [],
    completed: false,
    deadlineDay,
    requiredStrength,
    requiredAgility,
    requiredIntelligence,
  };
}
    startQuest = (questId: string) => {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) {
      console.warn(`Квест с id ${questId} не найден`);
      return;
    }

    if (quest.completed) {
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
    // Тут можно добавить дополнительную логику старта, если понадобится
  }
}
