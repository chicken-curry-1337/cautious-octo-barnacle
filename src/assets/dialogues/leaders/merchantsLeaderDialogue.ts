import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';
import { MERCHANTS_LEADER_ID, merchantsLeaderCharacter } from '../../characters/factionLeaders';
import { PLAYER_ID, playerCharacter } from '../../characters/player';

export const merchantsLeaderDialogue: DialogueData = {
  characters: [
    playerCharacter,
    merchantsLeaderCharacter,
  ],
  nodes: [
    {
      id: 'start',
      visibleCharacterIds: [PLAYER_ID, MERCHANTS_LEADER_ID],
      activeCharacterIds: [MERCHANTS_LEADER_ID],
      text: 'Верена встречает вас в роскошном кабинете, где каждая деталь говорит о вкусе и контроле.',
      options: [],
      nextNodeId: '1',
    },
    {
      id: '1',
      visibleCharacterIds: [PLAYER_ID, MERCHANTS_LEADER_ID],
      activeCharacterIds: [MERCHANTS_LEADER_ID],
      text: '«Слухи о вашей гильдии разошлись лучше любых рекламных листовок. Вы сделали ставку на репутацию — и не проиграли.»',
      options: [],
      nextNodeId: '2',
    },
    {
      id: '2',
      visibleCharacterIds: [PLAYER_ID, MERCHANTS_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Мы ценим партнёров, которые держат слово. Лига помогла нам закрепиться, теперь можем отвечать взаимностью.»',
      options: [],
      nextNodeId: '3',
    },
    {
      id: '3',
      visibleCharacterIds: [PLAYER_ID, MERCHANTS_LEADER_ID],
      activeCharacterIds: [MERCHANTS_LEADER_ID],
      text: '«Именно поэтому я открываю для вас закрытые торговые торги. Формула простая: вы делитесь информацией, я — возможностями.»',
      options: [],
      nextNodeId: '4',
    },
    {
      id: '4',
      visibleCharacterIds: [PLAYER_ID, MERCHANTS_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Сделка честная. С этого момента держим связь напрямую, Комесса.»',
      options: [],
      isLast: true,
    },
  ],
};
