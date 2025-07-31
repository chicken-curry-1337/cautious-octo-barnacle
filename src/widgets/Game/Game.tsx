import { observer } from "mobx-react-lite"
import { DialogueWidget } from "../DialogueWidget/DialogueWidget";
import { Guild } from "../Guild/Guild";
import HeroList from "../HeroList/HeroList";
import CandidateList from "../CandidateList/CandidateList";
import { QuestList } from "../QuestList/QuestList";

// Dialogue Data
const characters = [
  {
    id: "alice",
    name: "Алиса",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "bob",
    name: "Боб",
    avatarUrl: "https://i.pravatar.cc/150?img=8",
  },
];




export const Game = observer(() => {
    return <div>

      <CandidateList />
        <HeroList />
        {/* <HeroCreator /> */}
        <DialogueWidget characters={characters} />
        <Guild  />
        <QuestList />
        {/* <Notifications /> */}
    </div>
})