import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const dispatchDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_allen',
      name: 'Диспетчер Аллен',
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
      visibleCharacterIds: ['caretaker_allen', 'player_fin'],
      activeCharacterIds: ['caretaker_allen'],
      text: 'Команды готовы к распределению. Есть узкие места по логистике, но мы справимся, если заранее определим приоритеты.',
      options: [
        { text: 'Сколько отрядов можем держать в поле?', nextId: 'capacity' },
        { text: 'Насколько безопасны маршруты?', nextId: 'routes' },
        { text: 'Отлично. Продолжай.', nextId: 'farewell' },
      ],
    },
    {
      id: 'capacity',
      visibleCharacterIds: ['caretaker_allen', 'player_fin'],
      activeCharacterIds: ['caretaker_allen'],
      text: 'После модернизации диспетчерской сможем вести больше миссий параллельно. Но без расширения инфраструктуры рискуем зашить героев.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'routes',
      visibleCharacterIds: ['caretaker_allen', 'player_fin'],
      activeCharacterIds: ['caretaker_allen'],
      text: 'Разведка отмечает пару горячих точек. Если улучшить координацию, сможем сокращать время в пути и игнорировать мелкие угрозы.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_allen', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Продолжай держать отряды в строю.',
      options: [],
      isLast: true,
    },
  ],
};
