import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';
import { CITIZENS_LEADER_ID, citizensLeaderCharacter } from '../../characters/factionLeaders';
import { PLAYER_ID, playerCharacter } from '../../characters/player';

export const citizensLeaderDialogue: DialogueData = {
  characters: [
    playerCharacter,
    citizensLeaderCharacter,
  ],
  nodes: [
    {
      id: 'start',
      visibleCharacterIds: [PLAYER_ID, CITIZENS_LEADER_ID],
      activeCharacterIds: [CITIZENS_LEADER_ID],
      text: 'Мирелла встречает вас в зале общины — тёплые огни, запах выпечки и внимательные взгляды.',
      options: [],
      nextNodeId: '1',
    },
    {
      id: '1',
      visibleCharacterIds: [PLAYER_ID, CITIZENS_LEADER_ID],
      activeCharacterIds: [CITIZENS_LEADER_ID],
      text: '«Жители говорят о вас с уважением. Вы помогли не ради славы, а потому что было нужно.»',
      options: [],
      nextNodeId: '2',
    },
    {
      id: '2',
      visibleCharacterIds: [PLAYER_ID, CITIZENS_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Город держится на тех, кто не закрывает глаза на чужие беды. Мы просто делали свою работу.»',
      options: [],
      nextNodeId: '3',
    },
    {
      id: '3',
      visibleCharacterIds: [PLAYER_ID, CITIZENS_LEADER_ID],
      activeCharacterIds: [CITIZENS_LEADER_ID],
      text: '«Тогда держите ключ от совета жителей. Если понадобится помощь — мы рядом. И да, пироги тоже ваши.»',
      options: [],
      nextNodeId: '4',
    },
    {
      id: '4',
      visibleCharacterIds: [PLAYER_ID, CITIZENS_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Передам героям, что у нас теперь есть прямая связь. Спасибо, Мирелла.»',
      options: [],
      isLast: true,
    },
  ],
};
