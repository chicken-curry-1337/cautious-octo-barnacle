import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const guildHallDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_ellia',
      name: 'Интендант Эллия',
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
      visibleCharacterIds: ['caretaker_ellia', 'player_fin'],
      activeCharacterIds: ['caretaker_ellia'],
      text: '{{greeting:caretaker_ellia}} {{tone:caretaker_ellia|Может, обсудим приоритеты в укромном совещательном? Я подготовила парочку приятных сюрпризов.|Повестка отсортирована. Какие приоритеты ставим первыми?|Дела горят, а ты всё пропадаешь. Поторопись с приоритетами.}}',
      options: [
        { text: 'Как держится гильдия в целом?', nextId: 'status' },
        { text: 'Нужно расставить акценты на развитие.', nextId: 'planning' },
        { text: 'Пока всё ясно, продолжай.', nextId: 'farewell' },
      ],
    },
    {
      id: 'status',
      visibleCharacterIds: ['caretaker_ellia', 'player_fin'],
      activeCharacterIds: ['caretaker_ellia'],
      text: '{{tone:caretaker_ellia|Если хочешь отчётов, я прошепчу их прямо на ухо — бюджет блестит, герои в восторге.|Бюджет держится, герои не жалуются. Хочешь детали?|Бюджет трещит, герои ворчат. И всё из-за твоей расхлябанности.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'planning',
      visibleCharacterIds: ['caretaker_ellia', 'player_fin'],
      activeCharacterIds: ['caretaker_ellia'],
      text: '{{tone:caretaker_ellia|Предлагаю укрепить главные залы, а потом отпраздновать это вдвоём.|Рационально укрепить основные залы, прежде чем браться за экзотику.|Без укрепления залов можешь сам отгонять жалобщиков. Понял?}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_ellia', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_ellia|Не исчезай надолго, мне нравится, как ты командуешь.|Хорошо, держи меня в курсе.|Попробуй только снова устроить бардак — я тебя найду.}}',
      options: [],
      isLast: true,
    },
  ],
};
