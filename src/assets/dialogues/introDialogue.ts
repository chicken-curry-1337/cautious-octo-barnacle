import type { DialogueData } from '../../entities/Dialogue/Dialogue.store';

export default {
  characters: [
    {
      id: 'alice',
      name: 'Алиса',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
    },
    { id: 'bob', name: 'Боб', avatarUrl: 'https://i.pravatar.cc/150?img=8' },
    {
      id: 'carol',
      name: 'Кэрол',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
    },
  ],
  nodes: [
    {
      id: 'start',
      activeCharacterIds: ['alice'],
      text: 'Привет! Ты готов к приключениям?',
      options: [
        { text: 'Конечно!', nextId: 'bob_asks' },
        { text: 'Не очень...', nextId: 'end_fail' },
      ],
    },
    {
      id: 'bob_asks',
      activeCharacterIds: ['bob'],
      text: 'Отлично, Алиса. Ты уже собрала всё необходимое?',
      options: [
        { text: 'Да, всё с собой.', nextId: 'carol_join' },
        { text: 'Почти.', nextId: 'prepare_more' },
      ],
    },
    {
      id: 'prepare_more',
      activeCharacterIds: ['alice'],
      text: 'Мне нужно ещё немного времени, чтобы подготовиться.',
      options: [{ text: 'Понятно, не спеши.', nextId: 'bob_encourages' }],
    },
    {
      id: 'bob_encourages',
      activeCharacterIds: ['bob'],
      text: 'Не волнуйся, я уверен, что всё получится!',
      options: [{ text: 'Спасибо, Боб.', nextId: 'carol_join' }],
    },
    {
      id: 'carol_join',
      activeCharacterIds: ['carol'],
      text: 'Я слышала о вашем плане и хочу присоединиться!',
      options: [
        { text: 'Рады тебя видеть, Кэрол!', nextId: 'team_ready' },
        { text: 'Может, лучше подождать?', nextId: 'end_fail' },
      ],
    },
    {
      id: 'team_ready',
      activeCharacterIds: ['alice', 'bob', 'carol'],
      text: 'Отлично, команда в сборе! В путь!',
      options: [],
    },
    {
      id: 'end_fail',
      activeCharacterIds: [],
      text: 'Похоже, сегодня не наш день. Попробуем позже.',
      options: [],
    },
  ],
} as DialogueData;
