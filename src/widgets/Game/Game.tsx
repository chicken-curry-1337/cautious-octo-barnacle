import { useState } from 'react';

import { observer } from 'mobx-react-lite';

import { RecruitList } from '../../features/Recruits/ui/RecruitList/RecruitList';
import { BottomPanel } from '../BottomPanel/BottomPanel';
import CityBoardModal from '../CityBoard/CityBoardModal';
import { DialogueWidget } from '../DialogueWidget/DialogueWidget';
import { FacilityHubModal } from '../FacilityModal/FacilityHubModal';
import { FacilityModal } from '../FacilityModal/FacilityModal';
import { FactionPanel } from '../FactionPanel/FactionPanel';
import { FinanceReportModal } from '../FinanceReport/FinanceReportModal';
import { GuildEventWidget } from '../GuildEventWidget/GuildEventWidget';
import HeroList from '../HeroList/HeroList';
import { InventoryPanel } from '../InventoryPanel/InventoryPanel';
import QuestTabs from '../Quests/ui/QuestList/ui/QuestTabs/QuestTabs';
import SquadManagerModal from '../Squads/SquadManagerModal';
import { TopPanel } from '../TopPanel/ui/TopPanel';
import { UpgradePanel } from '../UpgradePanel/ui/UpgradePanel';

export const Game = observer(() => {
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showFactions, setShowFactions] = useState(false);
  const [showFinanceReport, setShowFinanceReport] = useState(false);
  const [showFacilityHub, setShowFacilityHub] = useState(false);
  const [showSquads, setShowSquads] = useState(false);
  const [showCityBoard, setShowCityBoard] = useState(false);
  const [openFacilityId, setOpenFacilityId] = useState<string | null>(null);

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
        onToggleFacilities={() => setShowFacilityHub(prev => !prev)}
        showFacilities={showFacilityHub}
        onToggleCity={() => setShowCityBoard(prev => !prev)}
        showCity={showCityBoard}
        onToggleSquads={() => setShowSquads(prev => !prev)}
        showSquads={showSquads}
      />
      <GuildEventWidget />
      <UpgradePanel
        isOpen={showUpgrades}
        onClose={() => setShowUpgrades(false)}
      />
      <InventoryPanel isOpen={showInventory} onClose={() => setShowInventory(false)} />
      <FactionPanel isOpen={showFactions} onClose={() => setShowFactions(false)} />
      <FinanceReportModal isOpen={showFinanceReport} onClose={() => setShowFinanceReport(false)} />
      <FacilityHubModal
        isOpen={showFacilityHub}
        onClose={() => setShowFacilityHub(false)}
        onOpenFacility={(id) => {
          setShowFacilityHub(false);
          setOpenFacilityId(id);
        }}
      />
      <CityBoardModal isOpen={showCityBoard} onClose={() => setShowCityBoard(false)} />
      <SquadManagerModal isOpen={showSquads} onClose={() => setShowSquads(false)} />
      <FacilityModal facilityId={openFacilityId} onClose={() => setOpenFacilityId(null)} />
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
