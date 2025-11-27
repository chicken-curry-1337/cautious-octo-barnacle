import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const financeDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_sorvik',
      name: 'Казначей Сорвик',
      avatarUrl: '/vite.svg',
    },
    {
      id: 'player_fin',
      name: 'Фин',
      avatarUrl: '/vite.svg',
    },
  ],
  nodes: [
    {
      id: 'start',
      visibleCharacterIds: ['caretaker_sorvik', 'player_fin'],
      activeCharacterIds: ['caretaker_sorvik'],
      text: '{{greeting:caretaker_sorvik}} {{tone:caretaker_sorvik|Балансы сияют, и я готов устроить тебе приватный разбор цифр.|Балансы сведены. Показать отчёт или обсудим страховые схемы?|Балансы держатся на честном слове. Шевелись, пока я не списал тебя в убытки.}}',
      options: [
        { text: 'Покажи текущий финансовый прогноз.', nextId: 'report' },
        { text: 'Давай про запасные фонды.', nextId: 'emergency' },
        { text: 'Пока хватит цифр.', nextId: 'farewell' },
      ],
    },
    {
      id: 'report',
      visibleCharacterIds: ['caretaker_sorvik', 'player_fin'],
      activeCharacterIds: ['caretaker_sorvik'],
      text: '{{tone:caretaker_sorvik|Доходы растут быстрее расходов — идеальный повод вложиться и отметить это вдвоём.|Доходы от квестов стабильны, но траты на инфраструктуру растут. Рекомендую страховые резервы.|Доходы проседают, траты растут. Если проигнорируешь, рухнем вместе с твоей репутацией.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'emergency',
      visibleCharacterIds: ['caretaker_sorvik', 'player_fin'],
      activeCharacterIds: ['caretaker_sorvik'],
      text: '{{tone:caretaker_sorvik|Чёрная касса даст нам гибкость и пару лишних часов, чтобы отпраздновать победу наедине.|Чёрная касса позволит взять займ под контролируемый процент. Только не злоупотребляй.|Касса спасёт только если перестанем прожигать золото. Иначе проценты сожрут тебя.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_sorvik', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_sorvik|Отлично, подготовь цифры, потом обсудим их где потише.|Принято. Дальше разберусь сам.|Ладно, попробую не дать бюджету развалиться, даже если ты ворчишь.}}',
      options: [],
      isLast: true,
    },
  ],
};
