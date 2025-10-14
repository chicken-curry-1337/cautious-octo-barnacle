import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const diplomacyDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_karen',
      name: 'Связист Карэн',
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
      visibleCharacterIds: ['caretaker_karen', 'player_fin'],
      activeCharacterIds: ['caretaker_karen'],
      text: 'Карты связей обновлены. Городской совет и стража ждут ответа, а торговая лига намекает на особые условия.',
      options: [
        { text: 'Что насчёт стражи?', nextId: 'guard' },
        { text: 'У торговцев есть прибыльные предложения?', nextId: 'merchants' },
        { text: 'Спасибо, я оценю положение позже.', nextId: 'farewell' },
      ],
    },
    {
      id: 'guard',
      visibleCharacterIds: ['caretaker_karen', 'player_fin'],
      activeCharacterIds: ['caretaker_karen'],
      text: 'Стража хочет совместных патрулей. Успех укрепит репутацию и снимет давление на heat, провал — наоборот.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'merchants',
      visibleCharacterIds: ['caretaker_karen', 'player_fin'],
      activeCharacterIds: ['caretaker_karen'],
      text: 'Лига готова поделиться контрактами, но требует уважения их интересов. Стоит расширить присутствие в ратуше.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_karen', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Подготовь досье для переговоров. Встретимся позже.',
      options: [],
      isLast: true,
    },
  ],
};
