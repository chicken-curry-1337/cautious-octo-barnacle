import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const contractBoardDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_mila',
      name: 'Куратор Мила',
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
      visibleCharacterIds: ['caretaker_mila', 'player_fin'],
      activeCharacterIds: ['caretaker_mila'],
      text: 'Глава, новые объявления уже разобраны по важности. Желаете пролистать срочные или отложить редкие?',
      options: [
        { text: 'Покажи, что принесло больше всего шума.', nextId: 'hot' },
        { text: 'Нас интересует стабильный заработок.', nextId: 'stable' },
        { text: 'Пока всё. Держи доску в порядке.', nextId: 'farewell' },
      ],
    },
    {
      id: 'hot',
      visibleCharacterIds: ['caretaker_mila', 'player_fin'],
      activeCharacterIds: ['caretaker_mila'],
      text: 'Есть цепочка для стражи и рискованный заказ от картеля. Оба требуют сильных отрядов и аккуратности.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'stable',
      visibleCharacterIds: ['caretaker_mila', 'player_fin'],
      activeCharacterIds: ['caretaker_mila'],
      text: 'Горожане просят о помощи с бытовыми делами. Награда скромнее, зато репутация у граждан растёт.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_mila', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Принято. Сообщи мне, если появится что-то необычное.',
      options: [],
      isLast: true,
    },
  ],
};
