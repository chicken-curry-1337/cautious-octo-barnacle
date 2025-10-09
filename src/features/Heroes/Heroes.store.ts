import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import { HeroStore } from '../../entities/Hero/Hero.store';
import { TimeStore } from '../../entities/TimeStore/TimeStore';
import { UpgradeStore } from '../../entities/Upgrade/Upgrade.store';
import type { HeroType } from '../../shared/types/hero';
import { randomInRange } from '../../shared/utils/randomInRange';
import { RecruitsStore } from '../Recruits/store/Recruits.store';
import { pickRandomTraitsForHero } from '../../assets/traits/traits';

@singleton()
export class HeroesStore {
  heroesMap: Record<string, HeroStore> = {};

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(RecruitsStore) public recruitStore: RecruitsStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
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

  get heroes() {
    return Object.values(this.heroesMap);
  }

  onNextDay = () => {
    this.heroes.forEach((hero) => {
      if (hero.injured && typeof hero.injuredTimeout === 'number') {
        hero.setInjuredTimeout({
          injuredTimeout: hero.injuredTimeout
            - (1 + this.upgradeStore.getNumericEffectSum('fatigue_recovery_per_day')),
        });
      }
    });
  };

  createHero = (name: string, type: HeroType, description: string) => {
    const id = crypto.randomUUID();
    const stats = this.generateStatsByType(type);
    const startLevel = Math.max(1, this.upgradeStore.getNumericEffectMax('new_hero_start_level') || 1);
    const minStake = this.calculateMinStake(startLevel, type);

    if (!this.heroesMap[id]) {
      this.heroesMap[id] = new HeroStore({
        id,
        name,
        type,
        level: startLevel,
        description,
        assignedQuestId: null,
        ...stats,
        minStake,
        injured: false,
        recruitCost: 0,
        traits: this.getRandomTraits(),
      });
    }
  };

  // todo: вынести всю логику на уровень вверх. Сейчас эта фича почему-то использует логику другой фичи
  hireCandidate = (id: string) => {
    // todo: use only candidate type, not CandidateStore
    const candidate = this.recruitStore.recruitMap[id];

    // Проверяем, хватает ли золота
    if (!this.financeStore.canAffordGold(candidate.recruitCost)) {
      console.warn(`Недостаточно золота, чтобы нанять ${candidate.name}`);

      return;
    }

    // Снимаем золото
    this.financeStore.spendGold(candidate.recruitCost);

    // создаем героя
    this.heroesMap[candidate.id] = (new HeroStore({
      ...candidate,
      level: Math.max(candidate.level, this.upgradeStore.getNumericEffectMax('new_hero_start_level') || 1),
      minStake: this.calculateMinStake(Math.max(candidate.level, this.upgradeStore.getNumericEffectMax('new_hero_start_level') || 1), candidate.type),
    }));

    // удаляем кандидата
    delete this.recruitStore.recruitMap[id];
  };

  fireHero = (id: string) => {
    const hero = this.heroesMap[id];

    if (hero.assignedQuestId !== null) return; // нельзя уволить героя, который в квесте
    this.financeStore.addGold(
      +Number(hero.recruitCost * hero.level * 0.5).toFixed(2),
    );
    // Удаляем героя из списка
    delete this.heroesMap[id];
  };

  generateStatsByType = (type: 'warrior' | 'mage' | 'rogue') => {
    const gearBonus = Math.round(this.upgradeStore.getNumericEffectSum('gear_tier_bonus'));
    switch (type) {
      case 'warrior':
        return {
          strength: randomInRange(7, 10) + gearBonus,
          agility: randomInRange(3, 7) + Math.floor(gearBonus / 2),
          intelligence: randomInRange(1, 4),
        };
      case 'mage':
        return {
          strength: randomInRange(1, 4),
          agility: randomInRange(3, 6) + Math.floor(gearBonus / 2),
          intelligence: randomInRange(7, 10) + gearBonus,
        };
      case 'rogue':
        return {
          strength: randomInRange(3, 6) + Math.floor(gearBonus / 2),
          agility: randomInRange(7, 10) + gearBonus,
          intelligence: randomInRange(3, 6),
        };
    }
  };

  calculateMinStake = (level: number, type: HeroType): number => {
    const base = 10;
    const typeMultiplier = {
      warrior: 1.2,
      mage: 1.1,
      rogue: 1.3,
    };
    const satisfactionBonus = this.upgradeStore.getNumericEffectSum('salary_satisfaction_bonus');
    const satisfactionMultiplier = Math.max(0.5, 1 - satisfactionBonus * 0.05);

    return Math.floor(base * level * (typeMultiplier[type] || 1) * satisfactionMultiplier);
  };

  get availableHeroes() {
    return this.heroes.filter(
      hero => hero.assignedQuestId === null && !hero.injured,
    );
  }

  private getRandomTraits = (): string[] => {
    const maxTraits = 2;
    const desired = randomInRange(0, maxTraits);
    if (desired === 0) return [];

    return pickRandomTraitsForHero(desired);
  };
}
