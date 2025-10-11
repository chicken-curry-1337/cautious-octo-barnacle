import type { DialogueData } from '../../../entities/Dialogue/Dialogue.store';
import { GUILD_LEADER_ID, guildLeaderCharacter } from '../../characters/factionLeaders';
import { PLAYER_ID, playerCharacter } from '../../characters/player';

export const guildLeaderDialogue: DialogueData = {
  characters: [
    playerCharacter,
    guildLeaderCharacter,
  ],
  nodes: [
    {
      id: 'start',
      visibleCharacterIds: [PLAYER_ID, GUILD_LEADER_ID],
      activeCharacterIds: [GUILD_LEADER_ID],
      text: 'Лисандра задерживает ваш взгляд, тщательно изучая — ни тени эмоциональности, только профессиональная оценка.',
      options: [],
      nextNodeId: '1',
    },
    {
      id: '1',
      visibleCharacterIds: [PLAYER_ID, GUILD_LEADER_ID],
      activeCharacterIds: [GUILD_LEADER_ID],
      text: '«Гильдия оправдала доверие Совета. Дисциплина, отчётность, результаты. Меня это устраивает.»',
      options: [],
      nextNodeId: '2',
    },
    {
      id: '2',
      visibleCharacterIds: [PLAYER_ID, GUILD_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Мы работаем на том пределе, который можем себе позволить. Но я уверен, потенциал ещё выше.»',
      options: [],
      nextNodeId: '3',
    },
    {
      id: '3',
      visibleCharacterIds: [PLAYER_ID, GUILD_LEADER_ID],
      activeCharacterIds: [GUILD_LEADER_ID],
      text: '«Потенциал раскроете — получите доступ к стратегическим контрактам. А пока — держите прямой канал. Не злоупотребляйте.»',
      options: [],
      nextNodeId: '4',
    },
    {
      id: '4',
      visibleCharacterIds: [PLAYER_ID, GUILD_LEADER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '«Обещаю: канал будет применяться только по делу. Спасибо за доверие, Лисандра.»',
      options: [],
      isLast: true,
    },
  ],
};
