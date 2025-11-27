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
      text: '{{greeting:caretaker_lena}} {{tone:caretaker_lena|Герои поют, а я берегу лучший номер для тебя. Поговорим об элите?|Герои жалуются на тесноту. Нужно решать расширение и развлечения.|Герои спят в проходах. Или ты исправляешь это, или я взорвусь.}}',
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
      text: '{{tone:caretaker_lena|С твоей помощью апгрейды превратят ночёвку в праздник, и герои устроят тебе овацию.|Если улучшить комнаты и добавить зоны отдыха, восстановление ускорится.|Без обновления комнат они свалятся и будут проклинать твоё имя.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'mentors',
      visibleCharacterIds: ['caretaker_lena', 'player_fin'],
      activeCharacterIds: ['caretaker_lena'],
      text: '{{tone:caretaker_lena|Наставники мечтают вести занятия при тебе. Дай добро — устроим им праздник.|Наставники просят выделить аудитории. Тогда новички подтянут навыки.|Наставники собираются уйти. Не выделишь аудитории — сам их заменяй.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_lena', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_lena|Забегай ко мне чаще, я проведу тебя по лучшим комнатам.|Хорошо. Позаботься о комфорте, остальное я закрою.|Исправь это немедленно, иначе сама поселюсь у тебя в кабинете.}}',
      options: [],
      isLast: true,
    },
  ],
};
