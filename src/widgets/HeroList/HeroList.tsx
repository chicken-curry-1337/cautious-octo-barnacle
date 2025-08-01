import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './HeroList.module.css';
import { GuildStore, type HeroType } from '../../entities/Guild/Guild.store';
import { container } from 'tsyringe';

const HeroList: React.FC = observer(() => {
  const guildStore = useMemo(() => container.resolve(GuildStore), []);

  const getQuestTitle = (questId: string | null) => {
    if (!questId) return '—';
    const quest = guildStore.quests.find(q => q.id === questId);
    return quest ? quest.title : 'Неизвестное задание';
  };

  // Функция для красивого отображения типа
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'warrior': return 'Воин';
      case 'mage': return 'Маг';
      case 'rogue': return 'Вор';
      default: return 'Неизвестно';
    }
  };
  
  function getDescriptionClass(type: HeroType) {
      switch (type) {
          case 'warrior':
          return 'descWarrior';
          case 'mage':
          return 'descMage';
          case 'rogue':
          return 'descRogue';
          default:
          return '';
      }
    }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Герои</h2>
      {guildStore.heroes.length === 0 ? (
        <p className={styles.empty}>Нет героев</p>
      ) : (
        <ul className={styles.list}>
          {guildStore.heroes.map(hero => (
            <li key={hero.id} className={styles.card}>
              <div className={styles.name}>
                {hero.name} <em>({getTypeLabel(hero.type)})</em>
              </div>
              <div>Уровень: {hero.level}</div>
              <p className={styles.minStake}>
                    Минимальная ставка: <strong>{hero.minStake} золота</strong>
                </p>
              <p className={styles[getDescriptionClass(hero.type)]}>
                {hero.description}
            </p>
              <div>
                Назначен на: <strong>{getQuestTitle(hero.assignedQuestId)}</strong>
              </div>
              <div className="stats" style={{ marginTop: '5px' }}>
                💪 {hero.strength} | 🎯 {hero.agility} | 🧠 {hero.intelligence}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default HeroList;
