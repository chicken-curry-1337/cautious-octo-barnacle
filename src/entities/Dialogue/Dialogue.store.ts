import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

// import introDialogue from '../../assets/dialogues/introDialogue';
// import questDialogue from '../../assets/dialogues/questDialogue';

export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface DialogueOption {
  text: string;
  nextId: string;
}

export interface DialogueNode {
  id: string;
  activeCharacterIds: string[]; // айди активных персонажей в этом узле
  text: string;
  options: DialogueOption[];
}

export interface DialogueData {
  characters: Character[];
  nodes: DialogueNode[];
}

@singleton()
export class DialogueStore {
  dialogueData: DialogueData | null = null;
  currentId: string | null = null;

  constructor() {
    makeAutoObservable(this);

    // todo: для запуска диалогов добавляем reaction на нужный диалог, дату, тег, состояние итп. пример:

    // reaction(
    //   () => this.currentDay,
    //   (day) => {
    //     if (day === 3) {
    //       this.dialogueStore.startDialogue(introDialogue);
    //     }

    //     if (day === 5) {
    //       this.dialogueStore.startDialogue(questDialogue);
    //     }
    //   },
    // );
  }

  startDialogue = (dialogueData: DialogueData, startId = 'start') => {
    this.dialogueData = dialogueData;
    this.currentId = startId;
  };

  setCurrentId = (id: string) => {
    this.currentId = id;
  };

  clearDialogue = () => {
    this.dialogueData = null;
    this.currentId = null;
  };

  get currentNode() {
    if (!this.dialogueData) return null;

    return (
      this.dialogueData.nodes.find(node => node.id === this.currentId) ?? null
    );
  }

  get characters() {
    if (!this.dialogueData) return null;

    return this.dialogueData.characters;
  }

  get activeCharacters() {
    if (!this.currentNode || !this.characters) return [];

    return this.characters.filter(c =>
      this.currentNode!.activeCharacterIds.includes(c.id),
    );
  }
}
