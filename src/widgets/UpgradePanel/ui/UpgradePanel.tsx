import { useEffect, useMemo } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { UpgradeStore } from '../../../entities/Upgrade/Upgrade.store';

import styles from './UpgradePanel.module.css';

export const UpgradePanel = observer(() => {
  const { upgrades, completeUpgrade, isAvailable, getAllRequires } = useMemo(() => container.resolve(UpgradeStore), []);

  useEffect(() => {
    console.log(upgrades);
  }, [upgrades]);

  const handleUpgradeDone = (id: string) => {
    completeUpgrade(id);
  };

  return (
    <div className={styles.upgradePanel}>
      <div className={styles.upgradePanelHeader}>Апгрейды</div>
      {upgrades.map(upgrade => (
        <article
          className={clsx(styles.upgradeItem, {
            [styles.upgradeItemNonavailable]: !isAvailable(upgrade.id),
          })}
          key={upgrade.id}
        >
          <img src={upgrade.icon} alt="image not found" className={styles.upgradeItemIcon} />
          <div className={styles.upgradeItemTitle}>{upgrade.name}</div>
          {!upgrade.done && (
            <>
              {!!upgrade.requires.length && (
                <>
                  <div className={styles.upgradeItemRequireTitle}>Требуется:</div>
                  {getAllRequires(upgrade.id).map(requiredUpgrade =>
                    (<div className={styles.upgradeItemRequireTitle} key={requiredUpgrade.id}>{requiredUpgrade.name}</div>),
                  )}
                </>
              )}
              {isAvailable(upgrade.id) && <button onClick={() => handleUpgradeDone(upgrade.id)}>Создать</button>}
            </>
          )}
        </article>
      ))}
    </div>
  );
});
