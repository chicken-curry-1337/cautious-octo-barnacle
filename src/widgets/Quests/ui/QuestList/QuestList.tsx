import { useEffect, useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { QuestsStore } from '../../../../features/Quests/Quests.store';
import type { IQuest } from '../../../../shared/types/quest';
import { GuildStore } from '../../../Guild/store/Guild.store';
import QuestCard from '../QuestCard/QuestCard';
import { QuestDetailedCard } from '../QuestDetailedCard/QuestDetailedCard';

import styles from './QuestList.module.css';

export const QuestList = observer(
  ({ title, quests }: { title: string; quests: IQuest[] }) => {
    const guildStore = useMemo(() => container.resolve(GuildStore), []);
    const questStore = useMemo(() => container.resolve(QuestsStore), []);
    const { startQuest } = questStore;
    const [selectedQuestId, setSelectedQuestId] = useState<null | string>(null);
    const {
      timeStore: { absoluteDay },
    } = guildStore;

    const onClick = (questId: string) => {
      setSelectedQuestId(questId);
    };

    const onCloseQuestModal = () => {
      setSelectedQuestId(null);
    };

    const handleAssign = (questId: string, heroIds: string[]) => {
      startQuest(questId, heroIds);
    };

    const quest = useMemo(() => {
      return quests.find(q => q.id === selectedQuestId);
    }, [quests, selectedQuestId]);

    return (
      <>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {title.startsWith('В работе') && (
              <div className={styles.limitInfo}>
                Заданий в работе:
                {' '}
                <strong>
                  {questStore.currentActiveMissions}
                  {' '}
                  /
                  {' '}
                  {questStore.activeMissionsLimit}
                </strong>
              </div>
            )}
          </div>
          {!questStore.boardUnlocked && title.startsWith('Новые') && (
            <p className={styles.boardLocked}>Постройте доску объявлений, чтобы получать контракты.</p>
          )}
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
                      currentDay={absoluteDay}
                      onClick={onClick}
                    />
                  ))}
                </ul>
              )}
        </div>
        {quest && <QuestDetailedCard quest={quest} onClose={onCloseQuestModal} onAssign={handleAssign} />}
      </>
    );
  },
);
