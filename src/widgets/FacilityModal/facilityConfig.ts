import { barracksDialogue } from '../../assets/dialogues/facilities/barracksDialogue';
import { contractBoardDialogue } from '../../assets/dialogues/facilities/contractBoardDialogue';
import { diplomacyDialogue } from '../../assets/dialogues/facilities/diplomacyDialogue';
import { dispatchDialogue } from '../../assets/dialogues/facilities/dispatchDialogue';
import { financeDialogue } from '../../assets/dialogues/facilities/financeDialogue';
import { guildHallDialogue } from '../../assets/dialogues/facilities/guildHallDialogue';
import { intelCenterDialogue } from '../../assets/dialogues/facilities/intelDialogue';
import { infirmaryCaretakerDialogue } from '../../assets/dialogues/facilities/medicDialogue';
import { quartersDialogue } from '../../assets/dialogues/facilities/quartersDialogue';
import { shadowNetworkDialogue } from '../../assets/dialogues/facilities/shadowDialogue';
import { workshopCaretakerDialogue } from '../../assets/dialogues/facilities/workshopDialogue';
import type { DialogueData } from '../../entities/Dialogue/Dialogue.store';

type CaretakerInfo = {
  name: string;
  role: string;
  portrait?: string;
  greeting: string;
};

export type FacilityDefinition = {
  id: string;
  title: string;
  description: string;
  unlockUpgradeId?: string;
  defaultOpen?: boolean;
  caretaker: CaretakerInfo;
  ambientNotes?: string[];
  dialogue?: DialogueData;
  upgradeIds: string[];
};

export const FACILITY_DEFINITIONS: FacilityDefinition[] = [
  {
    id: 'guild_hall',
    title: 'Главный зал гильдии',
    description: 'Сердце организации. Здесь решаются стратегические вопросы и расширяются основные мощности гильдии.',
    defaultOpen: true,
    caretaker: {
      name: 'Интендант Эллия',
      role: 'координатор гильдии',
      portrait: '/vite.svg',
      greeting: 'Храни порядок в сердце гильдии — остальное приложится.',
    },
    ambientNotes: [
      'В большом зале висят штандарты прошлых побед.',
      'Столы заставлены картами и журналами миссий.',
    ],
    dialogue: guildHallDialogue,
    upgradeIds: ['up_guild_hall_expand_1', 'up_guild_hall_expand_2'],
  },
  {
    id: 'contract_board',
    title: 'Доска контрактов',
    description: 'Помещение для работы с заказчиками и отбора контрактов для героев.',
    unlockUpgradeId: '1',
    caretaker: {
      name: 'Куратор Мила',
      role: 'заведующая контрактами',
      portrait: '/vite.svg',
      greeting: 'Каждый заказ — шанс прославить гильдию или утонуть в долгах. Выбирай с умом.',
    },
    ambientNotes: [
      'На стенах висят объявления от граждан и фракций.',
      'Помощники сортируют свежие заказы по степени опасности.',
    ],
    dialogue: contractBoardDialogue,
    upgradeIds: ['1', 'up_board_plus', 'up_board_plus_2', 'up_merchants_exchange'],
  },
  {
    id: 'dispatch',
    title: 'Диспетчерский центр',
    description: 'Комната, где планируют вылазки, управляют отрядами и анализируют риски.',
    unlockUpgradeId: 'up_dispatch',
    caretaker: {
      name: 'Диспетчер Аллен',
      role: 'координатор операций',
      portrait: '/vite.svg',
      greeting: 'Главное — грамотно распределить силы. Тогда и отчёты будут приятными.',
    },
    ambientNotes: [
      'Сложенные карты показывают маршруты отрядов.',
      'На столах мигают арканные метки с обновлениями миссий.',
    ],
    dialogue: dispatchDialogue,
    upgradeIds: ['up_dispatch', 'up_dispatch_pro', 'up_parallel', 'up_parallel_2', 'up_tactics'],
  },
  {
    id: 'quarters',
    title: 'Жилые кварталы',
    description: 'Отдельный блок для отдыха героев, тренировок и работы с наставниками.',
    unlockUpgradeId: 'up_quarters',
    caretaker: {
      name: 'Завхоз Лена',
      role: 'управляющая жильём',
      portrait: '/vite.svg',
      greeting: 'Уставший герой — рискованный герой. Дайте им восстановиться как следует.',
    },
    ambientNotes: [
      'Герои обсуждают свои последние задания в общей столовой.',
      'Наставники проверяют физподготовку новобранцев.',
    ],
    dialogue: quartersDialogue,
    upgradeIds: ['up_quarters', 'up_quarters_lux', 'up_citizen_hall', 'up_mentors', 'up_mentors_guildschool'],
  },
  {
    id: 'medic',
    title: 'Лазарет',
    description: 'Место, где целители помогают героям восстановиться после опасных миссий.',
    unlockUpgradeId: 'up_medic',
    caretaker: {
      name: 'Тера Эвия',
      role: 'старшая целительница',
      portrait: '/vite.svg',
      greeting: 'Убедись, что герои вернутся в строй, прежде чем отправлять их в следующую мясорубку.',
    },
    ambientNotes: [
      'Воздух наполнен ароматами трав и приглушёнными голосами целителей.',
      'Герои рассказывают о своих приключениях, пока им меняют повязки.',
    ],
    dialogue: infirmaryCaretakerDialogue,
    upgradeIds: ['up_medic', 'up_medic_surgeon'],
  },
  {
    id: 'workshop',
    title: 'Мастерская',
    description: 'Кузнецы и зачарователи работают над экипировкой и ремонтом снаряжения.',
    unlockUpgradeId: 'up_workshop',
    caretaker: {
      name: 'Борин Кластер',
      role: 'мастер-кузнец',
      portrait: '/vite.svg',
      greeting: 'Сплавы, руны и капля удачи — так рождается легендарное оружие!',
    },
    ambientNotes: [
      'Стенки увешаны чертежами и образцами рун.',
      'Ученики спорят о лучших методах закалки стали.',
    ],
    dialogue: workshopCaretakerDialogue,
    upgradeIds: ['up_workshop', 'up_workshop_arcane'],
  },
  {
    id: 'barracks',
    title: 'Кадровый двор',
    description: 'Отдел рекрутинга, где находят, обучают и нанимают новых героев.',
    unlockUpgradeId: 'up_barracks',
    caretaker: {
      name: 'Тренер Гальвин',
      role: 'мастер аттестации',
      portrait: '/vite.svg',
      greeting: 'Хочешь элиту — готовь условия. Люди не приходят просто так.',
    },
    ambientNotes: [
      'Новички проходят испытания на ловкость и выдержку.',
      'Доска с результатами боёв мотивирует рекрутов.',
    ],
    dialogue: barracksDialogue,
    upgradeIds: ['up_barracks', 'up_barracks_elite'],
  },
  {
    id: 'intel_center',
    title: 'Разведцентр',
    description: 'Связной пункт, где собирают информацию о заданиях и скрытых угрозах.',
    unlockUpgradeId: 'up_scouthub',
    caretaker: {
      name: 'Разведчица Кайя',
      role: 'координатор разведки',
      portrait: '/vite.svg',
      greeting: 'Чем больше мы знаем, тем меньше сюрпризов ждёт отряд за городом.',
    },
    ambientNotes: [
      'На стенах висят карты с отметками подозрительных зон.',
      'Гонцы передают донесения прямо из диких земель.',
    ],
    dialogue: intelCenterDialogue,
    upgradeIds: ['up_scouthub', 'up_whispernet', 'up_whispernet_black'],
  },
  {
    id: 'diplomacy',
    title: 'Дипломатическая гостиная',
    description: 'Кабинет переговоров для работы с официальными фракциями города.',
    unlockUpgradeId: 'up_lobby',
    caretaker: {
      name: 'Связист Карэн',
      role: 'координатор переговоров',
      portrait: '/vite.svg',
      greeting: 'Улыбайся, даже если перед тобой заносчивый чиновник. В этом весь секрет.',
    },
    ambientNotes: [
      'На полках хранятся свитки договоров и печати городского совета.',
      'Представители фракций обсуждают условия сотрудничества.',
    ],
    dialogue: diplomacyDialogue,
    upgradeIds: ['up_lobby', 'up_lobby_guild', 'up_guard_watchtower'],
  },
  {
    id: 'finance',
    title: 'Казначейство',
    description: 'Офис, где ведут бухгалтерию гильдии и страхуют контракты.',
    unlockUpgradeId: 'up_insurance',
    caretaker: {
      name: 'Казначей Сорвик',
      role: 'финансовый управляющий',
      portrait: '/vite.svg',
      greeting: 'Грамотные инвестиции спасут гильдию прежде, чем её спасёт клинок.',
    },
    ambientNotes: [
      'Звук счётов и шелест бумаг создают ощущение покоя.',
      'На стене висит диаграмма доходов по категориям.',
    ],
    dialogue: financeDialogue,
    upgradeIds: ['up_insurance', 'up_black_budget'],
  },
  {
    id: 'shadow_network',
    title: 'Теневая сеть',
    description: 'Закрытое помещение для работы с нелегальными операциями и сокрытием следов.',
    unlockUpgradeId: 'up_fence',
    caretaker: {
      name: 'Контакт Шейд',
      role: 'управляющий серыми делами',
      portrait: '/vite.svg',
      greeting: 'Иногда выгоднее знать, кого подкупить, чем с кем сражаться.',
    },
    ambientNotes: [
      'Шёпот агентов растворяется в полумраке.',
      'Под витражами лежат запечатанные досье на городских чиновников.',
    ],
    dialogue: shadowNetworkDialogue,
    upgradeIds: ['up_fence', 'up_safehouse', 'up_cartel_passage', 'up_cleaners'],
  },
];

export const FACILITY_BY_ID = FACILITY_DEFINITIONS.reduce<Record<string, FacilityDefinition>>((acc, facility) => {
  acc[facility.id] = facility;

  return acc;
}, {});

export const FACILITY_BY_UNLOCK_UPGRADE = FACILITY_DEFINITIONS.reduce<Record<string, FacilityDefinition>>((acc, facility) => {
  if (facility.unlockUpgradeId) {
    acc[facility.unlockUpgradeId] = facility;
  }

  return acc;
}, {});
