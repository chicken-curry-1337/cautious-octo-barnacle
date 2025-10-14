import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const infirmaryCaretakerDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_thera',
      name: 'Тера Эвия',
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
      visibleCharacterIds: ['caretaker_thera', 'player_fin'],
      activeCharacterIds: ['caretaker_thera'],
      text: 'Глава, не забывай, что герои — не железо. Мне нужна свежая партия трав и нормальное снабжение, если хочешь меньше травм.',
      options: [
        { text: 'Как пациенты?', nextId: 'status' },
        { text: 'Что нужно для улучшений?', nextId: 'needs' },
        { text: 'Спасибо, Тера.', nextId: 'farewell' },
      ],
    },
    {
      id: 'status',
      visibleCharacterIds: ['caretaker_thera', 'player_fin'],
      activeCharacterIds: ['caretaker_thera'],
      text: 'После последнего рейда три бойца ещё под наблюдением. Расширение лазарета поможет быстрее ставить их на ноги.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'needs',
      visibleCharacterIds: ['caretaker_thera', 'player_fin'],
      activeCharacterIds: ['caretaker_thera'],
      text: 'Если профинансируешь хирургию и запасёшься целебными эликсирами, я смогу держать травмы под контролем.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_thera', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Я распоряжусь поставками.',
      options: [],
      isLast: true,
    },
  ],
};
