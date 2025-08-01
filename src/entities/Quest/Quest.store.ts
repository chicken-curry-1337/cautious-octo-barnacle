import { makeAutoObservable } from 'mobx';
import type { Hero } from '../Guild/Guild.store';
import { singleton } from 'tsyringe';

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  assignedHeroIds: string[];
  completed: boolean;
  failed?: boolean;
  deadlineDay: number;
  requiredStrength: number;
  requiredAgility: number;
  requiredIntelligence: number;
}

@singleton()
export class QuestStore {
  quests: Quest[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  createQuest(
    title: string,
    description: string,
    reward?: number,
    currentDay?: number
  ) {
    const questReward = reward ?? this.randomInRange(50, 150);
    const deadlineDay = (currentDay ?? 1) + this.randomInRange(3, 5);
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
      deadlineDay,
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
    };

    this.quests.push(newQuest);
  }

  assignHeroToQuest(questId: string, heroId: string) {
    const quest = this.quests.find((q) => q.id === questId);
    if (!quest || quest.completed) return false;

    if (!quest.assignedHeroIds.includes(heroId)) {
      quest.assignedHeroIds.push(heroId);
      return true;
    }
    return false;
  }

  completeQuest(questId: string, heroes: Hero[]) {
    const quest = this.quests.find((q) => q.id === questId);
    if (quest && !quest.completed) {
      quest.completed = true;
      for (const heroId of quest.assignedHeroIds) {
        const hero = heroes.find((h) => h.id === heroId);
        if (hero) {
          hero.level += 1; // или вызвать метод из GuildStore для повышения уровня
        }
      }
    }
  }

  randomInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Можно сюда добавить другие методы, связанные только с квестами
}
