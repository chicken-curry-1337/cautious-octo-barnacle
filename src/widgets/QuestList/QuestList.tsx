import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { container } from 'tsyringe';
import { GuildStore } from '../../entities/Guild/Guild.store';
import { QuestStore } from '../../entities/Quest/Quest.store';
import QuestCard from '../QuestCard/QuestCard';
import styles from './QuestList.module.css';

export const QuestList = observer(() => {
  const guildStore = useMemo(() => container.resolve(GuildStore), []);
  const {
    timeStore: { currentDay },
  } = guildStore;
  const questStore = useMemo(() => container.resolve(QuestStore), []);

  const handleAssign = (questId: string, heroIds: string[]) => {
    guildStore.assignHeroesToQuest(heroIds, questId);
  };

  const handleStart = (questId: string) => {
    guildStore.startQuest(questId); // Тут логика старта (твой метод)
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Задания</h2>
      {questStore.quests.length === 0 ? (
        <p className={styles.empty}>Нет заданий</p>
      ) : (
        <ul className={styles.list}>
          {questStore.quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              currentDay={currentDay}
              onAssign={handleAssign}
              onStart={handleStart}
            />
          ))}
        </ul>
      )}
    </div>
  );
});
