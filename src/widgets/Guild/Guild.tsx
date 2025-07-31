import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GuildStore } from '../../entities/Guild/Guild.store';
import styles from './Guild.module.css';
import { container } from 'tsyringe';
import { TimeStore } from '../../entities/TimeStore/TimeStore';

export const Guild = observer(() => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState(0);
  const guildStore = useMemo(() => container.resolve(GuildStore), []);
  const timeStore = useMemo(() => container.resolve(TimeStore), []);

  return (
    <div className={styles.container}>
      <div className={styles.dayText}>День: {timeStore.currentDay}</div>
      <button onClick={() => timeStore.nextDay()} className={styles.button}>
        Следующий день
      </button>

      <h2 className={styles.title}>Создать задание</h2>
      <input
        type="text"
        placeholder="Название"
        className={styles.input}
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Описание"
        className={styles.textarea}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Награда"
        className={styles.input}
        value={reward}
        onChange={e => setReward(Number(e.target.value))}
      />
      <button
        onClick={() => {
          guildStore.createQuest(title, description, reward);
          setTitle('');
          setDescription('');
          setReward(0);
        }}
        className={styles.button}
      >
        Добавить задание
      </button>
    </div>
  );
});
