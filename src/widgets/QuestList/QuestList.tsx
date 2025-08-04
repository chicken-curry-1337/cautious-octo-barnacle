import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GuildStore } from '../../entities/Guild/Guild.store';
import { QuestStore } from '../../entities/Quest/Quest.store';
import type { Quest } from '../../shared/types/quest';
import QuestCard from '../QuestCard/QuestCard';

import styles from './QuestList.module.css';

export const QuestList = observer(
  ({ title, quests }: { title: string; quests: Quest[] }) => {
    const guildStore = useMemo(() => container.resolve(GuildStore), []);
    const questStore = useMemo(() => container.resolve(QuestStore), []);
    const {
      timeStore: { currentDay },
    } = guildStore;

    const handleAssign = (questId: string, heroIds: string[]) => {
      questStore.startQuest(questId, heroIds);
    };

    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        {quests.length === 0
          ? (
              <p className={styles.empty}>Нет заданий</p>
            )
          : (
              <ul className={styles.list}>
                {quests.map(quest => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    currentDay={currentDay}
                    onAssign={handleAssign}
                  />
                ))}
              </ul>
            )}
      </div>
    );
  },
);
