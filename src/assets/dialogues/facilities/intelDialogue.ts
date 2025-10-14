import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const intelCenterDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_kaia',
      name: 'Разведчица Кайя',
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
      visibleCharacterIds: ['caretaker_kaia', 'player_fin'],
      activeCharacterIds: ['caretaker_kaia'],
      text: 'Глава, доступно несколько разведданных. Можем раскрыть скрытые параметры контрактов или предупредить отряды о засадах.',
      options: [
        { text: 'Какие зоны требуют внимания?', nextId: 'zones' },
        { text: 'Можно ли укрепить сеть информаторов?', nextId: 'network' },
        { text: 'Понял, держи связь.', nextId: 'farewell' },
      ],
    },
    {
      id: 'zones',
      visibleCharacterIds: ['caretaker_kaia', 'player_fin'],
      activeCharacterIds: ['caretaker_kaia'],
      text: 'Есть отчёты о бандитах у северного тракта и странных существах в лесу. Отправим разведчиков — снизим риск провалов.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'network',
      visibleCharacterIds: ['caretaker_kaia', 'player_fin'],
      activeCharacterIds: ['caretaker_kaia'],
      text: 'Если инвестируем в шёпот-сеть, получим досрочные предупреждения и сможем готовить отряды точнее.',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_kaia', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: 'Продолжай снабжать нас свежими сведениями.',
      options: [],
      isLast: true,
    },
  ],
};
