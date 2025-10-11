import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { FACTIONS, type FactionId } from '../../assets/factions/factions';
import { DialogueStore } from '../../entities/Dialogue/Dialogue.store';
import { GameStateStore } from '../../entities/GameState/GameStateStore';
import { questChainsConfig, type QuestChainDefinition } from '../../features/QuestChains/QuestChains.store';

import styles from './FactionPanel.module.css';

type FactionPanelProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export const FactionPanel = observer(({ isOpen, onClose }: FactionPanelProps) => {
  const gameStateStore = useMemo(() => container.resolve(GameStateStore), []);
  const dialogueStore = useMemo(() => container.resolve(DialogueStore), []);
  const chainsByFaction = useMemo(() => {
    return Object.values(questChainsConfig).reduce<Partial<Record<FactionId, QuestChainDefinition>>>((acc, chain) => {
      acc[chain.factionId] = chain;

      return acc;
    }, {});
  }, []);

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
            const leaderChain = chainsByFaction[faction.id];
            const leaderUnlocked = gameStateStore.isFactionLeaderUnlocked(faction.id);

            return (
              <article key={faction.id} className={styles.factionCard}>
                <h3 className={styles.factionName}>{faction.name}</h3>
                <p className={styles.factionDescription}>{faction.description}</p>
                <div className={styles.metrics}>
                  <div>
                    Текущая репутация:
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
                {leaderChain && leaderUnlocked && (
                  <div className={styles.leaderSection}>
                    <div className={styles.leaderPortraitWrapper}>
                      <img
                        src={leaderChain.leaderPortraitUrl}
                        alt={leaderChain.leaderName}
                        className={styles.leaderPortrait}
                      />
                    </div>
                    <div className={styles.leaderInfo}>
                      <div className={styles.leaderName}>{leaderChain.leaderName}</div>
                      <div className={styles.leaderTitle}>{leaderChain.leaderTitle}</div>
                      <button
                        type="button"
                        className={styles.leaderButton}
                        onClick={() => {
                          dialogueStore.startDialogue(
                            leaderChain.leaderDialogue,
                            leaderChain.leaderDialogueStartId ?? 'start',
                          );
                          onClose?.();
                        }}
                      >
                        Связаться с лидером
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
});
