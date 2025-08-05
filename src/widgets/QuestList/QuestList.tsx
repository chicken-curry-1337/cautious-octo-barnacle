import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { QuestStore } from '../../features/Quest/Quest.store';
import type { IQuest } from '../../shared/types/quest';
import { GuildStore } from '../Guild/store/Guild.store';
import QuestCard from '../QuestCard/QuestCard';

import styles from './QuestList.module.css';

export const QuestList = observer(
  ({ title, quests }: { title: string; quests: IQuest[] }) => {
    const guildStore = useMemo(() => container.resolve(GuildStore), []);
    const questStore = useMemo(() => container.resolve(QuestStore), []);
    const {
      timeStore: { dayOfMonth },
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
                    currentDay={dayOfMonth}
                    onAssign={handleAssign}
                  />
                ))}
              </ul>
            )}
      </div>
    );
  },
);
