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
      visibleCharacterIds: ['bob'],
      activeCharacterIds: ['bob'],
      text: 'У меня для тебя есть задание!',
      options: [{ text: 'Далее', nextId: 'accept' }],
    },
    {
      id: 'accept',
      visibleCharacterIds: ['alice', 'bob'],
      activeCharacterIds: ['alice', 'bob'],
      text: 'Ты готов отправиться в путь?',
      options: [
        { text: 'Да', nextId: 'end' },
        { text: 'Нет', nextId: 'end' },
      ],
    },
    {
      id: 'end',
      visibleCharacterIds: ['carol', 'alice', 'bob'],
      activeCharacterIds: ['carol'],
      text: 'Отлично! Тогда в путь!',
      options: [],
    },
  ],
} as DialogueData;
