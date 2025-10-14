import { useMemo, useState } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { DialogueStore } from '../../entities/Dialogue/Dialogue.store';
import { GuildFinanceStore } from '../../entities/Finance/Finance.store';
import { UpgradeStore } from '../../entities/Upgrade/Upgrade.store';
import { GUILD_RESOURCES } from '../../assets/resources/resources';
import { describeUpgradeEffects } from '../../assets/upgrades/upgrades';
import { FACILITY_BY_ID } from './facilityConfig';

import styles from './FacilityModal.module.css';

type FacilityModalProps = {
  facilityId: string | null;
  onClose?: () => void;
};

export const FacilityModal = observer(({ facilityId, onClose }: FacilityModalProps) => {
  const upgradeStore = useMemo(() => container.resolve(UpgradeStore), []);
  const financeStore = useMemo(() => container.resolve(GuildFinanceStore), []);
  const dialogueStore = useMemo(() => container.resolve(DialogueStore), []);
  const resourceMap = useMemo(() => {
    return GUILD_RESOURCES.reduce<Record<string, (typeof GUILD_RESOURCES)[number]>>((acc, resource) => {
      acc[resource.id] = resource;

      return acc;
    }, {});
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!facilityId) return null;

  const facility = FACILITY_BY_ID[facilityId];

  if (!facility) return null;

  const unlockUpgrade = facility.unlockUpgradeId
    ? upgradeStore.upgradeMap[facility.unlockUpgradeId]
    : null;
  const isUnlocked = facility.defaultOpen || Boolean(unlockUpgrade?.done);

  if (!isUnlocked) {
    return null;
  }

  const upgradeOptions = facility.upgradeIds
    .map(upgradeId => upgradeStore.upgradeMap[upgradeId])
    .filter((upgrade): upgrade is UpgradeStore['upgradeMap'][string] => Boolean(upgrade));

  const handleClose = () => {
    setError(null);
    setNotice(null);
    onClose?.();
  };

  const handleTalk = () => {
    if (!facility.dialogue) return;
    dialogueStore.startDialogue(facility.dialogue);
    handleClose();
  };

  const handleUpgrade = (upgradeId: string) => {
    const success = upgradeStore.completeUpgrade(upgradeId);

    if (success) {
      setNotice('Улучшение запущено и будет готово к следующему дню.');
      setError(null);
    } else {
      setError('Недостаточно ресурсов или не выполнены требования.');
      setNotice(null);
    }
  };

  const renderCostRow = (upgrade: UpgradeStore['upgradeMap'][string]) => {
    const entries = upgrade.resourceCost ? Object.entries(upgrade.resourceCost) : [];

    return (
      <div className={styles.costRow}>
        <span>
          💰
          {' '}
          {upgrade.cost}
          {' '}
          золота
        </span>
        {entries.map(([resourceId, amount]) => {
          const resource = resourceMap[resourceId];
          const current = financeStore.resources[resourceId] ?? 0;
          const enough = current >= amount;

          if (!resource) return null;

          return (
            <span
              key={`${upgrade.id}-${resourceId}`}
              className={clsx(styles.resourceTag, { [styles.insufficient]: !enough })}
            >
              <span>{resource.icon}</span>
              <span>{resource.name}</span>
              <span>
                {current}
                /
                {amount}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>{facility.title}</div>
          <button type="button" className={styles.closeButton} onClick={handleClose} aria-label="Закрыть помещение">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.caretakerCard}>
            <div className={styles.portrait}>
              {facility.caretaker.portrait ? (
                <img src={facility.caretaker.portrait} alt={facility.caretaker.name} />
              ) : (
                <span>👥</span>
              )}
            </div>
            <div className={styles.caretakerInfo}>
              <div className={styles.caretakerName}>{facility.caretaker.name}</div>
              <div className={styles.caretakerRole}>{facility.caretaker.role}</div>
              <div className={styles.greeting}>{facility.caretaker.greeting}</div>
            </div>
          </div>

          <div>
            <p className={styles.description}>{facility.description}</p>
            {facility.ambientNotes && facility.ambientNotes.length > 0 && (
              <ul className={styles.ambientList}>
                {facility.ambientNotes.map((note, index) => (
                  <li key={`${facilityId}-ambient-${index}`}>{note}</li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.actions}>
            {facility.dialogue && (
              <button type="button" className={styles.primaryButton} onClick={handleTalk}>
                Поговорить с заведующим
              </button>
            )}
            <button type="button" className={styles.secondaryButton} onClick={handleClose}>
              Закрыть
            </button>
          </div>

          {notice && <div className={clsx(styles.messages, styles.notice)}>{notice}</div>}
          {error && <div className={clsx(styles.messages, styles.error)}>{error}</div>}

          {upgradeOptions.length > 0 && (
            <div>
              <div className={styles.sectionTitle}>Доступные улучшения помещения</div>
              <div className={styles.upgradeList}>
                {upgradeOptions.map((upgrade) => {
                  const isCompleted = upgrade.done;
                  const canPurchase = upgradeStore.canPurchase(upgrade.id);
                  const isAvailable = upgradeStore.isAvailable(upgrade.id);

                  const effectDescriptions = describeUpgradeEffects(upgrade);

                  return (
                    <article key={upgrade.id} className={styles.upgradeCard}>
                      <div className={styles.upgradeHeader}>
                        <div className={styles.upgradeTitle}>{upgrade.name}</div>
                        <span
                          className={clsx(styles.upgradeStatus, {
                            [styles.upgradeStatusReady]: isAvailable && !isCompleted,
                          })}
                        >
                          {isCompleted ? 'Выполнено' : isAvailable ? 'Готово к строительству' : 'Недоступно'}
                        </span>
                      </div>
                      {effectDescriptions.length > 0 && (
                        <ul className={styles.ambientList}>
                          {effectDescriptions.map((desc, idx) => (
                            <li key={`${upgrade.id}-effect-${idx}`}>{desc}</li>
                          ))}
                        </ul>
                      )}
                      {renderCostRow(upgrade)}
                      {!isCompleted && (
                        <button
                          type="button"
                          className={clsx(styles.primaryButton)}
                          onClick={() => handleUpgrade(upgrade.id)}
                          disabled={!canPurchase}
                        >
                          {canPurchase ? 'Улучшить' : 'Требуются ресурсы'}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
