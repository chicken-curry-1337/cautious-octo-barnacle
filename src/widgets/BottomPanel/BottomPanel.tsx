import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { TimeStore } from '../../entities/TimeStore/TimeStore';

import styles from './BottomPanel.module.css';

export const BottomPanel = observer(() => {
  const timeStore = useMemo(() => container.resolve(TimeStore), []);

  return (
    <div className={styles.container}>
      <div className={styles.date}>
        <div className={styles.dayText}>
          {timeStore.dayOfMonth}
          {' '}
          {timeStore.monthName}
          ,
          {' '}
          {timeStore.year}
          {' '}
          г.
        </div>
        <button onClick={() => timeStore.nextDay()} className={styles.button}>
          Следующий день
        </button>
      </div>
    </div>
  );
});
