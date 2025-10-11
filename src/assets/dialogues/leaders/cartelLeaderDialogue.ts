import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';
import { CARTEL_LEADER_ID, cartelLeaderCharacter } from '../../characters/factionLeaders';
import { PLAYER_ID, playerCharacter } from '../../characters/player';

export const cartelLeaderDialogue: DialogueData = {
  characters: [
    playerCharacter,
    cartelLeaderCharacter,
  ],
  nodes: [
    {
      id: 'start',
      visibleCharacterIds: [PLAYER_ID, CARTEL_LEADER_ID],
      activeCharacterIds: [CARTEL_LEADER_ID],
      text: 'Кассандра Ноктюрн появляется из тени, словно материализуясь из самого полумрака.',
      options: [],
      nextNodeId: '1',
    },
    {
      id: '1',
      visibleCharacterIds: [PLAYER_ID, CARTEL_LEADER_ID],
      activeCharacterIds: [CARTEL_LEADER_ID],
      text: '«Ваши люди не задают лишних вопросов и исполняют поручения. Это редкость. Мне это нравится.»',
      options: [],
      nextNodeId: '2',
    },
    {
      id: '2',
      visibleCharacterIds: [PLAYER_ID, CARTEL_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Мы держим слово. Именно поэтому картель и гильдия всё ещё на одной стороне.»',
      options: [],
      nextNodeId: '3',
    },
    {
      id: '3',
      visibleCharacterIds: [PLAYER_ID, CARTEL_LEADER_ID],
      activeCharacterIds: [CARTEL_LEADER_ID],
      text: '«Тогда принимайте мой канал. Там, где свету нельзя доверять, полезнее тьма. Не подведите.»',
      options: [],
      nextNodeId: '4',
    },
    {
      id: '4',
      visibleCharacterIds: [PLAYER_ID, CARTEL_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Будем держать баланс. До связи, матриарх.»',
      options: [],
      isLast: true,
    },
  ],
};
