import { useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { QuestsStore } from '../../../features/Quest/Quests.store';

import styles from './Guild.module.css';

export const Guild = observer(() => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState(0);
  const questStore = useMemo(() => container.resolve(QuestsStore), []);

  return (
    <div className={styles.container}>
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
          questStore.createQuest(title, description, '', '', '', reward);
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
