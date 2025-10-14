import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const barracksDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_galvin',
      name: 'Тренер Гальвин',
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
      visibleCharacterIds: ['caretaker_galvin', 'player_fin'],
      activeCharacterIds: ['caretaker_galvin'],
      text: 'Глава, рекруты идут плотным строем. Нужно решить, кого готовим в элиту, а кого отправляем на базовую службу.',
      options: [
        { text: 'Какие кадры сейчас востребованы?', nextId: 'needs' },
        { text: 'Есть ли таланты, которым нужна особая программа?', nextId: 'elite' },
        { text: 'Хорошо. Продолжай отбор.', nextId: 'farewell' },
      ],
    },
    {
      id: 'needs',
      visibleCharacterIds: ['caretaker_galvin', 'player_fin'],
      activeCharacterIds: ['caretaker_galvin'],
      text: 'Гильдии не хватает специалистов ближнего боя. Потребуются дополнительные инструкторы и тренажёры.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'elite',
      visibleCharacterIds: ['caretaker_galvin', 'player_fin'],
      activeCharacterIds: ['caretaker_galvin'],
      text: 'Есть несколько перспективных кандидатов. Если расширим площадки и жильё, сможем удержать их у нас.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_galvin', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Отбор за тобой, Гальвин. Мне нужны лучшие из лучших.',
      options: [],
      isLast: true,
    },
  ],
};
