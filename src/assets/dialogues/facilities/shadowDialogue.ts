import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const shadowNetworkDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_shade',
      name: 'Контакт Шейд',
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
      visibleCharacterIds: ['caretaker_shade', 'player_fin'],
      activeCharacterIds: ['caretaker_shade'],
      text: 'Тени шепчут, глава. Есть просьбы от картеля и пару подозрительных следов стражи. Куда направим внимание?',
      options: [
        { text: 'Расскажи про поклонников картеля.', nextId: 'cartel' },
        { text: 'Насколько велик риск огласки?', nextId: 'heat' },
        { text: 'Действуй по плану, я свяжусь позже.', nextId: 'farewell' },
      ],
    },
    {
      id: 'cartel',
      visibleCharacterIds: ['caretaker_shade', 'player_fin'],
      activeCharacterIds: ['caretaker_shade'],
      text: 'Подземный ход позволит проводить сделки незаметно, но придётся держать слово перед картелем. Иначе они выберут другого партнёра.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'heat',
      visibleCharacterIds: ['caretaker_shade', 'player_fin'],
      activeCharacterIds: ['caretaker_shade'],
      text: 'Чистильщики готовы замести следы, но это не бесплатно. Лучше не проваливать нелегальные контракты.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_shade', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Сохраняй осторожность, Шейд.',
      options: [],
      isLast: true,
    },
  ],
};
