import { useMemo, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GameStateStore } from '../../../entities/GameState/GameStateStore';
import { SaveStore } from '../../../features/Save/SaveStore';

import GuildFinanceDisplay from './GuildFinanceDisplay/GuildFinanceDisplay';
import styles from './TopPanel.module.css';

type TopPanelProps = {
  onToggleUpgrades?: () => void;
  showUpgrades?: boolean;
  onToggleInventory?: () => void;
  onToggleFactions?: () => void;
  showInventory?: boolean;
  showFactions?: boolean;
};

export const TopPanel = observer(({
  onToggleUpgrades,
  showUpgrades = false,
  onToggleInventory,
  showInventory = false,
  onToggleFactions,
  showFactions = false,
}: TopPanelProps) => {
  const gameStateStore = useMemo(() => container.resolve(GameStateStore), []);
  const saveStore = useMemo(() => container.resolve(SaveStore), []);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return undefined;

    const timeout = window.setTimeout(() => setMessage(null), 2500);

    return () => window.clearTimeout(timeout);
  }, [message]);

  const handleSave = () => {
    const ok = saveStore.saveGame();
    setMessage(ok ? 'Сохранение выполнено' : 'Ошибка сохранения');
  };

  const handleLoad = () => {
    const ok = saveStore.loadGame();
    setMessage(ok ? 'Загрузка выполнена' : 'Нет сохранения');
  };

  const formatTimestamp = (ts: number | null) => {
    if (!ts) return 'нет сохранения';

    return new Date(ts).toLocaleString('ru-RU');
  };

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
      {onToggleFactions && (
        <button
          type="button"
          className={styles.factionsButton}
          onClick={onToggleFactions}
        >
          {showFactions ? 'Скрыть фракции' : 'Фракции'}
        </button>
      )}
      <GuildFinanceDisplay showDetails={false} />
      <button
        type="button"
        className={styles.saveButton}
        onClick={handleSave}
      >
        Сохранить
      </button>
      <button
        type="button"
        className={styles.loadButton}
        onClick={handleLoad}
      >
        Загрузить
      </button>
      <div className={styles.saveInfo}>
        Последнее сохранение:
        {' '}
        <strong>{formatTimestamp(saveStore.lastSavedAt)}</strong>
        {saveStore.lastLoadedAt && (
          <span>
            {' '}
            (загружено:
            {' '}
            {formatTimestamp(saveStore.lastLoadedAt)}
            )
          </span>
        )}
        {message && (
          <span className={styles.saveMessage}>{message}</span>
        )}
      </div>
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
