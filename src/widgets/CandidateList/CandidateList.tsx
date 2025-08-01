import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './CandidateList.module.css';
import { GuildStore, type HeroType } from '../../entities/Guild/Guild.store';
import { container } from 'tsyringe';

const typeEmojis: Record<string, string> = {
  warrior: '🛡️',
  mage: '🪄',
  rogue: '🗡️',
};

const CandidateList = observer(() => {
  const guildStore = useMemo(() => container.resolve(GuildStore), []);
  
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
      {guildStore.candidates.map(hero => (
        <div key={hero.id} className={styles.card}>
          <div>
            <strong>{hero.name}</strong> (ур. {hero.level}) — <em>{typeEmojis[hero.type]} {hero.type}</em> — исчезнет через {hero.daysRemaining} дн.
          </div>
          <div className="stats">
            💪 {hero.strength} | 🎯 {hero.agility} | 🧠 {hero.intelligence}
          </div>
          <p className={styles[getDescriptionClass(hero.type)]}>
            {hero.description}
        </p>

          <button onClick={() => guildStore.hireCandidate(hero.id)} className={styles.hire}>
            Нанять
          </button>
        </div>
      ))}
    </div>
  );
});

export default CandidateList;
