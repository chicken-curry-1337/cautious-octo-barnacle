import type { DialogueData } from '../../entities/Dialogue/Dialogue.store';
import { curator1, curator2, curator3, CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3 } from '../characters/curators';
import { playerCharacter, PLAYER_ID } from '../characters/player';

export const introDialogue: DialogueData = {
  characters: [
    curator1, curator2, curator3,
    playerCharacter,
  ],
  nodes: [
    {
      id: 'start',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3],
      activeCharacterIds: [CURATOR_ID_1],
      text: 'Фин Рейнольдс. Проходи.',
      options: [],
    },
    {
      id: '1',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [],
      text: 'Фин подходит ближе, встает напротив них. В помещении тихо, гулкий звук шагов только усиливает напряжение.',
      options: [],
    },
    {
      id: '2',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: 'Я здесь.',
      options: [],
    },
    {
      id: '3',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [CURATOR_ID_3],
      text: 'Назначение подтверждено. Твоя новая должность — глава гильдии Равенфорда. Подтверди согласие.',
      options: [
        { text: 'Подтверждаю', nextId: 'answer_confirmation' },
        {
          text: 'Ну, с радостью бы отказался, но подозреваю, меня бы назначили всё равно.',
          nextId: 'answer_sarcastic',
        },
      ],
    },
    {
      id: 'answer_sarcastic',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [CURATOR_ID_2],
      text: 'Не трать наше время. Подтверди назначение',
      options: [
        { text: 'Подтверждаю', nextId: 'answer_confirmation' },
      ],
    },
    {
      id: 'answer_confirmation',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [CURATOR_ID_1],
      text: 'Гильдия Равенфорда — руины. Ни людей, ни ресурсов, ни статуса. Только здание, и то разваливающееся.',
      options: [],
    },
    {
      id: '4',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: 'Идеально. Дом, милый дом.',
      options: [],
    },
    {
      id: '5',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [CURATOR_ID_3],
      text: 'Мы не шутим, Фин. Это твой последний шанс. Провалишь — и не будет новых возможностей. Даже низкоранговых.',
      options: [],
    },
    {
      id: '6',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: 'А я-то думал, вы позвали меня, потому что скучали.',
      options: [],
    },
    {
      id: '7',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [CURATOR_ID_1],
      text: 'Мы закончили. Можешь идти.',
      options: [],
    },
    {
      id: '8',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: 'Не беспокойтесь. Я и не планировал задерживаться.',
      options: [],
    },
    {
      id: '9',
      visibleCharacterIds: [CURATOR_ID_1, CURATOR_ID_2, CURATOR_ID_3, PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: 'Резко развернувшись, ты уходишь, всем своим видом показывая свое отношение к этому фарсу',
      options: [],
    },
  ],
};
