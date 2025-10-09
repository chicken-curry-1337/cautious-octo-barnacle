import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { traits as traitPool } from '../../../assets/traits/traits';
import { RecruitStore } from '../../../entities/Recruit/Recruit.store';
import { TimeStore } from '../../../entities/TimeStore/TimeStore';
import { UpgradeStore } from '../../../entities/Upgrade/Upgrade.store';
import type { HeroType, IChar } from '../../../shared/types/hero';
import { randomInRange } from '../../../shared/utils/randomInRange';

@singleton()
export class RecruitsStore {
  recruitMap: Record<string, RecruitStore> = {};
  descriptionsByType: Record<HeroType, string[]> = {
    warrior: [
      'Думает, что его меч — это волшебная палочка, только громче и тяжелее.',
      'Считает, что шлем — лучший аксессуар для стильного образа в бою.',
      'Может пробежать марафон, но предпочитает остановиться у ближайшей таверны.',
      'Любит рассказывать истории, которые начинаются с "А вот когда я один раз...".',
      'Его любимая поза — стоять и смотреть в даль, чтобы все подумали, что он о чём-то важном задумался.',
    ],
    mage: [
      'Верит, что книга заклинаний — лучшее чтение перед сном.',
      'Любит эксперименты с огненной магией, но только на безопасном расстоянии.',
      'Всегда находит способ объяснить, почему магия — это не просто фокусы.',
      'Никогда не выходит из дома без своего любимого амулета удачи.',
      'Может приготовить зелье, которое улучшит настроение на весь день.',
    ],
    rogue: [
      'Мастер скрытности, который иногда забывает, куда спрятал ключи.',
      'Ловко крадёт внимание, а потом карманы — в таком порядке.',
      'Лучший друг в споре — быстрые ноги и чувство юмора.',
      'Любит шутить, что у него девять жизней, и он уже потратил восемь.',
      'Умеет исчезать так быстро, что даже его тень теряется.',
    ],
  };

  constructor(@inject(TimeStore) public timeStore: TimeStore, @inject(UpgradeStore) public upgradeStore: UpgradeStore) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.absoluteDay,
      () => {
        this.onNextDay();
      },
    );
  }

  get recruits(): RecruitStore[] {
    return Object.values(this.recruitMap);
  }

  private get maxRecruitSlots() {
    return 5 + this.upgradeStore.getNumericEffectSum('recruit_pool_slots');
  }

  private get recruitCostMultiplier() {
    const discount = this.upgradeStore.getNumericEffectSum('recruit_refresh_discount');

    return Math.max(0.2, 1 - discount);
  }

  private get recruitQualityMultiplier() {
    return this.upgradeStore.getNumericEffectProduct('recruit_quality_mult');
  }

  onNextDay = () => {
    // Обновляем срок действия кандидатов
    this.recruits
      .forEach((recruit) => {
        recruit.decreaseRemainingDays();

        if (recruit.daysRemaining <= 0) {
          delete this.recruitMap[recruit.id];
        }
      });

    const CANDIDATE_LENGTH_MAX = this.maxRecruitSlots;

    if (this.recruits.length < CANDIDATE_LENGTH_MAX) {
      // Генерация новых кандидатов
      const availableSlots = Math.max(0, CANDIDATE_LENGTH_MAX - this.recruits.length);
      const newHeroesCount = Math.floor(Math.random() * (Math.max(1, availableSlots + 1)));

      for (let i = 0; i < newHeroesCount; i++) {
        const name = this.generateRandomName();
        const type = this.generateRandomHeroType();
        const stats = this.generateStatsByType(type);
        const recruitCost = this.calculateRecruitCost(stats);
        const minStake = this.calculateMinStake(1, type); // у новичка уровень 1
        const description
          = this.descriptionsByType[type][
            Math.floor(Math.random() * this.descriptionsByType[type].length)
          ];
        const id = crypto.randomUUID();

        if (!this.recruitMap[id]) {
          this.recruitMap[id] = new RecruitStore({
            id,
            name,
            type,
            level: 1,
            daysRemaining: 5,
            recruitCost,
            description,
            minStake,
            injured: false,
            traits: this.getRandomTraits(),
            ...stats,
          });
        }
      }
    }
  };

  generateRandomName = (): string => {
    const names = [
      'Лира',
      'Гром',
      'Серена',
      'Тракс',
      'Вэлл',
      'Кора',
      'Арчибальд',
      'Фелис',
    ];

    return names[Math.floor(Math.random() * names.length)];
  };

  generateRandomHeroType = (): HeroType => {
    const types: HeroType[] = ['warrior', 'mage', 'rogue'];

    return types[Math.floor(Math.random() * types.length)];
  };

  generateStatsByType = (type: 'warrior' | 'mage' | 'rogue') => {
    const quality = this.recruitQualityMultiplier;

    switch (type) {
      case 'warrior':
        return {
          strength: Math.round(randomInRange(7, 10) * quality),
          agility: Math.round(randomInRange(3, 7) * quality),
          intelligence: Math.round(randomInRange(1, 4) * quality),
        };
      case 'mage':
        return {
          strength: Math.round(randomInRange(1, 4) * quality),
          agility: Math.round(randomInRange(3, 6) * quality),
          intelligence: Math.round(randomInRange(7, 10) * quality),
        };
      case 'rogue':
        return {
          strength: Math.round(randomInRange(3, 6) * quality),
          agility: Math.round(randomInRange(7, 10) * quality),
          intelligence: Math.round(randomInRange(3, 6) * quality),
        };
    }
  };

  calculateRecruitCost = (
    hero: Pick<IChar, 'strength' | 'agility' | 'intelligence'>,
  ): number => {
    const baseCost = 10;
    const cost = baseCost + hero.strength * 2 + hero.agility * 2 + hero.intelligence * 3;

    return Math.round(cost * this.recruitCostMultiplier);
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

  private getRandomTraits = (): string[] => {
    if (traitPool.length === 0) return [];

    const maxTraits = Math.min(2, traitPool.length);
    const count = randomInRange(0, maxTraits);
    if (count === 0) return [];

    const pool = [...traitPool];
    const selected: string[] = [];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * pool.length);
      const [trait] = pool.splice(index, 1);
      if (!trait) continue;
      selected.push(trait.id);
    }

    return selected;
  };
}
