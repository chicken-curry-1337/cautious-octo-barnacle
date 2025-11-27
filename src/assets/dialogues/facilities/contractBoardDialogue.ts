import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const contractBoardDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_mila',
      name: 'Куратор Мила',
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
      visibleCharacterIds: ['caretaker_mila', 'player_fin'],
      activeCharacterIds: ['caretaker_mila'],
      text: '{{greeting:caretaker_mila}} {{tone:caretaker_mila|У меня есть контракты горячее твоего взгляда. Оставить один только для нас?|Новые объявления рассортированы по важности. Что смотрим?|Контракты пылятся, а ты всё гуляешь. Берёшь что-нибудь или катись?}}',
      options: [
        { text: 'Покажи, что принесло больше всего шума.', nextId: 'hot' },
        { text: 'Нас интересует стабильный заработок.', nextId: 'stable' },
        { text: 'Пока всё. Держи доску в порядке.', nextId: 'farewell' },
      ],
    },
    {
      id: 'hot',
      visibleCharacterIds: ['caretaker_mila', 'player_fin'],
      activeCharacterIds: ['caretaker_mila'],
      text: '{{tone:caretaker_mila|Есть заказы, где нам заплатят и за работу, и за твою улыбку. Забираем?|Есть цепочка для стражи и заказ Лиги. Решаем?|Либо угодишь стражам, либо прогнешь картель. Так что не тупи.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'stable',
      visibleCharacterIds: ['caretaker_mila', 'player_fin'],
      activeCharacterIds: ['caretaker_mila'],
      text: '{{tone:caretaker_mila|Горожане тают, когда слышат, что ты придёшь лично. Поможем?|Горожане просят помощи с бытовыми делами. Награда скромная, зато репутация растёт.|Они уже кипят от злости. Что им ответить и быстро?}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_mila', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_mila|Забегай чаще — мне нравится, когда мы вдвоём разбираем заявки.|Принято. Сообщи, если появится что-то необычное.|Если снова оставишь доску пустой, я лично тебя разыщу.}}',
      options: [],
      isLast: true,
    },
  ],
};
