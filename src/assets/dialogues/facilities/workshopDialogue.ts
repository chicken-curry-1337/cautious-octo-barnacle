import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const workshopCaretakerDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_borin',
      name: 'Борин Кластер',
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
      visibleCharacterIds: ['caretaker_borin', 'player_fin'],
      activeCharacterIds: ['caretaker_borin'],
      text: 'А, глава! Смотри, я наконец-то довёл прессы до ума. Нужен заказ — говори, пока выплавка не застыла.',
      options: [
        { text: 'Как продвигается работа мастерской?', nextId: 'status' },
        { text: 'Нужны улучшения по экипировке.', nextId: 'upgrade' },
        { text: 'Позже загляну.', nextId: 'farewell' },
      ],
    },
    {
      id: 'status',
      visibleCharacterIds: ['caretaker_borin', 'player_fin'],
      activeCharacterIds: ['caretaker_borin'],
      text: 'Люди довольны, но станки старые. Если добудем аркана-прах и свежую сталь, сможем делать зачарованные клинки.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'upgrade',
      visibleCharacterIds: ['caretaker_borin', 'player_fin'],
      activeCharacterIds: ['caretaker_borin'],
      text: 'Поговори с финансистами — им придётся выделить золото. А я соберу учеников, если скажешь слово.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_borin', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Продолжай в том же духе, Борин.',
      options: [],
      isLast: true,
    },
  ],
};
