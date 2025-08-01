import { observer } from "mobx-react-lite"
import { DialogueWidget } from "../DialogueWidget/DialogueWidget";
import { Guild } from "../Guild/Guild";
import HeroList from "../HeroList/HeroList";
import CandidateList from "../CandidateList/CandidateList";
import { QuestList } from "../QuestList/QuestList";

export const Game = observer(() => {
    return <div>

      <CandidateList />
        <HeroList />
        {/* <HeroCreator /> */}
        <DialogueWidget />
        <Guild  />
        <QuestList />
        {/* <Notifications /> */}
    </div>
})