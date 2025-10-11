import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';
import { GUARD_LEADER_ID, guardLeaderCharacter } from '../../characters/factionLeaders';
import { PLAYER_ID, playerCharacter } from '../../characters/player';

export const guardLeaderDialogue: DialogueData = {
  characters: [
    playerCharacter,
    guardLeaderCharacter,
  ],
  nodes: [
    {
      id: 'start',
      visibleCharacterIds: [PLAYER_ID, GUARD_LEADER_ID],
      activeCharacterIds: [GUARD_LEADER_ID],
      text: 'Капитан Арина опирается о стол с картами и кивает, замечая вас.',
      options: [],
      nextNodeId: '1',
    },
    {
      id: '1',
      visibleCharacterIds: [PLAYER_ID, GUARD_LEADER_ID],
      activeCharacterIds: [GUARD_LEADER_ID],
      text: '«Отчёты чистые, посты на западном крыле закреплены. Ваши люди работают чётко.»',
      options: [],
      nextNodeId: '2',
    },
    {
      id: '2',
      visibleCharacterIds: [PLAYER_ID, GUARD_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Мы следуем протоколам, которые вы утвердили. Если есть дополнительные поручения — готовы слушать.»',
      options: [],
      nextNodeId: '3',
    },
    {
      id: '3',
      visibleCharacterIds: [PLAYER_ID, GUARD_LEADER_ID],
      activeCharacterIds: [GUARD_LEADER_ID],
      text: '«Есть. Держите прямой канал связи. Любые угрозы или подозрения — сразу на мой стол. Охрана города теперь наша общая задача.»',
      options: [],
      nextNodeId: '4',
    },
    {
      id: '4',
      visibleCharacterIds: [PLAYER_ID, GUARD_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Принято. Город может рассчитывать на нас, капитан.»',
      options: [],
      isLast: true,
    },
  ],
};
