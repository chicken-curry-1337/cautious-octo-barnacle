import { useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GuildFinanceStore } from '../../../../entities/Finance/Finance.store';
import type { HeroType } from '../../../../shared/types/hero';
import { GuildStore } from '../../../../widgets/Guild/store/Guild.store';
import { RecruitsStore } from '../../store/Recruits.store';
import { traits as traitDefinitions } from '../../../../assets/traits/traits';

import styles from './RecruitList.module.css';

const typeEmojis: Record<string, string> = {
  warrior: '🛡️',
  mage: '🪄',
  rogue: '🗡️',
};

export const RecruitList = observer(() => {
  const recruitStore = useMemo(() => container.resolve(RecruitsStore), []);
  const guildStore = useMemo(() => container.resolve(GuildStore), []);
  const financeStore = useMemo(() => container.resolve(GuildFinanceStore), []);
  const traitMap = useMemo(() => {
    return traitDefinitions.reduce<Record<string, (typeof traitDefinitions)[number]>>((acc, trait) => {
      acc[trait.id] = trait;

      return acc;
    }, {});
  }, []);
  const [openedTrait, setOpenedTrait] = useState<{ heroId: string; traitId: string } | null>(null);

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

  if (recruitStore.recruits.length === 0) return <p>Новых героев пока нет.</p>;

  return (
    <div className={styles.list}>
      <h3>Кандидаты на найм</h3>
      {recruitStore.recruits.map((hero) => {
        const canAfford = financeStore.canAffordGold(hero.recruitCost);

        return (
          <div key={hero.id} className={styles.card}>
            <div>
              <strong>{hero.name}</strong>
              {' '}
              (ур.
              {hero.level}
              ) —
              {' '}
              <em>
                {typeEmojis[hero.type]}
                {' '}
                {hero.type}
              </em>
              {' '}
              — исчезнет через
              {' '}
              {hero.daysRemaining}
              {' '}
              дн.
            </div>
            <div className="stats">
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
                          className={`${styles.traitTag} ${
                            openedTrait && openedTrait.heroId === hero.id && openedTrait.traitId === trait.id
                              ? styles.traitTagActive
                              : ''
                          }`}
                        >
                          {trait.name}
                        </button>
                        {openedTrait
                          && openedTrait.heroId === hero.id
                          && openedTrait.traitId === trait.id && (
                            <div className={styles.traitDropdown}>
                              {trait.description}
                            </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
            <div className={styles.recruitCost}>
              💰
              {hero.recruitCost}
            </div>
            <button
              onClick={() => canAfford && guildStore.hireCandidate(hero.id)}
              className={`${styles.hire} ${canAfford ? '' : styles.hireDisabled}`}
              disabled={!canAfford}
            >
              Нанять
            </button>
          </div>
        );
      })}
    </div>
  );
});
