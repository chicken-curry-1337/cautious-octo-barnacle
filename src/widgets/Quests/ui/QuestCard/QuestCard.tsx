import React from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { QuestsStore } from '../../../../features/Quests/Quests.store';
// import type { ICharacter } from '../../../../shared/types/hero';
import { QuestStatus, type IQuest } from '../../../../shared/types/quest';

import styles from './QuestCard.module.css';

interface QuestCardProps {
  quest: IQuest;
  currentDay: number;
  onClick: (questId: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = observer(
  ({ quest, currentDay, onClick }) => {
    const questStore = container.resolve(QuestsStore);

    // heroes теперь из mobx state напрямую — компонент будет реактивно обновляться
    // const { availableHeroes } = heroesStore;

    // const [selectedHeroesIds, setSelectedHeroesIds] = useState<string[]>([]);

    // const toggleHero = (id: string) => {
    //   setSelectedHeroesIds(prev =>
    //     prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id],
    //   );
    // };

    // const assignedHeroes = quest.assignedHeroIds
    //   .map(id => heroes.find(h => h.id === id))
    //   .filter(Boolean) as ICharacter[];

    // const totalStrength = assignedHeroes.reduce(
    //   (sum, h) => sum + h.strength,
    //   0,
    // );
    // const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
    // const totalIntelligence = assignedHeroes.reduce(
    //   (sum, h) => sum + h.intelligence,
    //   0,
    // );

    const deadlineDaysLeft = quest.deadlineAccept - currentDay;

    // const status = useMemo(() => {
    //   if (quest.status === QuestStatus.NotStarted) return 'Ожидает';
    //   if (quest.status === QuestStatus.InProgress) return 'В процессе';
    //   if (quest.status === QuestStatus.FailedDeadline) return 'Просрочено';
    //   if (quest.status === QuestStatus.CompletedFail) return 'Неуспешно';

    //   return 'Выполнено';
    // }, [quest.status]);

    // const availableForQuestHeroes = availableHeroes.filter(
    //   h => !quest.assignedHeroIds.includes(h.id) && h.assignedQuestId === null,
    // );

    // const successChance = useMemo(
    //   () => questStore.getNewQuestSuccessChance(quest.id, selectedHeroesIds),
    //   [questStore, quest.id, selectedHeroesIds],
    // );

    // Функция для цвета прогресса по шансу успеха
    // const getProgressColor = (percent: number) => {
    //   if (percent < 40) return '#e53935'; // красный
    //   if (percent < 70) return '#fbc02d'; // жёлтый

    //   return '#43a047'; // зелёный
    // };

    // const availableHeroesCommission = useMemo(() => {
    //   if (quest.status === QuestStatus.NotStarted) return availableForQuestHeroes
    //     .filter(h => selectedHeroesIds.includes(h.id))
    //     .reduce((sum, h) => sum + (h.minStake ?? 0), 0);

    //   return assignedHeroes.reduce((sum, h) => sum + (h.minStake ?? 0), 0);
    // }, [
    //   assignedHeroes,
    //   availableForQuestHeroes,
    //   quest.status,
    //   selectedHeroesIds,
    // ]);

    // const guildProfit = quest.reward - availableHeroesCommission;

    return (
      <li className={styles.card} onClick={() => onClick(quest.id)}>
        <h3>
          {quest.title}
          . Дата создания:
          {quest.dateCreated}
        </h3>
        <p>
          {quest.status === QuestStatus.NotStarted && quest.description}
          {quest.status === QuestStatus.CompletedSuccess && quest.successResult}
          {quest.status === QuestStatus.CompletedFail && quest.failResult}
          {quest.status === QuestStatus.FailedDeadline && quest.deadlineResult}
        </p>
        {(quest.status === QuestStatus.NotStarted) && (
          <p>
            Дедлайн:
            {' '}
            {deadlineDaysLeft > 0
              ? `через ${deadlineDaysLeft} дн.`
              : 'Последняя возможность взять задание!'}
          </p>
        )}
        {(quest.status === QuestStatus.InProgress && quest.executionDeadline !== null) && (
          <p>
            Будет выполнено через:
            {' '}
            {quest.executionDeadline - questStore.timeStore.absoluteDay >= 0
              ? `через ${quest.executionDeadline - questStore.timeStore.absoluteDay} дн.`
              : `Выполнено`}
          </p>
        )}
        {/* <p>
          Статус:
          {' '}
          <strong>{status}</strong>
        </p> */}

        <p>
          Награда:
          {' '}
          <span className={styles.reward}>
            💰
            {quest.reward}
            {' '}
            золота
          </span>
        </p>

        {/* <p>
          Комиссия героев:
          {' '}
          <span>
            {availableHeroesCommission}
            {' '}
            золота
          </span>
        </p>

        <p>
          Итоговая выгода гильдии:
          {' '}
          <span
            style={{
              color: guildProfit >= 0 ? '#43a047' : '#e53935',
              fontWeight: '600',
            }}
          >
            {guildProfit}
            {' '}
            золота
          </span>
        </p> */}

        {/* <div>
          <strong>Назначенные герои:</strong>
          {assignedHeroes.length === 0
            ? (
                <span> — нет</span>
              )
            : (
                <ul className={styles.assignedHeroesList}>
                  {assignedHeroes.map(hero => (
                    <li key={hero.id}>
                      {hero.name}
                      {' '}
                      (
                      {hero.type}
                      ) — 💪
                      {hero.strength}
                      {' '}
                      | 🎯
                      {' '}
                      {hero.agility}
                      {' '}
                      | 🧠
                      {hero.intelligence}
                    </li>
                  ))}
                </ul>
              )}
        </div> */}
      </li>
    );
  },
);

export default QuestCard;
