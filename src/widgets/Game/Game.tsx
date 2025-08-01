import { observer } from "mobx-react-lite"
import { DialogueWidget } from "../DialogueWidget/DialogueWidget";
import { Guild } from "../Guild/Guild";
import HeroList from "../HeroList/HeroList";
import CandidateList from "../CandidateList/CandidateList";
import { QuestList } from "../QuestList/QuestList";
import GuildFinanceDisplay from "../GuildFinanceDisplay/GuildFinanceDisplay";

export const Game = observer(() => {
    return <div>

    <GuildFinanceDisplay />
      <CandidateList />
        <HeroList />
        {/* <HeroCreator /> */}
        <DialogueWidget />
        <Guild  />
        <QuestList />
        {/* <Notifications /> */}
    </div>
})