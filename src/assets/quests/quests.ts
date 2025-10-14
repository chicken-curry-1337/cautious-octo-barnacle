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
  districtId?: string;
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
  districtId?: string;
};

export type NonCitizenFactionId = Exclude<FactionId, 'citizens'>;

export const CITIZEN_TASKS: CitizenTask[] = [
  {
    title: 'Найти котёнка лавочника',
    description: 'Торговцы с рынка в {{district}} потеряли любимца, который забрался на крыши прилавков.',
    successResult: 'Котёнок найден и возвращён, благодарные лавочники дарят свежие товары.',
    failResult: 'Поиски не увенчались успехом — торговцы разочарованы.',
    timeoutResult: 'Пока гильдия собиралась, котёнок сам вернулся к хозяевам.',
    goldRange: [22, 48],
    districtId: 'market',
  },
  {
    title: 'Привезти дрова в поселение',
    description: 'Жители окрестных деревень возле {{district}} просят пополнить запас дров к холодной ночи.',
    successResult: 'Дрова привезены вовремя, жители обещают поддержку гильдии.',
    failResult: 'Запасы пришлось делить с соседями — деревня едва согрелась.',
    timeoutResult: 'Соседи нашли другого поставщика, контракт сорван.',
    goldRange: [18, 35],
    woodRange: [10, 22],
    districtId: 'outskirts',
  },
  {
    title: 'Собрать лечебные травы',
    description: 'Полевая знахарка из {{district}} просит пополнить запасы редких трав на болотных кочках.',
    successResult: 'Зелья сварены вовремя, знахарка благодарит гильдию.',
    failResult: 'Часть трав испорчена, жители не получают лечение вовремя.',
    timeoutResult: 'Травы собрали деревенские дети, контракт потерян.',
    goldRange: [25, 40],
    herbRange: [6, 16],
    districtId: 'outskirts',
  },
  {
    title: 'Укрепить защитный частокол',
    description: 'Крестьяне из {{district}} просят укрепить частокол, чтобы звери и разбойники не проникали в поселение.',
    successResult: 'Частокол выдержал первую ночь, жители чувствуют себя защищёнными.',
    failResult: 'Частокол рухнул, стража вынуждена дежурить круглосуточно.',
    timeoutResult: 'Жители наняли местного плотника, контракт утрачено.',
    goldRange: [22, 38],
    woodRange: [8, 18],
    districtId: 'outskirts',
  },
  {
    title: 'Помочь с разгрузкой каравана',
    description: 'Капитаны из {{district}} ищут надёжную команду для разгрузки ночного каравана и охраны складов.',
    successResult: 'Грузы разгружены без происшествий, купцы довольны.',
    failResult: 'Часть товара пропала, купцы требуют компенсацию.',
    timeoutResult: 'Караван нашёл другую гильдию, порт недоволен промедлением.',
    goldRange: [28, 55],
    districtId: 'harbor',
  },
  {
    title: 'Патруль в переулках',
    description: 'Жители {{district}} жалуются на ночные гуляния банды и просят провести показательный патруль.',
    successResult: 'Патруль показал силу гильдии, банда временно исчезла.',
    failResult: 'Отряд попал в засаду, в переулках стало ещё опаснее.',
    timeoutResult: 'Местные наняли картельщиков, чтобы разогнать хулиганов.',
    goldRange: [30, 52],
    districtId: 'shadows',
  },
];

export const FACTION_CONTRACT_TEMPLATES: Record<NonCitizenFactionId, FactionContractTemplate[]> = {
  guild: [
    {
      title: 'Организовать тренировочный сбор',
      description: 'Совет гильдий хочет проверить слаженность отрядов на полигоне в {{district}}.',
      successResult: 'Герои блестяще прошли сборы на плацу {{district}}, подняв дух всей гильдии.',
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
      districtId: 'arcane_spire',
    },
    {
      title: 'Отладить алхимическую лабораторию',
      description: 'Алхимики из {{district}} просят навести порядок в лаборатории и пополнить запасы ингредиентов.',
      successResult: 'Лаборатория в {{district}} сияет чистотой, исследования ускоряются.',
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
      districtId: 'arcane_spire',
    },
    {
      title: 'Вербовка перспективного бойца',
      description: 'Гильдия приметила талантливого бойца на улицах {{district}}. Нужно убедить его вступить.',
      successResult: 'Боец из {{district}} присоединился и укрепил влияние гильдии.',
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
      districtId: 'market',
    },
  ],
  guard: [
    {
      title: 'Ночной патруль ворот',
      description: 'Стража просит усилить ночной патруль у ворот в районе {{district}}.',
      successResult: 'Ночь в {{district}} прошла без происшествий, стража довольна сотрудничеством.',
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
      districtId: 'harbor',
    },
    {
      title: 'Ликвидировать контрабандистов в канализации',
      description: 'В подземных ходах под {{district}} поселилась контрабанда. Нужен быстрый рейд.',
      successResult: 'Логово под {{district}} ликвидировано, улицы стали безопаснее.',
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
      districtId: 'shadows',
    },
    {
      title: 'Расследовать подкупленного писаря',
      description: 'Стража подозревает писаря из {{district}} в сливе информации преступникам.',
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
      districtId: 'crownward',
    },
  ],
  merchants: [
    {
      title: 'Сопроводить караван специй',
      description: 'Торговая лига отправляет караван с дорогими специями через причалы {{district}} и просит организовать охрану.',
      successResult: 'Караван прибыл вовремя, торговцы из {{district}} отблагодарили гильдию.',
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
      districtId: 'harbor',
    },
    {
      title: 'Заключить договор со степными кланами',
      description: 'Необходимо провести переговоры с кланами на площади {{district}} и привезти образцы товаров.',
      successResult: 'Контракт заключён, торговля в {{district}} расширяется.',
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
      districtId: 'market',
    },
    {
      title: 'Стабилизировать рынок городского зерна',
      description: 'Нужно вмешаться в цепочку поставок в {{district}} и предотвратить рост цен.',
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
      districtId: 'market',
    },
  ],
  cartel: [
    {
      title: 'Переправить запрещённые артефакты',
      description: 'Картель хочет, чтобы вы незаметно переправили ящик артефактов через переулки {{district}}.',
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
      districtId: 'shadows',
    },
    {
      title: 'Подкупить чиновника налоговой службы',
      description: 'Нужно обеспечить лояльность чиновника в канцелярии {{district}}, отвечающего за инспекции складов.',
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
      districtId: 'crownward',
    },
    {
      title: 'Устранить свидетелей сделки',
      description: 'Пара свидетелей мешает картелю. Нужна тихая операция в трущобах {{district}}.',
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
      districtId: 'shadows',
    },
  ],
};
