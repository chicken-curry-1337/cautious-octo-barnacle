import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { TimeStore } from '../../entities/TimeStore/TimeStore';
import { GameStateStore } from '../../entities/GameState/GameStateStore';

import styles from './BottomPanel.module.css';

export const BottomPanel = observer(() => {
  const timeStore = useMemo(() => container.resolve(TimeStore), []);
  const gameStateStore = useMemo(() => container.resolve(GameStateStore), []);

  const heroismLabel = (() => {
    const value = gameStateStore.heroism;
    if (value >= 400) return 'Легенды города';
    if (value >= 150) return 'Герои';
    if (value <= -400) return 'Угроза города';
    if (value <= -150) return 'Сомнительная слава';
    return 'Нейтральная репутация';
  })();

  const heroismPercent = Math.min(100, Math.max(0, Math.round(((gameStateStore.heroism + 1000) / 2000) * 100)));

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
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
      <div className={styles.heroismRow}>
        <div className={styles.heroismLabel}>
          Рейтинг героизма:
          {' '}
          <strong>{gameStateStore.heroism}</strong>
          {' '}
          (<span>{heroismLabel}</span>)
        </div>
        <div className={styles.heroismMeter}>
          <div className={styles.heroismMeterTrack}>
            <div className={styles.heroismMeterFill} style={{ width: `${heroismPercent}%` }} />
          </div>
          <div className={styles.heroismScale}>
            <span>-1000</span>
            <span>0</span>
            <span>1000</span>
          </div>
        </div>
      </div>
    </div>
  );
});
