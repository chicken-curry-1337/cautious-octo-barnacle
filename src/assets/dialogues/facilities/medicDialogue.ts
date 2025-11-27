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
      text: '{{greeting:caretaker_thera}} {{tone:caretaker_thera|Запасы настоек полны, так что могу уделить пару лишних минут лично тебе.|Склад трав держится, но пополнение не помешает.|Без новых трав лазарет превратится в морг. Ты вообще слышишь?}}',
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
      text: '{{tone:caretaker_thera|Трое уже на поправке, особенно после моего ночного визита. Поможешь продолжить?|Пара бойцов ещё под наблюдением, расширение лазарета ускорит восстановление.|Раненые лежат без ухода. Если сорвёмся, вина будет на тебе.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'needs',
      visibleCharacterIds: ['caretaker_thera', 'player_fin'],
      activeCharacterIds: ['caretaker_thera'],
      text: '{{tone:caretaker_thera|Профинансируй хирургию, и я покажу тебе пару чудес исцеления лично.|С хирургами всё по плану, но без эликсиров риски выше.|Не вложишься в хирургию — готовься лично копать могилы.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_thera', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_thera|Хорошо, загляну ещё. Держи для меня свободную койку.|Понял, я займусь поставками.|Разберусь. Только не рычи на весь лазарет.}}',
      options: [],
      isLast: true,
    },
  ],
};
