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
      text: 'Балансы сведены, глава. Хотите увидеть отчёт или обсудим страховые схемы?',
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
      text: 'Доходы от квестов стабильны, но траты на инфраструктуру растут. Рекомендую страховые гарантии и резервы.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'emergency',
      visibleCharacterIds: ['caretaker_sorvik', 'player_fin'],
      activeCharacterIds: ['caretaker_sorvik'],
      text: 'Чёрная касса позволит взять займ под контролируемый процент. Только не злоупотребляйте — проценты кусачие.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_sorvik', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Отлично. Дальше разберусь сам.',
      options: [],
      isLast: true,
    },
  ],
};
