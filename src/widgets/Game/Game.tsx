import { useState } from 'react';

import { observer } from 'mobx-react-lite';

import { RecruitList } from '../../features/Recruits/ui/RecruitList/RecruitList';
import { BottomPanel } from '../BottomPanel/BottomPanel';
import { DialogueWidget } from '../DialogueWidget/DialogueWidget';
import HeroList from '../HeroList/HeroList';
import QuestTabs from '../Quests/ui/QuestList/ui/QuestTabs/QuestTabs';
import { TopPanel } from '../TopPanel/ui/TopPanel';
import { GuildEventWidget } from '../GuildEventWidget/GuildEventWidget';
import { UpgradePanel } from '../UpgradePanel/ui/UpgradePanel';
import { InventoryPanel } from '../InventoryPanel/InventoryPanel';

export const Game = observer(() => {
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  return (
    <>
      <TopPanel
        onToggleUpgrades={() => setShowUpgrades(prev => !prev)}
        showUpgrades={showUpgrades}
        onToggleInventory={() => setShowInventory(prev => !prev)}
        showInventory={showInventory}
      />
      <GuildEventWidget />
      <UpgradePanel isOpen={showUpgrades} onClose={() => setShowUpgrades(false)} />
      <InventoryPanel isOpen={showInventory} onClose={() => setShowInventory(false)} />
      <RecruitList />
      <HeroList />
      {/* <HeroCreator /> */}
      <DialogueWidget />
      {/* <Guild /> */}
      <QuestTabs />
      <BottomPanel />
      {/* <Notifications /> */}
    </>
  );
});
