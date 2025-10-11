import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { mainHeroData, MAIN_HERO_ID } from '../../assets/heroes/mainHero';
import { pickRandomTraitsForHero } from '../../assets/traits/traits';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import { HeroStore } from '../../entities/Hero/Hero.store';
import { TimeStore } from '../../entities/TimeStore/TimeStore';
import { UpgradeStore } from '../../entities/Upgrade/Upgrade.store';
import type { HeroType, IHero } from '../../shared/types/hero';
import { randomInRange } from '../../shared/utils/randomInRange';
import { RecruitsStore } from '../Recruits/store/Recruits.store';

@singleton()
export class HeroesStore {
  heroesMap: Record<string, HeroStore> = {};
  readonly mainHeroId = MAIN_HERO_ID;
  private syncing: boolean = false;

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(RecruitsStore) public recruitStore: RecruitsStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore,
    @inject(UpgradeStore) public upgradeStore: UpgradeStore,
  ) {
    makeAutoObservable(this);

    this.initializeMainHero();

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
        this.onNextDay();
      },
    );

    reaction(
      () => this.timeStore.monthIndex,
      () => {
        if (this.timeStore.absoluteDay === 0) return;
        this.payMonthlySalaries();
      },
      { fireImmediately: false },
    );
  }

  get heroes() {
    return Object.values(this.heroesMap);
  }

  get totalMonthlySalary() {
    return this.heroes.reduce((sum, hero) => sum + (hero.monthlySalary ?? 0), 0);
  }

  onNextDay = () => {
    if (this.syncing) return;

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
    const monthlySalary = this.calculateMonthlySalary(startLevel, type);

    if (!this.heroesMap[id]) {
      this.heroesMap[id] = new HeroStore({
        id,
        name,
        type,
        level: startLevel,
        description,
        assignedQuestId: null,
        ...stats,
        monthlySalary,
        injured: false,
        recruitCost: 0,
        traits: this.getRandomTraits(),
        isMainHero: false,
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
      monthlySalary: this.calculateMonthlySalary(Math.max(candidate.level, this.upgradeStore.getNumericEffectMax('new_hero_start_level') || 1), candidate.type),
      isMainHero: false,
    }));

    // удаляем кандидата
    delete this.recruitStore.recruitMap[id];
  };

  fireHero = (id: string) => {
    const hero = this.heroesMap[id];

    if (!hero || hero.isMainHero) return;

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

  calculateMonthlySalary = (level: number, type: HeroType): number => {
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

  private payMonthlySalaries = () => {
    if (this.syncing) return;

    const totalSalary = this.totalMonthlySalary;
    if (totalSalary <= 0) return;

    const availableGold = this.financeStore.gold;
    const amountToPay = Math.min(totalSalary, availableGold);

    if (amountToPay > 0) {
      this.financeStore.spendGold(amountToPay);
    }

    const unpaid = totalSalary - amountToPay;
    if (unpaid > 0) {
      console.warn('Гильдия не смогла полностью выплатить зарплату. Недостаёт:', unpaid);
    }
  };

  private initializeMainHero = () => {
    if (this.heroesMap[this.mainHeroId]) return;

    this.heroesMap[this.mainHeroId] = new HeroStore({
      ...mainHeroData,
      traits: mainHeroData.traits ?? [],
      monthlySalary: 0,
      recruitCost: 0,
      injured: false,
      assignedQuestId: null,
    });
  };

  setSyncing = (value: boolean) => {
    this.syncing = value;
  };

  loadSnapshot = (heroes: IHero[]) => {
    const nextMap: Record<string, HeroStore> = {};

    heroes.forEach((hero) => {
      const monthlySalary = hero.monthlySalary
        ?? (hero as unknown as { minStake?: number }).minStake
        ?? this.calculateMonthlySalary(hero.level, hero.type);

      nextMap[hero.id] = new HeroStore({
        ...hero,
        monthlySalary,
        traits: hero.traits ?? [],
        assignedQuestId: hero.assignedQuestId ?? null,
        isMainHero: hero.isMainHero ?? false,
      });
    });

    this.heroesMap = nextMap;
    this.initializeMainHero();
  };
}
