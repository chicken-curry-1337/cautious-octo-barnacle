import { observer } from "mobx-react-lite"
import type { GameStore } from "../../features/Game/Game.store";
import { CreateUser } from "../../widgets/CreateUser/CreateUser";
import { GameScreen } from "../../features/Game/Game.enum";
import { UserCreationDone } from "../../widgets/UserCreationDone/UserCreationDone";
import { Game } from "../../widgets/Game/Game";



export const GamePage = observer(({gameStore}: {
    gameStore: GameStore
}) => {
    const {userStore: {defaultUser, createUser, user}, gameScreen, setGameScreen} = gameStore;

    return <Game />

    if (gameScreen === GameScreen.UserCreationDone) return <UserCreationDone user={user} setGameScreen={setGameScreen} />;

    if (gameScreen === GameScreen.UserCreation) return <CreateUser defaultUser={defaultUser} createUser={(data) => {
            createUser(data);
            setGameScreen(GameScreen.UserCreationDone);
        }} />;

    if (gameScreen === GameScreen.Game) return <Game />;
})