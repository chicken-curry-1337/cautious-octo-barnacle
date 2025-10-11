import { useState } from 'react';

import { observer } from 'mobx-react-lite';

import { RecruitList } from '../../features/Recruits/ui/RecruitList/RecruitList';
import { BottomPanel } from '../BottomPanel/BottomPanel';
import { DialogueWidget } from '../DialogueWidget/DialogueWidget';
import { FactionPanel } from '../FactionPanel/FactionPanel';
import { GuildEventWidget } from '../GuildEventWidget/GuildEventWidget';
import HeroList from '../HeroList/HeroList';
import { InventoryPanel } from '../InventoryPanel/InventoryPanel';
import QuestTabs from '../Quests/ui/QuestList/ui/QuestTabs/QuestTabs';
import { FinanceReportModal } from '../FinanceReport/FinanceReportModal';
import { TopPanel } from '../TopPanel/ui/TopPanel';
import { UpgradePanel } from '../UpgradePanel/ui/UpgradePanel';

export const Game = observer(() => {
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showFactions, setShowFactions] = useState(false);
  const [showFinanceReport, setShowFinanceReport] = useState(false);

  return (
    <>
      <TopPanel
        onToggleUpgrades={() => setShowUpgrades(prev => !prev)}
        showUpgrades={showUpgrades}
        onToggleInventory={() => setShowInventory(prev => !prev)}
        showInventory={showInventory}
        onToggleFactions={() => setShowFactions(prev => !prev)}
        showFactions={showFactions}
        onToggleFinance={() => setShowFinanceReport(prev => !prev)}
        showFinanceReport={showFinanceReport}
      />
      <GuildEventWidget />
      <UpgradePanel isOpen={showUpgrades} onClose={() => setShowUpgrades(false)} />
      <InventoryPanel isOpen={showInventory} onClose={() => setShowInventory(false)} />
      <FactionPanel isOpen={showFactions} onClose={() => setShowFactions(false)} />
      <FinanceReportModal isOpen={showFinanceReport} onClose={() => setShowFinanceReport(false)} />
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
