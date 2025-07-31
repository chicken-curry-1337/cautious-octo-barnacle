import React, { useState } from 'react';
import styles from './QuestCard.module.css';
import type { Hero, Quest } from '../../entities/Guild/Guild.store';

interface QuestCardProps {
  quest: Quest;
  heroes: Hero[];
  currentDay: number;
  onAssign: (questId: string, heroIds: string[]) => void;
  onStart: (questId: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, heroes, currentDay, onAssign, onStart }) => {
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);

  const toggleHero = (id: string) => {
    setSelectedHeroes(prev =>
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  const assignedHeroes = quest.assignedHeroIds
    .map(id => heroes.find(h => h.id === id))
    .filter(Boolean) as Hero[];

  const totalStrength = assignedHeroes.reduce((sum, h) => sum + h.strength, 0);
  const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
  const totalIntelligence = assignedHeroes.reduce((sum, h) => sum + h.intelligence, 0);

  const daysLeft = quest.deadlineDay - currentDay;

  const status = (() => {
    if (!quest.completed) {
      if (currentDay > quest.deadlineDay) return 'Просрочено';
      return 'В процессе';
    }
    if (quest.failed) return 'Неуспешно';
    return 'Выполнено';
  })();

  const availableHeroes = heroes.filter(h => !quest.assignedHeroIds.includes(h.id));

  return (
    <li className={styles.card}>
      <h3>{quest.title}</h3>
      <p>{quest.description}</p>
      <p>Дедлайн: {daysLeft >= 0 ? `через ${daysLeft} дн.` : `просрочено на ${-daysLeft} дн.`}</p>
      <p>Статус: <strong>{status}</strong></p>

      <div>
        <strong>Назначенные герои:</strong>
        {assignedHeroes.length === 0 ? (
          <span> — нет</span>
        ) : (
          <ul className={styles.assignedHeroesList}>
            {assignedHeroes.map(hero => (
              <li key={hero.id}>
                {hero.name} ({hero.type}) — 💪 {hero.strength} | 🎯 {hero.agility} | 🧠 {hero.intelligence}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <strong>Требования по статам:</strong> 💪 {quest.requiredStrength} | 🎯 {quest.requiredAgility} | 🧠 {quest.requiredIntelligence}
      </div>

      <div>
        <strong>Суммарные статы героев:</strong> 💪 {totalStrength} | 🎯 {totalAgility} | 🧠 {totalIntelligence}
      </div>

      <div className={styles.heroSelector}>
        <strong>Доступные герои для назначения:</strong>
        {availableHeroes.length === 0 ? (
          <p>Нет доступных героев</p>
        ) : (
          <ul className={styles.heroList}>
            {availableHeroes.map(hero => (
              <li key={hero.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedHeroes.includes(hero.id)}
                    onChange={() => toggleHero(hero.id)}
                  />
                  {hero.name} ({hero.type}) — 💪 {hero.strength} | 🎯 {hero.agility} | 🧠 {hero.intelligence}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        className={styles.assignBtn}
        disabled={selectedHeroes.length === 0}
        onClick={() => {
          onAssign(quest.id, selectedHeroes);
          setSelectedHeroes([]);
        }}
      >
        Назначить героев
      </button>

      {!quest.completed && (
        <button className={styles.startBtn} onClick={() => onStart(quest.id)}>
          Начать выполнение
        </button>
      )}
    </li>
  );
};

export default QuestCard;
