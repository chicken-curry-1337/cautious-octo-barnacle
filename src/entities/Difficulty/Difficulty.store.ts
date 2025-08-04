import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { TimeStore } from '../TimeStore/TimeStore';

@singleton()
export class DifficultyStore {
  difficultyLevel = 1; // Начальный уровень сложности

  constructor(@inject(TimeStore) public timeStore: TimeStore) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.currentDay,
      () => {
        this.onNextDay();
      },
    );
  }

  onNextDay = () => {
    // todo: можно увеличивать сложность по дням, например, каждые 5 дней.
    // todo: Также можно увеличивать сложность при выполнении сюжетных квестов
    this.difficultyLevel += 0.001;
  };
}
