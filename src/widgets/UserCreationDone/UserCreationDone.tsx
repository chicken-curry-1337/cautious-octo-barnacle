import { observer } from 'mobx-react-lite';

import type { TUser } from '../../entities/User/User.store';
import { GameScreen } from '../../features/Game/Game.enum';

import styles from './UserCreationDone.module.css';

export const UserCreationDone = observer(
  ({
    user,
    setGameScreen,
  }: {
    user: TUser;
    setGameScreen: (gameScreen: GameScreen) => void;
  }) => {
    const { userAbilities, playerName } = user;

    return (
      <div className={styles.userCreationDone}>
        <div>
          {playerName.name}
          {' '}
          {playerName.surname}
        </div>
        {Object.entries(userAbilities).map(([key, value]) => (
          <div key={key}>
            {key}
            :
            {value}
          </div>
        ))}
        <button
          onClick={() => {
            setGameScreen(GameScreen.Game);
          }}
        >
          Submit
        </button>
        <button
          onClick={() => {
            setGameScreen(GameScreen.UserCreation);
          }}
        >
          cancel
        </button>
      </div>
    );
  },
);
