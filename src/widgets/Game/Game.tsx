import { observer } from 'mobx-react-lite';

import CandidateList from '../CandidateList/CandidateList';
import { DialogueWidget } from '../DialogueWidget/DialogueWidget';
import { Guild } from '../Guild/Guild';
import GuildFinanceDisplay from '../GuildFinanceDisplay/GuildFinanceDisplay';
import HeroList from '../HeroList/HeroList';
import QuestTabs from '../QuestList/ui/QuestTabs/QuestTabs';

export const Game = observer(() => {
  return (
    <div>
      <GuildFinanceDisplay />
      <CandidateList />
      <HeroList />
      {/* <HeroCreator /> */}
      <DialogueWidget />
      <Guild />
      <QuestTabs />
      {/* <Notifications /> */}
    </div>
  );
});
