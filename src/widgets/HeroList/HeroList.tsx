import React, { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { HeroesStore } from '../../features/Heroes/Heroes.store';
import { QuestsStore } from '../../features/Quests/Quests.store';
import type { HeroType } from '../../shared/types/hero';

import styles from './HeroList.module.css';

const HeroList: React.FC = observer(() => {
  const heroesStore = useMemo(() => container.resolve(HeroesStore), []);
  const questStore = useMemo(() => container.resolve(QuestsStore), []);

  const getQuestTitle = (questId: string | null) => {
    if (!questId) return '—';
    const quest = questStore.quests.find(q => q.id === questId);

    return quest ? quest.title : 'Неизвестное задание';
  };

  // Функция для красивого отображения типа
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'warrior':
        return 'Воин';
      case 'mage':
        return 'Маг';
      case 'rogue':
        return 'Вор';
      default:
        return 'Неизвестно';
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
      {heroesStore.heroes.length === 0
        ? (
            <p className={styles.empty}>Нет героев</p>
          )
        : (
            <ul className={styles.list}>
              {heroesStore.heroes.map(hero => (
                <li key={hero.id} className={styles.card}>
                  <div className={styles.name}>
                    {hero.name}
&nbsp;
                    <em>
                      (
                      {getTypeLabel(hero.type)}
                      )
                    </em>
                    {!hero.assignedQuestId && (
                      <button
                        onClick={() => heroesStore.fireHero(hero.id)}
                        className={styles.fireButton}
                      >
                        Уволить героя
                      </button>
                    )}
                  </div>

                  {hero.injured && (
                    <div className={styles.injured}>
                      Герой ранен и не может участвовать в заданиях!
                      <br />
                      Восстановится через
                      {' '}
                      {hero.injuredTimeout}
                      {' '}
                      дн.
                    </div>
                  )}
                  <div>
                    Уровень:
                    {hero.level}
                  </div>
                  <p className={styles.minStake}>
                    Минимальная ставка:
                    {' '}
                    <strong>
                      {hero.minStake}
                      {' '}
                      золота
                    </strong>
                  </p>
                  <p className={styles[getDescriptionClass(hero.type)]}>
                    {hero.description}
                  </p>
                  <div>
                    Назначен на:
                    {' '}
                    <strong>{getQuestTitle(hero.assignedQuestId)}</strong>
                  </div>
                  <div className="stats" style={{ marginTop: '5px' }}>
                    💪
                    {' '}
                    {hero.strength}
                    {' '}
                    | 🎯
                    {' '}
                    {hero.agility}
                    {' '}
                    | 🧠
                    {' '}
                    {hero.intelligence}
                  </div>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
});

export default HeroList;
