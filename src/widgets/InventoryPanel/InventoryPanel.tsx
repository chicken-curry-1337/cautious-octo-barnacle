import { useMemo, useState } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GUILD_RESOURCES } from '../../assets/resources/resources';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';

import styles from './InventoryPanel.module.css';

type InventoryPanelProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export const InventoryPanel = observer(({ isOpen, onClose }: InventoryPanelProps) => {
  const financeStore = useMemo(() => container.resolve(GuildFinanceStore), []);
  const [openedResource, setOpenedResource] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span>Инвентарь гильдии</span>
          {onClose && (
            <button type="button" className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          )}
        </div>
        <div className={styles.resources}>
          {GUILD_RESOURCES.map((resource) => {
            const amount = financeStore.resources[resource.id] ?? 0;
            const isOpened = openedResource === resource.id;

            return (
              <div key={resource.id} className={styles.resourceCard}>
                <button
                  type="button"
                  className={clsx(styles.resourceButton, { [styles.resourceButtonOpened]: isOpened })}
                  onClick={() => setOpenedResource(prev => (prev === resource.id ? null : resource.id))}
                >
                  <span className={styles.resourceIcon}>{resource.icon}</span>
                  <div className={styles.resourceInfo}>
                    <span className={styles.resourceName}>{resource.name}</span>
                    <span className={styles.resourceAmount}>{amount}</span>
                  </div>
                  <span className={styles.resourceRarity}>{resource.rarity}</span>
                </button>
                {isOpened && (
                  <div className={styles.resourceDetails}>
                    <p>{resource.description}</p>
                    <div className={styles.resourceMeta}>
                      <span>
                        Категория:
                        {' '}
                        <strong>{resource.category}</strong>
                      </span>
                      {resource.startingAmount !== undefined && (
                        <span>
                          Стартовый запас:
                          {' '}
                          <strong>{resource.startingAmount}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
