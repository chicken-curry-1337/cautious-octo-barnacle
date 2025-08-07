import { observer } from 'mobx-react-lite';

import { RecruitList } from '../../features/Recruits/ui/RecruitList/RecruitList';
import { BottomPanel } from '../BottomPanel/BottomPanel';
import { DialogueWidget } from '../DialogueWidget/DialogueWidget';
import { Guild } from '../Guild/ui/Guild';
import HeroList from '../HeroList/HeroList';
import QuestTabs from '../Quests/ui/QuestList/ui/QuestTabs/QuestTabs';
import { TopPanel } from '../TopPanel/ui/TopPanel';

export const Game = observer(() => {
  return (
    <div>
      <TopPanel />
      <RecruitList />
      <HeroList />
      {/* <HeroCreator /> */}
      <DialogueWidget />
      {/* <Guild /> */}
      <QuestTabs />
      <BottomPanel />
      {/* <Notifications /> */}
    </div>
  );
});
