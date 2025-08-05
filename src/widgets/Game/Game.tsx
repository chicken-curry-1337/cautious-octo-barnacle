import { observer } from 'mobx-react-lite';

import { BottomPanel } from '../BottomPanel/BottomPanel';
import CandidateList from '../CandidateList/CandidateList';
import { DialogueWidget } from '../DialogueWidget/DialogueWidget';
import { Guild } from '../Guild/ui/Guild';
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
      <BottomPanel />
      {/* <Notifications /> */}
    </div>
  );
});
