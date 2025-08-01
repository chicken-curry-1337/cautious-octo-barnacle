import { makeAutoObservable } from 'mobx';
import { UserStore } from '../../entities/User/User.store';
import { GameScreen } from './Game.enum';

export class GameStore {
  userStore: UserStore;
  gameScreen: keyof typeof GameScreen = GameScreen.UserCreation;

  constructor() {
    this.userStore = new UserStore();

    makeAutoObservable(this);
  }

  setGameScreen = (gameScreen: keyof typeof GameScreen) => {
    this.gameScreen = gameScreen;
  };
}
