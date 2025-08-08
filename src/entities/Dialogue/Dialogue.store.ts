import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { callBoardIntro } from '../../assets/dialogues/guild/callBoard';
import { guildFirststeps } from '../../assets/dialogues/guild/guildFirstSteps';
import { UPGRADE_1_ID } from '../../assets/upgrades/upgrades';
import { TimeStore } from '../TimeStore/TimeStore';
import { UpgradeStore } from '../Upgrade/Upgrade.store';

export interface ICharacter {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface DialogueOption {
  text: string;
  nextId: string;
}

export interface DialogueNode {
  id?: string;
  visibleCharacterIds: string[];
  activeCharacterIds: string[]; // айди активных персонажей в этом узле
  text: string;
  options: DialogueOption[];
  isLast?: true;
  nextNodeId?: string;
}

export interface DialogueData {
  characters: ICharacter[];
  nodes: DialogueNode[];
}

// todo: нужно создать CurrentDialogueStore. Также нужно создать сторы диалогов при создании игры.
// todo: Если диалог один раз проигран, и не репитативный, нужно ставить флаг done = true;
@singleton()
export class DialogueStore {
  // текущий диалог
  dialogueData: DialogueData | null = null;
  currentId: string | null = null;

  // очередь диалогов
  dialogueQueue: DialogueData[] = [];
  queueIndex: number = 0;

  constructor(@inject(TimeStore) public timeStore: TimeStore,
    @inject(UpgradeStore) public upgradeStore: UpgradeStore) {
    makeAutoObservable(this);

    // todo: для запуска диалогов добавляем reaction на нужный диалог, дату, тег, состояние итп. пример:
    // reaction(
    //   () => this.timeStore.absoluteDay,
    //   (day) => {
    //     if (day === 0) {
    //       this.startDialogues([guildFirststeps, callBoardIntro]);
    //     }

    //     if (day === 5) {
    //     this.startDialogue(questDialogue);
    //     }
    //   },
    //   { fireImmediately: true },
    // );

    // reaction(() => upgradeStore.upgradeMap[UPGRADE_1_ID].done, (isDone) => {
    //   if (isDone) {
    //     this.startDialogues([callBoardIntro]);
    //   }
    // }, {});
  }

  /**
   * Запускает один диалог (совместимо со старым API).
   * Это просто обёртка вокруг startDialogues — ставит массив из одного диалога.
   */
  startDialogue = (dialogueData: DialogueData, startId = 'start') => {
    this.startDialogues([dialogueData], 0, startId);
  };

  /**
   * Запускает несколько диалогов подряд.
   * dialogues — массив диалогов.
   * startIndex — индекс диалога в массиве, с которого начать.
   * startId — id узла, с которого стартует выбранный диалог.
   */
  startDialogues = (dialogues: DialogueData[], startIndex = 0, startId = 'start') => {
    if (!dialogues || dialogues.length === 0) return;

    this.dialogueQueue = dialogues;
    this.queueIndex = Math.max(0, Math.min(startIndex, dialogues.length - 1));

    this.startCurrentDialogue(startId);
  };

  /**
   * Подготовка и запуск диалога из очереди по текущему queueIndex.
   */
  private startCurrentDialogue = (startId = 'start') => {
    const currentDialogue = this.dialogueQueue[this.queueIndex];

    if (!currentDialogue) {
      // нечего запускать
      this.clearAllDialogueState();

      return;
    }

    this.dialogueData = currentDialogue;
    this.currentId = startId;
  };

  /**
   * Перейти к следующему узлу текущего диалога.
   * Если узлы закончились — очистить текущий диалог и (авто)запустить следующий из очереди.
   */
  nextNode = () => {
    const node = this.currentNode;

    if (node?.nextNodeId) {
      this.setCurrentId(node.nextNodeId);
    } else if (
      node
      && node.options.length === 0
      && this.dialogueData
      && this.dialogueData.nodes.length > 0
    ) {
      const currentIndex = this.dialogueData.nodes.findIndex(n => n.id === node.id);
      const nextNode = this.dialogueData.nodes[currentIndex + 1];

      if (nextNode) {
        if (nextNode.id) {
          this.setCurrentId(nextNode.id);
        }
      } else {
        // конец текущего диалога — очищаем текущий, но смотрим очередь
        this.clearDialogue();
      }
    }
  };

  setCurrentId = (id: string) => {
    this.currentId = id;
  };

  /**
   * Очищает текущий диалог и пытается запустить следующий из очереди.
   * Если следующий есть — стартует он (с дефолтным 'start' id).
   * Если очереди больше нет — очищает всё.
   */
  clearDialogue = () => {
    // завершили текущий диалог — продвигаем очередь
    const nextIndex = this.queueIndex + 1;

    if (this.dialogueQueue && nextIndex < this.dialogueQueue.length) {
      this.queueIndex = nextIndex;
      // стартуем следующий диалог из очереди
      this.startCurrentDialogue('start');
    } else {
      // очереди нет — полностью очищаем
      this.clearAllDialogueState();
    }
  };

  /**
   * Полная очистка состояния (очередь и текущее)
   */
  private clearAllDialogueState = () => {
    this.dialogueData = null;
    this.currentId = null;
    this.dialogueQueue = [];
    this.queueIndex = 0;
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

  get visibleCharacters() {
    if (!this.currentNode || !this.characters) return [];

    return this.characters.filter(c =>
      this.currentNode!.visibleCharacterIds.includes(c.id),
    );
  }
}
