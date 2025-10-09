import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { FACTIONS, factionMap } from '../../assets/factions/factions';
import { GameStateStore } from '../../entities/GameState/GameStateStore';

import styles from './FactionPanel.module.css';

type FactionPanelProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export const FactionPanel = observer(({ isOpen, onClose }: FactionPanelProps) => {
  const gameStateStore = useMemo(() => container.resolve(GameStateStore), []);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span>Фракции и отношения</span>
          {onClose && (
            <button type="button" className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <div className={styles.factionList}>
          {FACTIONS.map((faction) => {
            const reputation = gameStateStore.getFactionReputation(faction.id);

            return (
              <article key={faction.id} className={styles.factionCard}>
                <h3 className={styles.factionName}>{faction.name}</h3>
                <p className={styles.factionDescription}>{faction.description}</p>
                <div className={styles.metrics}>
                  <div>
                    Репутация:
                    {' '}
                    <strong>{reputation}</strong>
                  </div>
                  <div>
                    Минимум для контрактов:
                    {' '}
                    <strong>{faction.minReputation}</strong>
                  </div>
                  <div>
                    Изменение при успехе:
                    {' '}
                    <strong>{faction.successRepDelta >= 0 ? `+${faction.successRepDelta}` : faction.successRepDelta}</strong>
                    {' '}
                    и heat
                    {' '}
                    {faction.successHeatDelta ?? 0}
                  </div>
                  <div>
                    Изменение при провале:
                    {' '}
                    <strong>{faction.failureRepDelta}</strong>
                    {' '}
                    и heat
                    {' '}
                    {faction.failureHeatDelta ?? 0}
                  </div>
                </div>
                <div className={styles.tags}>
                  <span className={styles.tag}>{faction.illegal ? 'Нелегальная сеть' : 'Официальная структура'}</span>
                  {faction.heatWeightPenalty && (
                    <span className={styles.tag}>Чувствительность к heat</span>
                  )}
                  {faction.heatWeightBonus && (
                    <span className={styles.tag}>Любят рискованнные дела</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
});
