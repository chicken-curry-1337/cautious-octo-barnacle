import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const barracksDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_galvin',
      name: 'Тренер Гальвин',
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
      visibleCharacterIds: ['caretaker_galvin', 'player_fin'],
      activeCharacterIds: ['caretaker_galvin'],
      text: '{{greeting:caretaker_galvin}} {{tone:caretaker_galvin|Рекруты сияют, и я готов устроить им шоу ради твоего одобрения. Кого тянем в элиту?|Рекруты идут плотным строем. Нужно решить, кого готовим в элиту, а кого отправляем на базовую службу.|Рекруты деморализованы. Если снова потянешь резину, останемся без людей.}}',
      options: [
        { text: 'Какие кадры сейчас востребованы?', nextId: 'needs' },
        { text: 'Есть ли таланты, которым нужна особая программа?', nextId: 'elite' },
        { text: 'Хорошо. Продолжай отбор.', nextId: 'farewell' },
      ],
    },
    {
      id: 'needs',
      visibleCharacterIds: ['caretaker_galvin', 'player_fin'],
      activeCharacterIds: ['caretaker_galvin'],
      text: '{{tone:caretaker_galvin|С твоим визитом соберём ударный взвод и устроим им впечатляющую разминку.|Гильдии не хватает специалистов ближнего боя. Потребуются дополнительные инструкторы и тренажёры.|Воины разбегаются, потому что ты всё тянешь. Без инструкторов останутся дети.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'elite',
      visibleCharacterIds: ['caretaker_galvin', 'player_fin'],
      activeCharacterIds: ['caretaker_galvin'],
      text: '{{tone:caretaker_galvin|Площадки блестят, таланты называют гильдию домом и украдкой ловят твой взгляд.|Есть несколько перспективных кандидатов. Если расширим площадки и жильё, сможем удержать их у нас.|Таланты уходят. Не дашь жильё и площадки — будешь тренировать пустоту.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_galvin', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_galvin|Отбор за тобой, Гальвин. Покажи им, как впечатлить меня.|Отбор за тобой, Гальвин. Мне нужны лучшие.|Справься, иначе придётся искать нового тренера.}}',
      options: [],
      isLast: true,
    },
  ],
};
