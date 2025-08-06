import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { QuestsStore } from '../../../../features/Quest/Quests.store';
import type { IQuest } from '../../../../shared/types/quest';
import type { Tab } from '../../../../shared/ui/Tabs/Tabs';
import Tabs from '../../../../shared/ui/Tabs/Tabs';
import { QuestList } from '../../QuestList';

const QuestTabs = observer(() => {
  const questStore = useMemo(() => container.resolve(QuestsStore), []);

  const tabs: (Tab & { quests: IQuest[] })[] = [
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
      tabs={tabs.map(tab => ({
        ...tab,
        label: `${tab.label} (${tab.quests.length})`,
      }))}
    >
      {tabs.map(tab => (
        <QuestList title={tab.label} quests={tab.quests} key={tab.id} />
      ))}
    </Tabs>
  );
});

export default QuestTabs;
