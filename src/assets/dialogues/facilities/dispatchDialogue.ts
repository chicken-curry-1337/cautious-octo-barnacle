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
      text: '{{greeting:caretaker_allen}} {{tone:caretaker_allen|Отряды ждут твоего сигнала, а я готов шепнуть лучший маршрут прямо на ухо.|Команды готовы. Разберём логистику?|Отряды едва держатся. Или ты берёшься за план, или катись.}}',
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
      text: '{{tone:caretaker_allen|Ради тебя возьмём ещё пару миссий параллельно — справимся.|Сможем вести больше миссий, если расширим инфраструктуру.|Без модернизации диспетчерская рухнет, и винить будут тебя.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'routes',
      visibleCharacterIds: ['caretaker_allen', 'player_fin'],
      activeCharacterIds: ['caretaker_allen'],
      text: '{{tone:caretaker_allen|Я расчистил маршруты, чтобы ты мог блеснуть. Время в пути сокращаем.|Есть пара горячих точек, нужно улучшить координацию.|Маршруты горят красным. Если не вмешаешься, потери на твоей совести.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_allen', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_allen|Обожаю смотреть, как ты ведёшь отряды. Не пропадай.|Ладно, держи отряды в строю.|Хотя бы раз верни кого-то живым, иначе сам пойдёшь в поле.}}',
      options: [],
      isLast: true,
    },
  ],
};
