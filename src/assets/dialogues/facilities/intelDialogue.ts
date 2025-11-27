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
      text: '{{greeting:caretaker_kaia}} {{tone:caretaker_kaia|Шёпоты шепчут, что твой приход — лучшее, что случилось с сетью. Раскроем секреты вместе?|Доступно несколько разведданных. Что раскрываем в первую очередь?|Сеть шепотов воет от рисков. Если снова пропадёшь, я отзову информаторов.}}',
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
      text: '{{tone:caretaker_kaia|У северного тракта тихо — можем играть на опережение и заодно обсудить это тет-а-тет.|Есть отчёты о бандитах у тракта и странных существах в лесу. Отправим разведчиков — снизим риск провалов.|Патрули исчезают один за другим. Если не среагируем, потеряем контроль и уважение сети.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'network',
      visibleCharacterIds: ['caretaker_kaia', 'player_fin'],
      activeCharacterIds: ['caretaker_kaia'],
      text: '{{tone:caretaker_kaia|Инвестируешь в шёпот-сеть — и я прошепчу пару секретов только тебе.|Если инвестируем в шёпот-сеть, получим досрочные предупреждения и сможем готовить отряды точнее.|Без вложений шёпот-сеть ослепнет. Готов отвечать за эту темноту?}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_kaia', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_kaia|Буду ждать твоих вестей, особенно шёпотом у самой двери.|Продолжай снабжать нас свежими сведениями.|Постарайся удержать сеть в живых, иначе не возвращайся.}}',
      options: [],
      isLast: true,
    },
  ],
};
