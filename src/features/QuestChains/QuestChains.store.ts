import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

export interface QuestChainStage {
  title: string;
  description: string;
  successResult: string;
  failResult: string;
  deadlineResult: string;
  rewardMin: number;
  rewardMax: number;
  reqStats: { str: [number, number]; agi: [number, number]; int: [number, number] };
  done: boolean;
}

export const questChainsConfig: Record<string, QuestChainStage[]> = {
  slime: [
    {
      title: 'Обычный слайм',
      description: 'Возле деревни замечен слайм. Пока безобиден, но может размножиться.',
      successResult: 'Слайм уничтожен. Жители могут спать спокойно.',
      failResult: 'Слайм уполз в лес, оставив за собой слизь.',
      deadlineResult: 'Слайм исчез сам по себе. Но это не конец.',
      rewardMin: 50,
      rewardMax: 100,
      reqStats: { str: [5, 10], agi: [5, 10], int: [5, 10] },
      done: false,
    },
    {
      title: 'Скопление слаймов',
      description: 'В лесу образовалось скопление слаймов.',
      successResult: 'Скопление уничтожено, но слизь продолжает появляться.',
      failResult: 'Скопление дошло до окраины деревни.',
      deadlineResult: 'Скопление распалось, но слаймы разбежались.',
      rewardMin: 80,
      rewardMax: 150,
      reqStats: { str: [8, 12], agi: [8, 12], int: [8, 12] },
      done: false,
    },
    {
      title: 'Аномальный слайм',
      description: 'В глубине леса найден аномальный слайм.',
      successResult: 'Аномальный слайм уничтожен.',
      failResult: 'Он прорвался к деревне и разрушил постройки.',
      deadlineResult: 'Аномальный слайм исчез в лесу.',
      rewardMin: 120,
      rewardMax: 200,
      reqStats: { str: [10, 15], agi: [10, 15], int: [10, 15] },
      done: false,
    },
  ],
};

@singleton()
export class QuestChainsStore {
  questChainsProgress: Record<string, number> = { slime: 0 };

  constructor() {
    makeAutoObservable(this);
  }
}
