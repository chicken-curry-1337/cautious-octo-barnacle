// [Фин стоит у старой доски объявлений, изучая старые, неструктурированные задания.]

import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';
import { LILITH_ID, lilithCharacter } from '../../characters/lilith';
import { MIRANDA_ID, mirandaCharacter } from '../../characters/miranda';
import { PLAYER_ID, playerCharacter } from '../../characters/player';

export const callBoardIntro: DialogueData = {
  characters: [
    playerCharacter,
    lilithCharacter,
    mirandaCharacter,
  ],
  nodes: [
    {
      id: 'start',
      visibleCharacterIds: [PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(про себя, недовольно) Все эти задания — сплошной хаос. Нет сроков, нет четкой оплаты, сложности не указаны... Как тут кто-то разберется? Надо срочно привести всё в порядок.',
      options: [],
    },
    {
      id: '1',
      visibleCharacterIds: [PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [],
      text: '[Входит молодая героиня — яркая, импульсивная, в лёгкой броне. Она подходит к доске и замечает Фина.]',
      options: [],
    },
    {
      id: '2',
      visibleCharacterIds: [PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [MIRANDA_ID],
      text: '(живо, чуть с усмешкой): Эй, новичок! Ты точно не должен браться за это задание — слишком сложное для тебя.',
      options: [],
    },
    {
      id: '3',
      visibleCharacterIds: [PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(с удивлением): Новичок? Я... Что?..',
      options: [],
    },
    {
      id: '4',
      visibleCharacterIds: [PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [MIRANDA_ID],
      text: '(с улыбкой, уверенно): Да. Ты ведь, наверное, только приехал? Тут обычно так — сначала берёшь простые задания, потом — сложнее.',
      options: [],
    },
    {
      id: '5',
      visibleCharacterIds: [PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(сдержанно): Понял. Но я не совсем герой.',
      options: [],
    },
    {
      id: '6',
      visibleCharacterIds: [PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [MIRANDA_ID],
      text: '(не замечая, продолжает): Не бери на себя слишком много сразу. Тут у нас много сложных случаев, и не каждому по плечу.',
      options: [],
    },
    {
      id: '7',
      visibleCharacterIds: [PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [MIRANDA_ID],
      text: 'Просто советую — не распыляйся сразу.',
      options: [],
    },
    {
      id: '8',
      visibleCharacterIds: [PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(с лёгкой улыбкой): Спасибо за совет',
      options: [],
    },
    {
      id: '9',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [],
      text: '[В этот момент тихо появляется Лилит, стоит чуть позади Фина, кладёт перед ним свиток и папку с бумагами.]',
      options: [],
    },
    {
      id: '10',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [LILITH_ID],
      text: '(сдержанно, обращаясь только к Фину) Молодой господин, вот документы, оставленные предыдущим управляющим гильдии. Там есть отчёты по текущим делам и список активных заказов.',
      options: [],
    },
    {
      id: '11',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(берёт бумаги, быстро пролистывает): Наконец-то хоть какая-то систематизация.',
      options: [],
    },
    {
      id: '12',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [LILITH_ID],
      text: '(легко поднимает взгляд на Фина, чуть насмешливо): Кстати, молодой господин, мантию главы вы сегодня забыли.',
      options: [],
    },
    {
      id: '13',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(вздыхая, слегка улыбаясь): Чёрт, действительно забыл.',
      options: [],
    },
    {
      id: '14',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [LILITH_ID],
      text: '(тихо, с лёгким оттенком строгости, обращаясь к Фину): Молодой господин, мантию забывать — не лучший способ начинать день. Лучше быть заметным хотя бы внешне.',
      options: [],
    },
    {
      id: '15',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [MIRANDA_ID],
      text: '[Героиня резко вскрикивает, подпрыгивая:] Ээээ?! Вы глава?! Ну надо же! Как я могла не заметить?!',
      options: [],
    },
    {
      id: '16',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [MIRANDA_ID],
      text: '[Краснеет, суетливо жестикулирует:] Ой, простите, я правда не знала! Думала, вы просто новичок...',
      options: [],
    },
    {
      id: '17',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID, MIRANDA_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(улыбаясь с лёгкой иронией): Не переживай. Такое бывает. Не распыляйся сразу.',
      options: [],
    },
  ],
};
