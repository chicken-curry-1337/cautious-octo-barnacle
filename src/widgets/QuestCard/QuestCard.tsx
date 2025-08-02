import { observer } from 'mobx-react-lite';
import React, { useMemo, useState } from 'react';
import { container } from 'tsyringe';
import { HeroesStore } from '../../entities/Heroes/Heroes.store';
import { QuestStore } from '../../entities/Quest/Quest.store';
import type { Hero } from '../../shared/types/hero';
import { QuestStatus, type Quest } from '../../shared/types/quest';
import styles from './QuestCard.module.css';

interface QuestCardProps {
  quest: Quest;
  currentDay: number;
  onAssign: (questId: string, heroIds: string[]) => void;
}

const QuestCard: React.FC<QuestCardProps> = observer(
  ({ quest, currentDay, onAssign }) => {
    // Получаем стор ОДИН раз — useMemo не нужен
    const questStore = container.resolve(QuestStore);
    const heroesStore = container.resolve(HeroesStore);

    // heroes теперь из mobx state напрямую — компонент будет реактивно обновляться
    const { heroes } = heroesStore;

    const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);

    const toggleHero = (id: string) => {
      setSelectedHeroes((prev) =>
        prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
      );
    };

    const assignedHeroes = quest.assignedHeroIds
      .map((id) => heroes.find((h) => h.id === id))
      .filter(Boolean) as Hero[];

    const totalStrength = assignedHeroes.reduce(
      (sum, h) => sum + h.strength,
      0
    );
    const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
    const totalIntelligence = assignedHeroes.reduce(
      (sum, h) => sum + h.intelligence,
      0
    );

    const daysLeft = quest.deadlineDay - currentDay;

    const status = useMemo(() => {
      if (quest.status === QuestStatus.NotStarted) return 'Ожидает';
      if (quest.status === QuestStatus.InProgress) return 'В процессе';
      if (quest.status === QuestStatus.FailedDeadline) return 'Просрочено';
      if (quest.status === QuestStatus.CompletedFail) return 'Неуспешно';
      return 'Выполнено';
    }, [quest.status]);

    const availableHeroes = heroes.filter(
      (h) => !quest.assignedHeroIds.includes(h.id) && h.assignedQuestId === null
    );

    const successChance = useMemo(
      () => questStore.getQuestSuccessChance(quest.id, selectedHeroes),
      [questStore, quest.id, selectedHeroes]
    );

    // Функция для цвета прогресса по шансу успеха
    const getProgressColor = (percent: number) => {
      if (percent < 40) return '#e53935'; // красный
      if (percent < 70) return '#fbc02d'; // жёлтый
      return '#43a047'; // зелёный
    };

    const availableHeroesCommission = useMemo(() => {
      if (quest.status === QuestStatus.NotStarted)
        return availableHeroes
          .filter((h) => selectedHeroes.includes(h.id))
          .reduce((sum, h) => sum + (h.minStake ?? 0), 0);
      return assignedHeroes.reduce((sum, h) => sum + (h.minStake ?? 0), 0);
    }, [assignedHeroes, availableHeroes, quest.status, selectedHeroes]);

    const guildProfit = quest.reward - availableHeroesCommission;

    return (
      <li className={styles.card}>
        <h3>{quest.title}</h3>
        <p>
          {quest.status === QuestStatus.NotStarted && quest.description}
          {quest.status === QuestStatus.CompletedSuccess && quest.successResult}
          {quest.status === QuestStatus.CompletedFail && quest.failResult}
          {quest.status === QuestStatus.FailedDeadline && quest.deadlineResult}
        </p>
        {(quest.status === QuestStatus.NotStarted ||
          quest.status === QuestStatus.InProgress) && (
          <p>
            Дедлайн:{' '}
            {daysLeft >= 0
              ? `через ${daysLeft} дн.`
              : `просрочено на ${-daysLeft} дн.`}
          </p>
        )}
        <p>
          Статус: <strong>{status}</strong>
        </p>

        <p>
          Награда:{' '}
          <span className={styles.reward}>💰 {quest.reward} золота</span>
        </p>

        <p>
          Комиссия героев: <span>{availableHeroesCommission} золота</span>
        </p>

        <p>
          Итоговая выгода гильдии:{' '}
          <span
            style={{
              color: guildProfit >= 0 ? '#43a047' : '#e53935',
              fontWeight: '600',
            }}
          >
            {guildProfit} золота
          </span>
        </p>

        {quest.status === QuestStatus.NotStarted && (
          <div className={styles.successChance}>
            <strong>Шанс успеха:</strong>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${successChance}%`,
                  backgroundColor: getProgressColor(successChance),
                }}
                title={`${successChance}%`}
              />
            </div>
            <span>{successChance}%</span>
          </div>
        )}

        <div>
          <strong>Назначенные герои:</strong>
          {assignedHeroes.length === 0 ? (
            <span> — нет</span>
          ) : (
            <ul className={styles.assignedHeroesList}>
              {assignedHeroes.map((hero) => (
                <li key={hero.id}>
                  {hero.name} ({hero.type}) — 💪 {hero.strength} | 🎯{' '}
                  {hero.agility} | 🧠 {hero.intelligence}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <strong>Требования по статам:</strong> 💪 {quest.requiredStrength} |
          🎯 {quest.requiredAgility} | 🧠 {quest.requiredIntelligence}
        </div>

        <div>
          <strong>Суммарные статы героев:</strong> 💪 {totalStrength} | 🎯{' '}
          {totalAgility} | 🧠 {totalIntelligence}
        </div>

        {quest.status === QuestStatus.NotStarted && (
          <div className={styles.heroSelector}>
            <strong>Доступные герои для назначения:</strong>
            {availableHeroes.length === 0 ? (
              <p>Нет доступных героев</p>
            ) : (
              <ul className={styles.heroList}>
                {availableHeroes.map((hero) => (
                  <li key={hero.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedHeroes.includes(hero.id)}
                        onChange={() => toggleHero(hero.id)}
                      />
                      {hero.name} ({hero.type}) — 💪 {hero.strength} | 🎯{' '}
                      {hero.agility} | 🧠 {hero.intelligence}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {quest.status === QuestStatus.NotStarted && (
          <button
            className={styles.assignBtn}
            disabled={availableHeroes.length === 0}
            onClick={() => {
              onAssign(quest.id, selectedHeroes);
              setSelectedHeroes([]);
            }}
          >
            Назначить героев
          </button>
        )}
      </li>
    );
  }
);

export default QuestCard;
