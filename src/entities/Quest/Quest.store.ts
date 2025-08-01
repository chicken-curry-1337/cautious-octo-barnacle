import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';
import { QuestStatus, type Quest } from '../../shared/types/quest';
import { GuildFinanceStore } from '../Finance/Finance.store';
import { TimeStore } from '../TimeStore/TimeStore';

@singleton()
export class QuestStore {
  quests: Quest[] = [];

  constructor(
    @inject(TimeStore) public timeStore: TimeStore,
    @inject(GuildFinanceStore) public financeStore: GuildFinanceStore
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.timeStore.currentDay,
      () => {
        this.onNextDay();
      }
    );
  }

  createQuest = (
    title: string,
    description: string,
    successResult: string,
    deadlineResult: string,
    failResult: string,
    reward?: number
  ) => {
    const questReward = reward ?? this.randomInRange(50, 150);
    const deadlineDay = this.timeStore.currentDay + this.randomInRange(3, 5);

    // Требования к статам — чтобы было разное, сделаем рандом в разумных пределах
    const requiredStrength = this.randomInRange(5, 15);
    const requiredAgility = this.randomInRange(5, 15);
    const requiredIntelligence = this.randomInRange(5, 15);
    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title,
      description,
      reward: questReward,
      assignedHeroIds: [],
      completed: false,
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
      deadlineDay,
      failResult,
      deadlineResult,
      successResult,
      status: QuestStatus.NotStarted,
    };
    this.quests.push(newQuest);
  };

  randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  onNextDay = () => {
    // Проверяем задания с дедлайном — выполнить или удалить

    const newQuestsCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < newQuestsCount; i++) {
      const quest = this.generateRandomQuest();
      this.quests.push(quest);
    }
  };

  randomInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  generateRandomQuest = (): Quest => {
    const titles = [
      'Спасти деревню',
      'Найти древний артефакт',
      'Защитить караван',
      'Исследовать заброшенный храм',
      'Поймать разбойников',
    ];

    const descriptions = [
      'Деревня подвергается нападениям бандитов. Нужно защитить жителей.',
      'Артефакт обладает магической силой и должен быть возвращён в гильдию.',
      'Караван с товарами под угрозой нападения, нужна охрана.',
      'В заброшенном храме появляются странные создания, нужно разобраться.',
      'Группа разбойников терроризирует окрестности, необходимо их поймать.',
    ];

    const successResults = [
      'Деревня спасена, жители устроили пир в вашу честь.',
      'Артефакт найден и доставлен в гильдию. Мудрецы уже изучают его свойства.',
      'Караван благополучно добрался до города. Торговцы щедро отблагодарили героев.',
      'Храм очищен от чудовищ. Исследователи гильдии начали его изучение.',
      'Разбойники схвачены и переданы местным властям. Мир восстановлен.',
    ];

    const failResults = [
      'Деревня сожжена, уцелевшие жители в панике бежали.',
      'Артефакт так и не был найден. Его сила может попасть не в те руки.',
      'Караван был разграблен. Остатки сожжены, торговцы разорены.',
      'Герои не вернулись из храма. Оттуда доносятся всё более зловещие звуки.',
      'Разбойники ускользнули и теперь действуют ещё более дерзко.',
    ];

    const timeoutResults = [
      'Пока герои собирались, деревня была уничтожена. Спасать уже некого.',
      'Артефакт исчез из места силы. Кто-то другой успел первым.',
      'Караван ушёл без защиты и был атакован. Остались лишь обугленные повозки.',
      'Существа в храме усилились. Теперь туда не осмеливается сунуться ни один герой.',
      'Разбойники ушли в подполье. Теперь их будет куда сложнее выследить.',
    ];

    const idx = Math.floor(Math.random() * titles.length);
    const reward = this.randomInRange(50, 150);
    const deadlineDay = this.timeStore.currentDay + this.randomInRange(3, 5);

    // Требования к статам — чтобы было разное, сделаем рандом в разумных пределах
    const requiredStrength = this.randomInRange(5, 15);
    const requiredAgility = this.randomInRange(5, 15);
    const requiredIntelligence = this.randomInRange(5, 15);

    return {
      id: crypto.randomUUID(),
      title: titles[idx],
      description: descriptions[idx],
      successResult: successResults[idx],
      failResult: failResults[idx],
      deadlineResult: timeoutResults[idx],
      reward,
      assignedHeroIds: [],
      completed: false,
      deadlineDay,
      requiredStrength,
      requiredAgility,
      requiredIntelligence,
      status: QuestStatus.NotStarted,
    };
  };
}
