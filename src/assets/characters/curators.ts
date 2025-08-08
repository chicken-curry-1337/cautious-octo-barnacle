import type { ICharacter } from '../../entities/Dialogue/Dialogue.store';
import curator1Image from '../images/curator1.png';
import curator2Image from '../images/curator2.png';

export const CURATOR_ID_1 = 'curator1';
export const curator1: ICharacter = {
  id: CURATOR_ID_1,
  name: 'Куратор 1',
  avatarUrl: curator1Image,
};

export const CURATOR_ID_2 = 'curator2';
export const curator2: ICharacter = {
  id: CURATOR_ID_2,
  name: 'Куратор 2',
  avatarUrl: curator2Image,
};

export const CURATOR_ID_3 = 'curator3';
export const curator3: ICharacter = {
  id: CURATOR_ID_3,
  name: 'Куратор 3',
  avatarUrl: curator1Image,
};
