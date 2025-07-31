import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';


@singleton()
export class TimeStore {
  currentDay = 1;

  constructor() {
    makeAutoObservable(this);
  }

  nextDay = () => {
    this.currentDay++;
  }
}
