import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';
import type { Hero, HeroType, RecruitCandidate } from '../../shared/types/hero';
import { TimeStore } from '../TimeStore/TimeStore';

@singleton()
export class RecruitStore {
  recruits: RecruitCandidate[] = [];
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

  constructor(@inject(TimeStore) public timeStore: TimeStore) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.currentDay,
      () => {
        this.onNextDay();
      }
    );
  }

  onNextDay = () => {
    // Обновляем срок действия кандидатов
    this.recruits = this.recruits
      .map((c) => ({ ...c, daysRemaining: c.daysRemaining - 1 }))
      .filter((c) => c.daysRemaining > 0);

    const CANDIDATE_LENGTH_MAX = 5;
    const CANDIDATE_GENERATE_COUNT = 5;

    if (this.recruits.length < CANDIDATE_LENGTH_MAX) {
      // Генерация новых кандидатов
      const newHeroesCount = Math.floor(
        Math.random() * (CANDIDATE_GENERATE_COUNT - this.recruits.length)
      );
      for (let i = 0; i < newHeroesCount; i++) {
        const name = this.generateRandomName();
        const type = this.generateRandomHeroType();
        const stats = this.generateStatsByType(type);
        const recruitCost = this.calculateRecruitCost(stats);
        const minStake = this.calculateMinStake(1, type); // у новичка уровень 1
        const description =
          this.descriptionsByType[type][
            Math.floor(Math.random() * this.descriptionsByType[type].length)
          ];

        this.recruits.push({
          id: crypto.randomUUID(),
          name,
          type,
          level: 1,
          assignedQuestId: null,
          daysRemaining: 5,
          recruitCost,
          description,
          minStake,
          ...stats,
        });
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

  randomInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  calculateRecruitCost = (
    hero: Pick<Hero, 'strength' | 'agility' | 'intelligence'>
  ): number => {
    const baseCost = 10;
    return (
      baseCost + hero.strength * 2 + hero.agility * 2 + hero.intelligence * 3
    );
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
}
