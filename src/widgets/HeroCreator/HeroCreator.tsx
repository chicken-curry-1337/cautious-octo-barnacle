import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import styles from './HeroCreator.module.css';

const HeroCreator: React.FC = observer(() => {
  const [name, setName] = useState('');
  // const guildStore = useMemo(() => container.resolve(GuildStore), []);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      // guildStore.createHero(trimmed);
      setName('');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Создать героя</h2>
      <input
        className={styles.input}
        type="text"
        value={name}
        placeholder="Имя героя"
        onChange={(e) => setName(e.target.value)}
      />
      <button className={styles.button} onClick={handleCreate}>
        Добавить героя
      </button>
    </div>
  );
});

export default HeroCreator;
