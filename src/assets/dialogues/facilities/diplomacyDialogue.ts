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
      text: '{{greeting:caretaker_karen}} {{tone:caretaker_karen|Совет, стража и Лига зовут нас, но для тебя я подготовила отдельный приём. Покажем им класс?|Карты связей обновлены. Совет и стража ждут ответа, а Лига намекает на особые условия.|Совет раздражён, стража подозрительна, Лига холодеет. Если замешкаешься, всё рухнет.}}',
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
      text: '{{tone:caretaker_karen|Стража уважает нас и мечтает о совместных патрулях. После обсудим детали тет-а-тет.|Стража хочет совместных патрулей. Успех укрепит репутацию.|Стража на грани. Провал — и первым обвинят тебя.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'merchants',
      visibleCharacterIds: ['caretaker_karen', 'player_fin'],
      activeCharacterIds: ['caretaker_karen'],
      text: '{{tone:caretaker_karen|Лига открывает лучшие контракты и обещает праздник, если ты появишься лично.|Лига готова поделиться контрактами, но требует уважения их интересов.|Лига уже ищет других партнёров. Готов довольствоваться крошками?}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_karen', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_karen|Подготовлю досье и оставлю для тебя личную пометку.|Подготовь досье для переговоров. Встретимся позже.|Соберу досье, но учти: в следующий раз сама поведу переговоры.}}',
      options: [],
      isLast: true,
    },
  ],
};
