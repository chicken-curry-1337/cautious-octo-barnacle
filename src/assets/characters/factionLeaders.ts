import type { ICharacter } from '../../entities/Dialogue/Dialogue.store';
import cartelLeaderPortrait from '../images/leaders/cartel-leader.svg';
import citizensLeaderPortrait from '../images/leaders/citizens-leader.svg';
import guardLeaderPortrait from '../images/leaders/guard-leader.svg';
import guildLeaderPortrait from '../images/leaders/guild-leader.svg';
import merchantsLeaderPortrait from '../images/leaders/merchants-leader.svg';

export const GUILD_LEADER_ID = 'leader_lisandra';
export const guildLeaderCharacter: ICharacter = {
  id: GUILD_LEADER_ID,
  name: 'Лисандра Хельвик',
  avatarUrl: guildLeaderPortrait,
};

export const GUARD_LEADER_ID = 'leader_arina';
export const guardLeaderCharacter: ICharacter = {
  id: GUARD_LEADER_ID,
  name: 'Капитан Арина Стеллар',
  avatarUrl: guardLeaderPortrait,
};

export const MERCHANTS_LEADER_ID = 'leader_verena';
export const merchantsLeaderCharacter: ICharacter = {
  id: MERCHANTS_LEADER_ID,
  name: 'Комесса Верена Дааль',
  avatarUrl: merchantsLeaderPortrait,
};

export const CARTEL_LEADER_ID = 'leader_kassandra';
export const cartelLeaderCharacter: ICharacter = {
  id: CARTEL_LEADER_ID,
  name: 'Кассандра Ноктюрн',
  avatarUrl: cartelLeaderPortrait,
};

export const CITIZENS_LEADER_ID = 'leader_mirella';
export const citizensLeaderCharacter: ICharacter = {
  id: CITIZENS_LEADER_ID,
  name: 'Старейшина Мирелла',
  avatarUrl: citizensLeaderPortrait,
};
