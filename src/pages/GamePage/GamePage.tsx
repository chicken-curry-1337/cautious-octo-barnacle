import { observer } from 'mobx-react-lite';

import { GameScreen } from '../../features/Game/Game.enum';
import type { GameStore } from '../../features/Game/Game.store';
import { CreateUser } from '../../widgets/CreateUser/CreateUser';
import { Game } from '../../widgets/Game/Game';
import { UserCreationDone } from '../../widgets/UserCreationDone/UserCreationDone';

export const GamePage = observer(({ gameStore }: { gameStore: GameStore }) => {
  const {
    userStore: { defaultUser, createUser, user },
    gameScreen,
    setGameScreen,
  } = gameStore;

  return <Game />;

  if (gameScreen === GameScreen.UserCreationDone) return <UserCreationDone user={user} setGameScreen={setGameScreen} />;

  if (gameScreen === GameScreen.UserCreation) return (
    <CreateUser
      defaultUser={defaultUser}
      createUser={(data) => {
        createUser(data);
        setGameScreen(GameScreen.UserCreationDone);
      }}
    />
  );

  if (gameScreen === GameScreen.Game) return <Game />;
});
