import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const quartersDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_lena',
      name: 'Завхоз Лена',
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
      visibleCharacterIds: ['caretaker_lena', 'player_fin'],
      activeCharacterIds: ['caretaker_lena'],
      text: 'Глава, герои жалуются на нехватку личного пространства. Пора подумать о расширении и развлечениях.',
      options: [
        { text: 'Что с моралью и усталостью?', nextId: 'morale' },
        { text: 'Нужно наладить систему наставничества.', nextId: 'mentors' },
        { text: 'Разберёмся позднее.', nextId: 'farewell' },
      ],
    },
    {
      id: 'morale',
      visibleCharacterIds: ['caretaker_lena', 'player_fin'],
      activeCharacterIds: ['caretaker_lena'],
      text: 'Если обставить комнаты получше и добавить залы отдыха, герои будут восстанавливаться быстрее и проявят больше усердия.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'mentors',
      visibleCharacterIds: ['caretaker_lena', 'player_fin'],
      activeCharacterIds: ['caretaker_lena'],
      text: 'Наставники просят выделить аудитории. Тогда новобранцы смогут подтянуть навыки до вылазки.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_lena', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Хорошо. Позаботься о комфорте, остальное на мне.',
      options: [],
      isLast: true,
    },
  ],
};
