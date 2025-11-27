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
      text: '{{greeting:caretaker_borin}} {{tone:caretaker_borin|Прессы и я ждём твоего сигнала. Расплавим полгорода ради твоей улыбки.|Прессы уже разогреты, успеем подправить пару деталей.|Прессы гудят вхолостую. Сформулируй цель, пока я не вышвырнул тебя.}}',
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
      text: '{{tone:caretaker_borin|Команда мурлычет, стоит привезти аркана-прах — и устроим шоу для тебя.|Станки держатся, но без обновления долго не протянут.|Станки рассыпаются. Придёшь без ресурсов — молот полетит в твою сторону.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'upgrade',
      visibleCharacterIds: ['caretaker_borin', 'player_fin'],
      activeCharacterIds: ['caretaker_borin'],
      text: '{{tone:caretaker_borin|Добудь финансирование, и я лично покажу, как рождаются легенды.|Скажи только слово, соберу учеников и подправим экипировку.|Без нормального бюджета я даже молот не возьму. Разрешишь это или проваливай.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_borin', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_borin|Держи горн горячим, Борин. Захочу — вернусь погреться.|Продолжай в том же духе.|Не перегревай прессы, пока я не решу, что с ними делать.}}',
      options: [],
      isLast: true,
    },
  ],
};
