import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';
import type { Hero, HeroType } from '../../shared/types/hero';
import { GuildFinanceStore } from '../Finance/Finance.store';
import { RecruitStore } from '../Recruit/Recruit.store';
import { TimeStore } from '../TimeStore/TimeStore';

@singleton()
export class HeroesStore {
  heroes: Hero[] = [];

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(RecruitStore) public recruitStore: RecruitStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.currentDay,
      () => {
        this.onNextDay();
      }
    );
  }

  onNextDay = () => {
    this.heroes.forEach((hero) => {
      if (hero.injured && hero.inhuredTimeout) {
        hero.inhuredTimeout -= 1;
        if (hero.inhuredTimeout <= 0) {
          hero.injured = false; // герой выздоравливает
          hero.inhuredTimeout = undefined; // сбрасываем таймаут
        }
      }
    });
  };

  createHero = (name: string, type: HeroType, description: string) => {
    const stats = this.generateStatsByType(type);
    const level = 1;
    const minStake = this.calculateMinStake(level, type);

    const newHero: Hero = {
      id: crypto.randomUUID(),
      name,
      type,
      level,
      description,
      assignedQuestId: null,
      ...stats,
      minStake,
      injured: false,
      recruitCost: this.calculateRecruitCost(stats),
    };
    this.heroes.push(newHero);
  };

  calculateRecruitCost = (
    hero: Pick<Hero, 'strength' | 'agility' | 'intelligence'>
  ): number => {
    const baseCost = 10;
    return (
      baseCost + hero.strength * 2 + hero.agility * 2 + hero.intelligence * 3
    );
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

    this.heroes.push({
      ...candidate,
    });
    this.recruitStore.recruits.splice(candidateIndex, 1);
  };

  fireHero = (id: string) => {
    const heroIndex = this.heroes.findIndex((h) => h.id === id);
    if (heroIndex === -1) return;

    const hero = this.heroes[heroIndex];

    if (hero.assignedQuestId !== null) return; // нельзя уволить героя, который в квесте
    this.financeStore.addGold(
      +Number(hero.recruitCost * hero.level * 0.5).toFixed(2)
    );
    // Удаляем героя из списка
    this.heroes.splice(heroIndex, 1);
  };

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
  };

  randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  randomInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  get availableHeroes() {
    return this.heroes.filter(
      (hero) => hero.assignedQuestId === null && !hero.injured
    );
  }
}
