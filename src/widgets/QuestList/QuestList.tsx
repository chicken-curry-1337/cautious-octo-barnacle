import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './QuestList.module.css';
import { GuildStore } from '../../entities/Guild/Guild.store';
import QuestCard from '../QuestCard/QuestCard';
import { container } from 'tsyringe';

const QuestList = observer(() => {
  const guildStore = useMemo(() => container.resolve(GuildStore), []);
  const { quests, heroes, timeStore: {currentDay} } = guildStore;

  const handleAssign = (questId: string, heroIds: string[]) => {
    guildStore.assignHeroesToQuest(heroIds, questId);
  };

  const handleStart = (questId: string) => {
    guildStore.startQuest(questId); // Тут логика старта (твой метод)
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Задания</h2>
      {quests.length === 0 ? (
        <p className={styles.empty}>Нет заданий</p>
      ) : (
        <ul className={styles.list}>
          {quests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              heroes={heroes}
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

export default QuestList;
