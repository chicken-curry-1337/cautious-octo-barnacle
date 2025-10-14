import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const guildHallDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_ellia',
      name: 'Интендант Эллия',
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
      visibleCharacterIds: ['caretaker_ellia', 'player_fin'],
      activeCharacterIds: ['caretaker_ellia'],
      text: 'Глава, любые обращения героев, поставщиков и чиновников проходят через меня. Что поставим в приоритет сегодня?',
      options: [
        { text: 'Как держится гильдия в целом?', nextId: 'status' },
        { text: 'Нужно расставить акценты на развитие.', nextId: 'planning' },
        { text: 'Пока всё ясно, продолжай.', nextId: 'farewell' },
      ],
    },
    {
      id: 'status',
      visibleCharacterIds: ['caretaker_ellia', 'player_fin'],
      activeCharacterIds: ['caretaker_ellia'],
      text: 'Бюджет напряжённый, но в пределах допустимого. Герои ждут комфортных условий и понятных приказов. Расширение здания не помешает.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'planning',
      visibleCharacterIds: ['caretaker_ellia', 'player_fin'],
      activeCharacterIds: ['caretaker_ellia'],
      text: 'Рекомендую укрепить основные залы, прежде чем гнаться за экзотикой. Расширение привлечёт новых специалистов и снимет ограничения по штату.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_ellia', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Понял. Продолжай держать руку на пульсе.',
      options: [],
      isLast: true,
    },
  ],
};
