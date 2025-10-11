import type { FactionId } from '../factions/factions';

export type CitizenTask = {
  title: string;
  description: string;
  successResult: string;
  failResult: string;
  timeoutResult: string;
  goldRange: [number, number];
  woodRange?: [number, number];
  herbRange?: [number, number];
};

export type FactionContractTemplate = {
  title: string;
  description: string;
  successResult: string;
  failResult: string;
  timeoutResult: string;
  goldRange: [number, number];
  stats: {
    strength: [number, number];
    agility: [number, number];
    intelligence: [number, number];
  };
  deadlineRange?: [number, number];
  executionRange?: [number, number];
  resourceRewards?: Record<string, [number, number]>;
  requiredResources?: Record<string, [number, number]>;
  successHeatDelta?: number;
  failureHeatDelta?: number;
  successRepDelta?: number;
  failureRepDelta?: number;
  illegalOverride?: boolean;
};

export type NonCitizenFactionId = Exclude<FactionId, 'citizens'>;

export const CITIZEN_TASKS: CitizenTask[] = [
  {
    title: 'Найти пропавшую кошку',
    description: 'Соседка просит помочь найти её любимицу, которая убежала во дворы.',
    successResult: 'Кошка найдена и возвращена хозяйке. Жители в восторге.',
    failResult: 'Герои вернулись ни с чем, жители расстроены.',
    timeoutResult: 'Пока искали, кошка сама вернулась домой. Помощь больше не требуется.',
    goldRange: [20, 45],
  },
  {
    title: 'Принести дрова для семейной лавки',
    description: 'У лавочника закончились дрова для печи. Он просит помочь пополнить запас.',
    successResult: 'Запасы привезены вовремя, лавочник тепло благодарит.',
    failResult: 'Дров не хватило, лавка работала вполсилы и потеряла клиентов.',
    timeoutResult: 'Соседние мастера уже помогли, заказ отменён.',
    goldRange: [18, 35],
    woodRange: [10, 22],
  },
  {
    title: 'Собрать лечебные травы',
    description: 'Лекарь просит собрать травы вокруг города, чтобы ускорить лечение жителей.',
    successResult: 'Травы собраны, лекарь доволен и делится наградой.',
    failResult: 'Часть трав испорчена по пути, лекарю пришлось искать другие источники.',
    timeoutResult: 'Травы уже собрали другие помощники.',
    goldRange: [25, 40],
    herbRange: [6, 16],
  },
  {
    title: 'Починить забор на окраине',
    description: 'Жители просят подлатать забор, который защищает их от диких зверей.',
    successResult: 'Забор починен, семья чувствует себя в безопасности.',
    failResult: 'Наполовину починенный забор не выдержал ночи, звери снова проникли во двор.',
    timeoutResult: 'Жители решили собрать деньги и нанять плотника позже.',
    goldRange: [22, 38],
    woodRange: [8, 18],
  },
];

export const FACTION_CONTRACT_TEMPLATES: Record<NonCitizenFactionId, FactionContractTemplate[]> = {
  guild: [
    {
      title: 'Организовать тренировочный сбор',
      description: 'Совет гильдий хочет проверить слаженность отрядов на специально подготовленном полигоне.',
      successResult: 'Герои блестяще прошли сборы и подняли дух всей гильдии.',
      failResult: 'Сборы завершились неудачно: выявлены пробелы в подготовке и падает доверие к руководству.',
      timeoutResult: 'Совет гильдий нашёл других инструкторов для тренировок.',
      goldRange: [70, 120],
      stats: {
        strength: [8, 14],
        agility: [6, 12],
        intelligence: [6, 12],
      },
      resourceRewards: {
        guild_renown: [4, 8],
        iron_ore: [12, 22],
      },
    },
    {
      title: 'Отладить алхимическую лабораторию',
      description: 'Алхимики просят навести порядок в лаборатории и собрать свежие ингредиенты.',
      successResult: 'Лаборатория сияет чистотой, а запасы пополнены — исследования ускоряются.',
      failResult: 'В лаборатории произошёл выброс паров, пришлось закрыть на проверку.',
      timeoutResult: 'Алхимики нашли другой отряд, готовый помочь немедленно.',
      goldRange: [65, 110],
      stats: {
        strength: [4, 8],
        agility: [6, 10],
        intelligence: [10, 16],
      },
      resourceRewards: {
        healing_herbs: [10, 18],
        arcane_dust: [4, 9],
      },
      requiredResources: {
        timber: [10, 18],
      },
    },
    {
      title: 'Вербовка перспективного бойца',
      description: 'Гильдия приметела талантливого бойца на окраине. Нужно убедить его вступить.',
      successResult: 'Боец присоединился и укрепил влияние гильдии.',
      failResult: 'Переговоры сорвались, слухи о неудаче разошлись по городу.',
      timeoutResult: 'Кандидат уже подписал контракт с другой гильдией.',
      goldRange: [80, 135],
      stats: {
        strength: [9, 16],
        agility: [7, 12],
        intelligence: [6, 10],
      },
      resourceRewards: {
        guild_renown: [6, 12],
      },
      successHeatDelta: -2,
    },
  ],
  guard: [
    {
      title: 'Ночной патруль ворот',
      description: 'Городская стража просит усилить ночной патруль у южных ворот.',
      successResult: 'Ночь прошла без происшествий, стража довольна сотрудничеством.',
      failResult: 'Патруль пропустил пару подозрительных повозок — доверие падает.',
      timeoutResult: 'Стража нашла другое подкрепление.',
      goldRange: [90, 150],
      stats: {
        strength: [10, 18],
        agility: [8, 14],
        intelligence: [5, 10],
      },
      resourceRewards: {
        city_favor_token: [1, 2],
        monster_parts: [3, 6],
      },
      successHeatDelta: -3,
      failureHeatDelta: 5,
    },
    {
      title: 'Ликвидировать контрабандистов в канализации',
      description: 'В канализации поселилась контрабанда. Нужен быстрый и решительный рейд.',
      successResult: 'Логово ликвидировано, улицы стали безопаснее.',
      failResult: 'Бандиты ушли раньше времени и вывели стражу на ложный след.',
      timeoutResult: 'Контрабандисты успели покинуть логово, след остывает.',
      goldRange: [110, 170],
      stats: {
        strength: [12, 20],
        agility: [10, 16],
        intelligence: [7, 12],
      },
      resourceRewards: {
        iron_ore: [15, 28],
        monster_parts: [4, 8],
      },
      requiredResources: {
        healing_herbs: [4, 7],
      },
      successHeatDelta: -4,
      failureHeatDelta: 6,
    },
    {
      title: 'Расследовать подкупленного писаря',
      description: 'Стража подозревает чиновника в сливе информации преступникам.',
      successResult: 'Коррупционная схема раскрыта, доверие к гильдии растёт.',
      failResult: 'Доказательств оказалось недостаточно, гильдию обвиняют в клевете.',
      timeoutResult: 'Чиновник спешно уехал из города, расследование застопорилось.',
      goldRange: [85, 140],
      stats: {
        strength: [4, 8],
        agility: [7, 12],
        intelligence: [12, 18],
      },
      resourceRewards: {
        city_favor_token: [1, 3],
        guild_charter_fragment: [1, 1],
      },
      requiredResources: {
        guild_renown: [3, 5],
      },
      successHeatDelta: -2,
      failureHeatDelta: 3,
    },
  ],
  merchants: [
    {
      title: 'Сопроводить караван специй',
      description: 'Торговая лига отправляет караван с дорогими специями на северный рынок.',
      successResult: 'Караван прибыл вовремя, торговцы отблагодарили гильдию.',
      failResult: 'Нападение разбойников уничтожило часть товара, убытки значительны.',
      timeoutResult: 'Караван ушёл без защиты и попал в засаду.',
      goldRange: [120, 190],
      stats: {
        strength: [10, 18],
        agility: [8, 14],
        intelligence: [6, 10],
      },
      resourceRewards: {
        timber: [18, 32],
        guild_renown: [5, 9],
      },
      requiredResources: {
        iron_ore: [10, 16],
      },
    },
    {
      title: 'Заключить договор со степными кланами',
      description: 'Необходимо провести переговоры и привезти образцы товаров.',
      successResult: 'Контракт заключён, торговля расширяется.',
      failResult: 'Переговоры зашли в тупик, репутация подмочена.',
      timeoutResult: 'Кланы подписали контракт с конкурентами.',
      goldRange: [140, 210],
      stats: {
        strength: [6, 10],
        agility: [9, 14],
        intelligence: [12, 18],
      },
      resourceRewards: {
        sunstone: [1, 2],
        guild_charter_fragment: [1, 2],
      },
      requiredResources: {
        guild_renown: [4, 6],
      },
    },
    {
      title: 'Стабилизировать рынок городского зерна',
      description: 'Нужно вмешаться в цепочку поставок и предотвратить рост цен.',
      successResult: 'Поставки нормализованы, жители довольны справедливой ценой.',
      failResult: 'Срыв поставок привёл к дефициту и недовольству.',
      timeoutResult: 'Конкуренты скупили зерно и диктуют цены.',
      goldRange: [100, 160],
      stats: {
        strength: [5, 9],
        agility: [8, 13],
        intelligence: [11, 17],
      },
      resourceRewards: {
        timber: [12, 20],
        healing_herbs: [6, 12],
      },
      requiredResources: {
        guild_renown: [4, 6],
      },
    },
  ],
  cartel: [
    {
      title: 'Переправить запрещённые артефакты',
      description: 'Картель хочет, чтобы вы незаметно переправили ящик артефактов через город.',
      successResult: 'Артефакты доставлены, картель доволен.',
      failResult: 'Груз конфискован, картель подозревает предательство.',
      timeoutResult: 'Артефакты нашли другие курьеры, кредит доверия исчерпан.',
      goldRange: [150, 240],
      stats: {
        strength: [8, 14],
        agility: [12, 20],
        intelligence: [9, 14],
      },
      resourceRewards: {
        arcane_dust: [6, 12],
      },
      successHeatDelta: 5,
      failureHeatDelta: 8,
      illegalOverride: true,
    },
    {
      title: 'Подкупить чиновника налоговой службы',
      description: 'Нужно обеспечить лояльность чиновника, отвечающего за инспекции складов.',
      successResult: 'Чиновник согласился, проверки проводятся номинально.',
      failResult: 'Подкуп раскрыт, поднята тревога.',
      timeoutResult: 'Конкурирующая группировка успела связаться первой.',
      goldRange: [130, 210],
      stats: {
        strength: [4, 8],
        agility: [9, 14],
        intelligence: [13, 18],
      },
      resourceRewards: {
        guild_charter_fragment: [1, 2],
      },
      requiredResources: {
        guild_renown: [6, 10],
      },
      successHeatDelta: 4,
      failureHeatDelta: 7,
      illegalOverride: true,
    },
    {
      title: 'Устранить свидетелей сделки',
      description: 'Пара свидетелей мешает картелю. Нужна тихая и решительная операция.',
      successResult: 'Все угрозы устранены, следы замяты.',
      failResult: 'Свидетели сбежали и унесли с собой компромат.',
      timeoutResult: 'Свидетели уже покинули город и ищут защиты у стражи.',
      goldRange: [160, 260],
      stats: {
        strength: [14, 22],
        agility: [12, 19],
        intelligence: [8, 12],
      },
      resourceRewards: {
        monster_parts: [6, 12],
        arcane_dust: [5, 10],
      },
      successHeatDelta: 6,
      failureHeatDelta: 9,
      illegalOverride: true,
    },
  ],
};
