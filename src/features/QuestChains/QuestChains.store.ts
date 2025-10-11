import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

import { cartelLeaderDialogue } from '../../assets/dialogues/leaders/cartelLeaderDialogue';
import { citizensLeaderDialogue } from '../../assets/dialogues/leaders/citizensLeaderDialogue';
import { guardLeaderDialogue } from '../../assets/dialogues/leaders/guardLeaderDialogue';
import { guildLeaderDialogue } from '../../assets/dialogues/leaders/guildLeaderDialogue';
import { merchantsLeaderDialogue } from '../../assets/dialogues/leaders/merchantsLeaderDialogue';
import type { FactionId } from '../../assets/factions/factions';
import cartelLeaderPortrait from '../../assets/images/leaders/cartel-leader.svg';
import citizensLeaderPortrait from '../../assets/images/leaders/citizens-leader.svg';
import guardLeaderPortrait from '../../assets/images/leaders/guard-leader.svg';
import guildLeaderPortrait from '../../assets/images/leaders/guild-leader.svg';
import merchantsLeaderPortrait from '../../assets/images/leaders/merchants-leader.svg';
import type { DialogueData } from '../../entities/Dialogue/Dialogue.store';

export interface QuestChainStage {
  title: string;
  description: string;
  successResult: string;
  failResult: string;
  deadlineResult: string;
  rewardMin: number;
  rewardMax: number;
  reqStats: { str: [number, number]; agi: [number, number]; int: [number, number] };
  deadlineRange?: [number, number];
  executionRange?: [number, number];
  resourceRewards?: Record<string, number>;
  requiredResources?: Record<string, number>;
  successHeatDelta?: number;
  failureHeatDelta?: number;
  isIllegal?: boolean;
  unlockLeader?: boolean;
}

export interface QuestChainDefinition {
  id: string;
  factionId: FactionId;
  leaderName: string;
  leaderTitle: string;
  leaderPortraitUrl: string;
  leaderDialogue: DialogueData;
  leaderDialogueStartId?: string;
  stages: QuestChainStage[];
}

export const questChainsConfig: Record<string, QuestChainDefinition> = {
  guild_chain: {
    id: 'guild_chain',
    factionId: 'guild',
    leaderName: 'Лисандра Хельвик',
    leaderTitle: 'Примарх Совета гильдий',
    leaderPortraitUrl: guildLeaderPortrait,
    leaderDialogue: guildLeaderDialogue,
    stages: [
      {
        title: 'Архивы под замком',
        description: 'Совету требуется очистить древние архивы от пыли и нечисти, чтобы подготовить их к проверке Лисандры Хельвик.',
        successResult: 'Архивы сияют чистотой, а найденные манускрипты впечатлили Совет.',
        failResult: 'Проверка сорвалась. Совет недоволен, а Лисандра откладывает встречу.',
        deadlineResult: 'Документы так и не были готовы, инспекторы увезли их на хранение.',
        rewardMin: 140,
        rewardMax: 200,
        reqStats: { str: [8, 12], agi: [8, 12], int: [12, 16] },
        resourceRewards: { guild_renown: 6, arcane_dust: 4 },
      },
      {
        title: 'Испытание стратегов',
        description: 'Лисандра хочет видеть новые тактики. Проведите учения и представьте отчёт о боевых построениях.',
        successResult: 'Учения прошли безукоризненно, Совет впервые заговорил о доверии.',
        failResult: 'Учения обернулись хаосом; стратегии признаны несостоятельными.',
        deadlineResult: 'Гильдия перешла к планам резервного отряда, ваша помощь не понадобилась.',
        rewardMin: 160,
        rewardMax: 230,
        reqStats: { str: [10, 15], agi: [10, 15], int: [14, 18] },
        resourceRewards: { guild_renown: 8, iron_ore: 18 },
      },
      {
        title: 'Личная инспекция Лисандры',
        description: 'Финальная проверка всей инфраструктуры. Лисандра лично прибудет оценить ваши успехи.',
        successResult: 'Лисандра впечатлена и предлагает личный канал связи с Советом.',
        failResult: 'Инспекция выявила недоработки. Лисандра прекращает диалог до исправления ситуации.',
        deadlineResult: 'Инспекция сорвалась, Лисандра улетела по делам.',
        rewardMin: 220,
        rewardMax: 300,
        reqStats: { str: [12, 18], agi: [12, 18], int: [16, 20] },
        resourceRewards: { guild_renown: 12, city_favor_token: 1 },
        unlockLeader: true,
      },
    ],
  },
  guard_chain: {
    id: 'guard_chain',
    factionId: 'guard',
    leaderName: 'Капитан Арина Стеллар',
    leaderTitle: 'Командующая городской стражей',
    leaderPortraitUrl: guardLeaderPortrait,
    leaderDialogue: guardLeaderDialogue,
    stages: [
      {
        title: 'Западный дозор',
        description: 'Арина Стеллар поручает проверить западные укрепления и устранить уязвимости.',
        successResult: 'Крепостные стены укреплены, патрули благодарят вас.',
        failResult: 'Проверка выявила серьёзные просчёты, стража вынуждена покараулить сама.',
        deadlineResult: 'Стража справилась силами резервного гарнизона.',
        rewardMin: 150,
        rewardMax: 210,
        reqStats: { str: [12, 18], agi: [10, 16], int: [8, 14] },
        resourceRewards: { city_favor_token: 1, iron_ore: 12 },
        successHeatDelta: -2,
      },
      {
        title: 'Тихая зачистка',
        description: 'Необходимо провести скрытную операцию против контрабандистов, снабжающих мятежников оружием.',
        successResult: 'Склад очищен, контрабандисты обезврежены. Арина довольна.',
        failResult: 'Слышны выстрелы, операция провалена. Контрабандисты ускользнули.',
        deadlineResult: 'Стража провела рейд самостоятельно, но информация утекла.',
        rewardMin: 180,
        rewardMax: 240,
        reqStats: { str: [14, 20], agi: [12, 18], int: [10, 16] },
        resourceRewards: { monster_parts: 6, city_favor_token: 1 },
        requiredResources: { healing_herbs: 6 },
        successHeatDelta: -3,
        failureHeatDelta: 5,
      },
      {
        title: 'Совет с капитаном',
        description: 'Арина собирает экстренный совет и ждёт от вас аналитики о безопасности города.',
        successResult: 'Благодаря вашим данным Арина открыла канал прямой связи.',
        failResult: 'Отчёт поверхностен, Арина разочарована.',
        deadlineResult: 'Совет прошёл без вас, решения приняты без поддержки гильдии.',
        rewardMin: 240,
        rewardMax: 320,
        reqStats: { str: [16, 22], agi: [14, 20], int: [14, 20] },
        resourceRewards: { city_favor_token: 2, guild_charter_fragment: 1 },
        unlockLeader: true,
        successHeatDelta: -4,
      },
    ],
  },
  merchants_chain: {
    id: 'merchants_chain',
    factionId: 'merchants',
    leaderName: 'Комесса Верена Дааль',
    leaderTitle: 'Председатель Торговой Лиги',
    leaderPortraitUrl: merchantsLeaderPortrait,
    leaderDialogue: merchantsLeaderDialogue,
    stages: [
      {
        title: 'Срыв блокад',
        description: 'Верена просит снять блокаду с южного тракта, где конкуренты устроили «ремонтные работы».',
        successResult: 'Проезд свободен, караваны двинулись раньше срока.',
        failResult: 'Конкуренты подкупили охрану, блокаду снять не удалось.',
        deadlineResult: 'Лига наняла другую команду и выполнила задание самостоятельно.',
        rewardMin: 160,
        rewardMax: 220,
        reqStats: { str: [10, 16], agi: [12, 18], int: [10, 16] },
        resourceRewards: { timber: 20, guild_renown: 6 },
      },
      {
        title: 'Форум договоров',
        description: 'Нужно сопроводить Верену на торговый форум и защитить документы от промышленного шпионажа.',
        successResult: 'Сделки заключены на выгодных условиях, Верена довольна.',
        failResult: 'Документы похищены, форум сорван.',
        deadlineResult: 'Форум завершился без вашего участия, сделки ушли конкурентам.',
        rewardMin: 190,
        rewardMax: 260,
        reqStats: { str: [12, 18], agi: [12, 18], int: [14, 20] },
        resourceRewards: { sunstone: 1, guild_charter_fragment: 1 },
        requiredResources: { guild_renown: 6 },
      },
      {
        title: 'Совет Верены',
        description: 'Верена готовит закрытый совет Лиги и хочет услышать ваш план экспансии.',
        successResult: 'Ваш план принят, Верена предлагает личные переговоры.',
        failResult: 'Совет отверг ваши предложения, авторитет гильдии пошатнулся.',
        deadlineResult: 'Совет прошёл без вас.',
        rewardMin: 250,
        rewardMax: 340,
        reqStats: { str: [14, 20], agi: [14, 20], int: [16, 22] },
        resourceRewards: { guild_renown: 12, city_favor_token: 1 },
        unlockLeader: true,
      },
    ],
  },
  cartel_chain: {
    id: 'cartel_chain',
    factionId: 'cartel',
    leaderName: 'Кассандра Ноктюрн',
    leaderTitle: 'Теневая Матриарх картеля',
    leaderPortraitUrl: cartelLeaderPortrait,
    leaderDialogue: cartelLeaderDialogue,
    stages: [
      {
        title: 'Теневой обмен',
        description: 'Кассандра требует организовать подпольный обмен артефактами без шума.',
        successResult: 'Сделка прошла идеально, Кассандра впечатлена.',
        failResult: 'Артефакт пропал, картель в ярости.',
        deadlineResult: 'Сделку провёл другой курьер, вам не доверили ни монеты.',
        rewardMin: 180,
        rewardMax: 260,
        reqStats: { str: [10, 16], agi: [14, 20], int: [12, 18] },
        resourceRewards: { arcane_dust: 8, monster_parts: 5 },
        successHeatDelta: 4,
        failureHeatDelta: 8,
        isIllegal: true,
      },
      {
        title: 'Шепоты в совете',
        description: 'Нужно внедрить информатора в совет конкурирующей банды.',
        successResult: 'Информатор успешно внедрён, потоки сведений идут прямиком к вам.',
        failResult: 'Информатора раскрыли, картель требует объяснений.',
        deadlineResult: 'Картель нашёл другого кандидата, а вы лишились награды.',
        rewardMin: 210,
        rewardMax: 300,
        reqStats: { str: [12, 18], agi: [16, 22], int: [14, 20] },
        resourceRewards: { arcane_dust: 10, guild_charter_fragment: 1 },
        successHeatDelta: 5,
        failureHeatDelta: 9,
        isIllegal: true,
      },
      {
        title: 'Аудиенция Матриарха',
        description: 'Кассандра хочет увидеться с теми, кому можно доверить будущее картеля.',
        successResult: 'Матриарх признаёт вас союзниками и открывает личный канал связи.',
        failResult: 'Матриарх разочарована и прекращает контакт.',
        deadlineResult: 'Встреча отменена, Матриарх ушла в тень.',
        rewardMin: 270,
        rewardMax: 360,
        reqStats: { str: [14, 20], agi: [18, 24], int: [16, 22] },
        resourceRewards: { monster_parts: 8, arcane_dust: 12 },
        successHeatDelta: 6,
        failureHeatDelta: 10,
        unlockLeader: true,
        isIllegal: true,
      },
    ],
  },
  citizens_chain: {
    id: 'citizens_chain',
    factionId: 'citizens',
    leaderName: 'Старейшина Мирелла',
    leaderTitle: 'Голос жителей Равенфорда',
    leaderPortraitUrl: citizensLeaderPortrait,
    leaderDialogue: citizensLeaderDialogue,
    stages: [
      {
        title: 'Праздник урожая',
        description: 'Мирелла просит помочь организовать праздник, чтобы поднять дух горожан.',
        successResult: 'Праздник удался, жители поют о вашей гильдии.',
        failResult: 'Праздник провалился, жители обвиняют гильдию.',
        deadlineResult: 'Праздник отменён из-за недостатка подготовки.',
        rewardMin: 120,
        rewardMax: 180,
        reqStats: { str: [6, 12], agi: [8, 14], int: [10, 16] },
        resourceRewards: { timber: 12, healing_herbs: 8 },
      },
      {
        title: 'Укротители набережной',
        description: 'Сильные приливы разрушают пирсы. Нужна команда, чтобы укрепить набережную.',
        successResult: 'Пирсы спасены, рыбаки благодарят вас.',
        failResult: 'Часть пирса обвалилась, ущерб серьёзный.',
        deadlineResult: 'Ремонт перенёсся на неопределённый срок.',
        rewardMin: 150,
        rewardMax: 210,
        reqStats: { str: [10, 16], agi: [10, 16], int: [12, 18] },
        resourceRewards: { timber: 18, healing_herbs: 10 },
        requiredResources: { timber: 10 },
      },
      {
        title: 'Встреча с Миреллой',
        description: 'Мирелла хочет обсудить будущее сотрудничество и сформировать Совет жителей.',
        successResult: 'Мирелла доверяет вам и открывает канал прямого общения.',
        failResult: 'Совет жителей раскритиковал ваши предложения.',
        deadlineResult: 'Собрание перенесли, жители устали ждать.',
        rewardMin: 200,
        rewardMax: 260,
        reqStats: { str: [12, 18], agi: [12, 18], int: [14, 20] },
        resourceRewards: { guild_renown: 10, city_favor_token: 1 },
        unlockLeader: true,
      },
    ],
  },
};

@singleton()
export class QuestChainsStore {
  questChainsProgress: Record<string, number>;

  constructor() {
    this.questChainsProgress = Object.keys(questChainsConfig).reduce<Record<string, number>>((acc, chainId) => {
      acc[chainId] = 0;

      return acc;
    }, {});

    makeAutoObservable(this);
  }
}
