import { useMemo, useState } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GUILD_RESOURCES } from '../../../assets/resources/resources';
import { describeUpgradeEffects } from '../../../assets/upgrades/upgrades';
import { GuildFinanceStore } from '../../../entities/Finance/Finance.store';
import { UpgradeStore } from '../../../entities/Upgrade/Upgrade.store';

import styles from './UpgradePanel.module.css';

type UpgradePanelProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export const UpgradePanel = observer(({ isOpen, onClose }: UpgradePanelProps) => {
  const upgradeStore = useMemo(() => container.resolve(UpgradeStore), []);
  const financeStore = useMemo(() => container.resolve(GuildFinanceStore), []);
  const resourceMap = useMemo(() => {
    return GUILD_RESOURCES.reduce<Record<string, (typeof GUILD_RESOURCES)[number]>>((acc, resource) => {
      acc[resource.id] = resource;

      return acc;
    }, {});
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgradeDone = (id: string) => {
    const success = upgradeStore.completeUpgrade(id);

    if (!success) {
      setError('Недостаточно золота или ресурсов.');
      setNotice(null);
    } else {
      setError(null);
      setNotice('Улучшение завершено.');
    }
  };

  const handleTakeLoan = () => {
    const success = upgradeStore.requestEmergencyLoan();

    if (success) {
      setNotice('Экстренный займ получен. Не забудьте погасить долг!');
      setError(null);
    } else {
      setError('Займ уже был взят или недоступен.');
      setNotice(null);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.upgradePanel}>
        <div className={styles.upgradePanelHeader}>
          <span>Апгрейды</span>
          {onClose && (
            <button type="button" className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          )}
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.notice}>{notice}</div>}
        <div className={styles.upgradePanelContent}>
          {upgradeStore.upgrades.map((upgrade) => {
            const isUnlocked = upgradeStore.isAvailable(upgrade.id);
            const canAfford = upgradeStore.canPurchase(upgrade.id);
            const resourceCostEntries = upgrade.resourceCost ? Object.entries(upgrade.resourceCost) : [];
            const effectDescriptions = describeUpgradeEffects(upgrade);
            const canTakeLoan = Boolean(upgrade.effects.emergency_loan)
              && upgrade.done
              && !financeStore.emergencyLoanTaken;

            return (
              <article
                className={clsx(styles.upgradeItem, {
                  [styles.upgradeItemNonavailable]: !isUnlocked,
                })}
                key={upgrade.id}
              >
                <img src={upgrade.icon} alt="image not found" className={styles.upgradeItemIcon} />
                <div className={styles.upgradeItemTitle}>{upgrade.name}</div>
                {effectDescriptions.length > 0 && (
                  <ul className={styles.effectList}>
                    {effectDescriptions.map((desc, index) => (
                      <li key={`${upgrade.id}-effect-${index}`}>{desc}</li>
                    ))}
                  </ul>
                )}
                {!upgrade.done && (
                  <>
                    {!!upgrade.requires.length && (
                      <>
                        <div className={styles.upgradeItemRequireTitle}>Требуется:</div>
                        {upgradeStore.getAllRequires(upgrade.id).map(requiredUpgrade =>
                          (<div className={styles.upgradeItemRequireTitle} key={requiredUpgrade.id}>{requiredUpgrade.name}</div>),
                        )}
                      </>
                    )}
                    <div className={styles.upgradeCosts}>
                      <div className={styles.upgradeCostRow}>
                        <span className={styles.goldLabel}>💰 Золото:</span>
                        <span className={styles.goldValue}>{upgrade.cost}</span>
                        <span className={styles.goldAvailable}>
                          (доступно:
                          {' '}
                          {financeStore.gold}
                          )
                        </span>
                      </div>
                      {resourceCostEntries.length > 0 && (
                        <div className={styles.resourceCostList}>
                          {resourceCostEntries.map(([resourceId, amount]) => {
                            const resource = resourceMap[resourceId];
                            if (!resource) return null;
                            const currentAmount = financeStore.resources[resourceId] ?? 0;
                            const enough = currentAmount >= amount;

                            return (
                              <div
                                key={`${upgrade.id}-${resourceId}`}
                                className={clsx(styles.resourceCostItem, {
                                  [styles.resourceCostItemInsufficient]: !enough,
                                })}
                              >
                                <span className={styles.resourceIcon}>{resource.icon}</span>
                                <span className={styles.resourceName}>{resource.name}</span>
                                <span className={styles.resourceValue}>
                                  {amount}
                                  {' '}
                                  / доступно:
                                  {' '}
                                  {currentAmount}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {isUnlocked && (
                      <button
                        onClick={() => handleUpgradeDone(upgrade.id)}
                        disabled={!canAfford}
                        className={clsx(styles.createButton, {
                          [styles.createButtonDisabled]: !canAfford,
                        })}
                      >
                        {canAfford ? 'Создать' : 'Недостаточно ресурсов'}
                      </button>
                    )}
                  </>
                )}
                {upgrade.done && canTakeLoan && (
                  <button type="button" className={styles.loanButton} onClick={handleTakeLoan}>
                    Получить экстренный займ
                  </button>
                )}
                {upgrade.done && upgrade.effects.emergency_loan && financeStore.emergencyLoanTaken && (
                  <div className={styles.loanInfo}>
                    Займ активен. Текущий долг:
                    {financeStore.loanBalance}
                    {' '}
                    золота.
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
