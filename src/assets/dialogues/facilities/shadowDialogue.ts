import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';

export const shadowNetworkDialogue: DialogueData = {
  characters: [
    {
      id: 'caretaker_shade',
      name: 'Контакт Шейд',
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
      visibleCharacterIds: ['caretaker_shade', 'player_fin'],
      activeCharacterIds: ['caretaker_shade'],
      text: '{{greeting:caretaker_shade}} {{tone:caretaker_shade|Тени мурлычут и шепчут, что ты их любимец. Хочешь, покажу самый тайный ход?|Тени шепчут, глава. Есть просьбы от картеля и пара подозрительных следов стражи. Куда направим внимание?|Тени скребутся. Картель злится, стража тянет щупальца. Провалишься — исчезни.}}',
      options: [
        { text: 'Расскажи про поклонников картеля.', nextId: 'cartel' },
        { text: 'Насколько велик риск огласки?', nextId: 'heat' },
        { text: 'Действуй по плану, я свяжусь позже.', nextId: 'farewell' },
      ],
    },
    {
      id: 'cartel',
      visibleCharacterIds: ['caretaker_shade', 'player_fin'],
      activeCharacterIds: ['caretaker_shade'],
      text: '{{tone:caretaker_shade|Подземный ход наш. Проведём сделки тихо, и после я покажу тебе ещё один секрет.|Подземный ход позволит проводить сделки незаметно, но придётся держать слово перед картелем.|Подземный ход под угрозой. Промедлим — картель выберет другого и с нас шкуру снимет.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'heat',
      visibleCharacterIds: ['caretaker_shade', 'player_fin'],
      activeCharacterIds: ['caretaker_shade'],
      text: '{{tone:caretaker_shade|Чистильщики работают безупречно, если намекнуть, что заказ от тебя.|Чистильщики готовы замести следы, но это не бесплатно. Лучше не проваливать нелегальные контракты.|Чистильщики устали. Каждый провал превращается в пожар, и я не собираюсь их тушить задаром.}}',
      options: [{ text: 'Вернуться', nextId: 'start' }],
    },
    {
      id: 'farewell',
      visibleCharacterIds: ['caretaker_shade', 'player_fin'],
      activeCharacterIds: ['player_fin'],
      text: '{{tone:caretaker_shade|Держи проход открытым, Шейд. Люблю твои сюрпризы.|Сохраняй осторожность, Шейд.|Если всё сорвётся, я предупреждал.}}',
      options: [],
      isLast: true,
    },
  ],
};
