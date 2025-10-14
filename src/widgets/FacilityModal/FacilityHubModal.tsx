import { useMemo } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { UpgradeStore } from '../../entities/Upgrade/Upgrade.store';
import { FACILITY_DEFINITIONS } from './facilityConfig';

import styles from './FacilityHubModal.module.css';

type FacilityHubModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  onOpenFacility?: (upgradeId: string) => void;
};

export const FacilityHubModal = observer(({ isOpen, onClose, onOpenFacility }: FacilityHubModalProps) => {
  const upgradeStore = useMemo(() => container.resolve(UpgradeStore), []);

  if (!isOpen) return null;

  const facilities = FACILITY_DEFINITIONS.map((facility) => {
    const unlockUpgrade = facility.unlockUpgradeId
      ? upgradeStore.upgradeMap[facility.unlockUpgradeId]
      : undefined;
    const opened = facility.defaultOpen || Boolean(unlockUpgrade?.done);
    const available = !opened && unlockUpgrade ? upgradeStore.isAvailable(unlockUpgrade.id) : false;

    return {
      facility,
      unlockUpgrade,
      opened,
      available,
    };
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>Помещения гильдии</div>
          {onClose && (
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Закрыть список помещений">
              ×
            </button>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            {facilities.map(({ facility, unlockUpgrade, opened, available }) => (
              <article
                key={facility.id}
                className={clsx(styles.card, { [styles.cardOpen]: opened })}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.name}>{facility.title}</div>
                  <span
                    className={clsx(styles.status, {
                      [styles.statusOpen]: opened,
                      [styles.statusAvailable]: available,
                    })}
                  >
                    {opened ? 'Открыто'
                      : available ? 'Можно построить'
                        : 'Не построено'}
                  </span>
                </div>
                <div className={styles.description}>{facility.description}</div>
                <div className={styles.caretaker}>
                  Заведение: {facility.caretaker.name} — {facility.caretaker.role}
                </div>
                {facility.ambientNotes && facility.ambientNotes.length > 0 && (
                  <ul className={styles.notes}>
                    {facility.ambientNotes.slice(0, 2).map((note, index) => (
                      <li key={`${facility.upgradeId}-note-${index}`}>{note}</li>
                    ))}
                  </ul>
                )}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => onOpenFacility?.(facility.id)}
                    disabled={!opened}
                  >
                    {opened ? 'Войти' : 'Заблокировано'}
                  </button>
                </div>
                {!opened && unlockUpgrade && (
                  <div className={styles.hint}>
                    Постройте улучшение «{unlockUpgrade.name}» в разделе апгрейдов, чтобы открыть помещение.
                  </div>
                )}
                {!opened && !unlockUpgrade && (
                  <div className={styles.hint}>
                    Помещение будет доступно автоматически в ходе истории.
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
