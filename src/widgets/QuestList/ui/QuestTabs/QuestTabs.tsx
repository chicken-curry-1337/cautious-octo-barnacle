import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { container } from 'tsyringe';
import { QuestStore } from '../../../../entities/Quest/Quest.store';
import type { Quest } from '../../../../shared/types/quest';
import type { Tab } from '../../../../shared/ui/Tabs/Tabs';
import Tabs from '../../../../shared/ui/Tabs/Tabs';
import { QuestList } from '../../QuestList';

const QuestTabs = observer(() => {
  const questStore = useMemo(() => container.resolve(QuestStore), []);

  const tabs: (Tab & { quests: Quest[] })[] = [
    { id: 'new', label: 'Новые', quests: questStore.newQuests },
    { id: 'in-progress', label: 'В работе', quests: questStore.activeQuests },
    {
      id: 'completed',
      label: 'Выполненные',
      quests: questStore.completedQuests,
    },
  ];
  return (
    <Tabs
      tabs={tabs.map((tab) => ({
        ...tab,
        label: `${tab.label} (${tab.quests.length})`,
      }))}
    >
      {tabs.map((tab) => (
        <QuestList title={tab.label} quests={tab.quests} />
      ))}
    </Tabs>
  );
});

export default QuestTabs;
