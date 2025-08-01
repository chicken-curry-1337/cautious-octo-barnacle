import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './CandidateList.module.css';
import { GuildStore, type HeroType } from '../../entities/Guild/Guild.store';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import { container } from 'tsyringe';

const typeEmojis: Record<string, string> = {
  warrior: '🛡️',
  mage: '🪄',
  rogue: '🗡️',
};

const CandidateList = observer(() => {
  const guildStore = useMemo(() => container.resolve(GuildStore), []);
  const financeStore = useMemo(() => container.resolve(GuildFinanceStore), []);

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

  if (guildStore.candidates.length === 0) return <p>Новых героев пока нет.</p>;

  return (
    <div className={styles.list}>
      <h3>Кандидаты на найм</h3>
      {guildStore.candidates.map(hero => {
        const canAfford = financeStore.canAffordGold(hero.recruitCost);

        console.log({canAfford})

        return (
          <div key={hero.id} className={styles.card}>
            <div>
              <strong>{hero.name}</strong> (ур. {hero.level}) — <em>{typeEmojis[hero.type]} {hero.type}</em> — исчезнет через {hero.daysRemaining} дн.
            </div>
            <div className="stats">
              💪 {hero.strength} | 🎯 {hero.agility} | 🧠 {hero.intelligence}
            </div>
            <p className={styles.minStake}>
                Минимальная ставка: <strong>{hero.minStake} золота</strong>
            </p>
            <p className={styles[getDescriptionClass(hero.type)]}>
              {hero.description}
            </p>
            <div className={styles.recruitCost}>💰 {hero.recruitCost}</div>
            <button
              onClick={() => canAfford && guildStore.hireCandidate(hero.id)}
              className={`${styles.hire} ${canAfford ? '' : styles.hireDisabled }`}
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

export default CandidateList;
