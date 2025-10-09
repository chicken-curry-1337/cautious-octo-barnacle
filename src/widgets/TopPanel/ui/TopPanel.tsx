import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GameStateStore } from '../../../entities/GameState/GameStateStore';
import GuildFinanceDisplay from './GuildFinanceDisplay/GuildFinanceDisplay';
import styles from './TopPanel.module.css';

type TopPanelProps = {
  onToggleUpgrades?: () => void;
  showUpgrades?: boolean;
  onToggleInventory?: () => void;
  showInventory?: boolean;
};

export const TopPanel = observer(({ onToggleUpgrades, showUpgrades = false, onToggleInventory, showInventory = false }: TopPanelProps) => {
  const gameStateStore = useMemo(() => container.resolve(GameStateStore), []);

  return (
    <div className={styles.topPanel}>
      {onToggleInventory && (
        <button
          type="button"
          className={styles.inventoryButton}
          onClick={onToggleInventory}
        >
          {showInventory ? 'Скрыть инвентарь' : 'Инвентарь'}
        </button>
      )}
      {onToggleUpgrades && (
        <button
          type="button"
          className={styles.upgradesButton}
          onClick={onToggleUpgrades}
        >
          {showUpgrades ? 'Скрыть апгрейды' : 'Апгрейды'}
        </button>
      )}
      <GuildFinanceDisplay showDetails={false} />
      {gameStateStore.activeStatuses.length > 0 && (
        <div className={styles.statuses}>
          {gameStateStore.activeStatuses.map(status => (
            <span
              key={status.id}
              className={styles.statusBadge}
              title={`${status.source.name}\n${status.source.description}\nОсталось дней: ${status.remainingDays}`}
            >
              {status.source.icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
