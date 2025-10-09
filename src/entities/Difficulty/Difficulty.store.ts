import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

const STORY_DIFFICULTY_STEP = 0.1;

@singleton()
export class DifficultyStore {
  difficultyLevel = 1; // Базовый уровень сложности

  constructor() {
    makeAutoObservable(this);
  }

  onStoryQuestCompleted = () => {
    this.difficultyLevel += STORY_DIFFICULTY_STEP;
  };
}
