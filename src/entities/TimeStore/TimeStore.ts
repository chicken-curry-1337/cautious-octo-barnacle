import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';
import { DialogueStore } from '../Dialogue/Dialogue.store';
import introDialogue from '../../assets/dialogues/introDialogue';
import questDialogue from '../../assets/dialogues/questDialogue';


@singleton()
export class TimeStore {
  currentDay = 1;

  constructor(@inject(DialogueStore) public dialogueStore: DialogueStore) {
    makeAutoObservable(this);

    reaction(
      () => this.currentDay,
      (day) => {
        console.log(introDialogue)
        if (day === 3) {
            console.log(1)
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
  }
}
