import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';
import introDialogue from '../../assets/dialogues/introDialogue';
import questDialogue from '../../assets/dialogues/questDialogue';
import { DialogueStore } from '../Dialogue/Dialogue.store';

@singleton()
export class TimeStore {
  currentDay = 1;

  constructor(@inject(DialogueStore) public dialogueStore: DialogueStore) {
    makeAutoObservable(this);

    reaction(
      () => this.currentDay,
      (day) => {
        if (day === 3) {
          this.dialogueStore.startDialogue(introDialogue);
        }
        if (day === 5) {
          this.dialogueStore.startDialogue(questDialogue);
        }
      }
    );
  }

  nextDay = () => {
    this.currentDay++;
  };
}
