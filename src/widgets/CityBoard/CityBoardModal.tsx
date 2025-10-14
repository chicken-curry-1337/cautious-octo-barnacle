import { useMemo } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { factionMap, type FactionId } from '../../assets/factions/factions';
import { CityStore } from '../../entities/City/City.store';

import styles from './CityBoardModal.module.css';

type CityBoardModalProps = {
  isOpen: boolean;
  onClose?: () => void;
};

const meterStyle = (value: number) => ({
  width: `${Math.max(0, Math.min(100, Math.round(value)))}%`,
});

export const CityBoardModal = observer(({ isOpen, onClose }: CityBoardModalProps) => {
  const cityStore = useMemo(() => container.resolve(CityStore), []);

  if (!isOpen) return null;

  const { districts } = cityStore;
  const prosperityAvg = districts.reduce((sum, d) => sum + d.prosperity, 0) / Math.max(1, districts.length);
  const securityAvg = districts.reduce((sum, d) => sum + d.security, 0) / Math.max(1, districts.length);
  const unrestAvg = districts.reduce((sum, d) => sum + d.unrest, 0) / Math.max(1, districts.length);
  const controlAvg = districts.reduce((sum, d) => sum + d.control.value, 0) / Math.max(1, districts.length);

  const controlLabel = (factionId: FactionId | 'neutral') => {
    if (!factionId || factionId === 'neutral') return 'Нейтральная зона';

    const faction = factionMap[factionId as keyof typeof factionMap];

    return faction ? faction.name : 'Неизвестная фракция';
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>Состояние города</div>
          {onClose && (
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Закрыть карту города">
              ×
            </button>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Среднее влияние гильдии / фракций</span>
              <span className={styles.summaryValue}>{Math.round(controlAvg)}%</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Среднее благополучие</span>
              <span className={styles.summaryValue}>{Math.round(prosperityAvg)}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Средняя безопасность</span>
              <span className={styles.summaryValue}>{Math.round(securityAvg)}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Средний уровень напряжённости</span>
              <span className={styles.summaryValue}>{Math.round(unrestAvg)}</span>
            </div>
          </div>

          <div className={styles.districtGrid}>
            {districts.map((district) => (
              <article key={district.id} className={styles.districtCard}>
                <div className={styles.districtHeader}>
                  <div>
                    <div className={styles.districtName}>{district.name}</div>
                    <div className={styles.primaryMetric}>{controlLabel(district.control.factionId)}</div>
                  </div>
                  <div className={styles.districtTags}>
                    {district.tags.map(tag => (
                      <span key={`${district.id}-${tag}`} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <p>{district.description}</p>

                <div className={styles.meterRow}>
                  <div className={styles.meterLabel}>
                    <span>Благополучие</span>
                    <span>{district.prosperity}</span>
                  </div>
                  <div className={styles.meter}>
                    <div className={styles.meterFill} style={meterStyle(district.prosperity)} />
                  </div>
                </div>

                <div className={styles.meterRow}>
                  <div className={styles.meterLabel}>
                    <span>Безопасность</span>
                    <span>{district.security}</span>
                  </div>
                  <div className={styles.meter}>
                    <div className={styles.meterFill} style={meterStyle(district.security)} />
                  </div>
                </div>

                <div className={styles.meterRow}>
                  <div className={styles.meterLabel}>
                    <span>Напряжённость</span>
                    <span>{district.unrest}</span>
                  </div>
                  <div className={styles.meter}>
                    <div
                      className={clsx(styles.meterFill, styles.meterFillDanger)}
                      style={meterStyle(district.unrest)}
                    />
                  </div>
                </div>

                <div className={styles.eventsList}>
                  {district.recentEvents.length === 0 ? (
                    <span>Пока без значимых событий.</span>
                  ) : (
                    district.recentEvents.map(event => (
                      <div key={event.id} className={styles.eventItem}>
                        <span>{event.text}</span>
                        <span className={styles.eventDay}>день {event.day}</span>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CityBoardModal;
