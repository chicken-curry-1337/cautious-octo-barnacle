import React, { useMemo, useState } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { traitMap } from '../../assets/traits/traits';
import { HeroesStore } from '../../features/Heroes/Heroes.store';
import { QuestsStore } from '../../features/Quests/Quests.store';
import type { HeroType } from '../../shared/types/hero';

import styles from './HeroList.module.css';

const HeroList: React.FC = observer(() => {
  const heroesStore = useMemo(() => container.resolve(HeroesStore), []);
  const questStore = useMemo(() => container.resolve(QuestsStore), []);
  const [openedTrait, setOpenedTrait] = useState<{ heroId: string; traitId: string } | null>(null);

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
                    {!hero.assignedQuestId && !hero?.isMainHero && (
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
                    Зарплата (в мес.):
                    {' '}
                    <strong>
                      {hero.monthlySalary}
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
                  {(hero.traits?.length ?? 0) > 0 && (
                    <div className={styles.traitsSection}>
                      <strong>Черты:</strong>
                      <div className={styles.traitTags}>
                        {hero.traits
                          .map(traitId => traitMap[traitId])
                          .filter(Boolean)
                          .map(trait => (
                            <div key={`${hero.id}-${trait.id}`} className={styles.traitTagWrapper}>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenedTrait(prev =>
                                    prev && prev.heroId === hero.id && prev.traitId === trait.id
                                      ? null
                                      : { heroId: hero.id, traitId: trait.id },
                                  );
                                }}
                                className={clsx(styles.traitTag, {
                                  [styles.traitTagActive]: openedTrait && openedTrait.heroId === hero.id && openedTrait.traitId === trait.id,
                                  [styles.traitTagRare]: trait.rarity === 'rare',
                                  [styles.traitTagUnique]: trait.rarity === 'unique',
                                })}
                              >
                                <span>{trait.name}</span>
                                {trait.rarity !== 'common' && (
                                  <span className={styles.traitBadge}>
                                    {trait.rarity === 'unique' ? 'уникальная' : 'редкая'}
                                  </span>
                                )}
                              </button>
                              {openedTrait
                                && openedTrait.heroId === hero.id
                                && openedTrait.traitId === trait.id && (
                                <div className={styles.traitDropdown}>
                                  {trait.description}
                                  <div className={styles.traitMeta}>
                                    Редкость:
                                    {' '}
                                    <strong>{trait.rarity === 'unique' ? 'Уникальная' : trait.rarity === 'rare' ? 'Редкая' : 'Обычная'}</strong>
                                  </div>
                                  {trait.synergyTags.length > 0 && (
                                    <div className={styles.traitMeta}>
                                      Теги:
                                      {' '}
                                      <strong>{trait.synergyTags.join(', ')}</strong>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
    </div>
  );
});

export default HeroList;
