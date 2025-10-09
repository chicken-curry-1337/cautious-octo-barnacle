import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GUILD_RESOURCES } from '../../../../assets/resources/resources';
import { GuildFinanceStore } from '../../../../entities/Finance/Finance.store';

import styles from './GuildFinanceDisplay.module.css';

type GuildFinanceDisplayProps = {
  showDetails: boolean;
};

const GuildFinanceDisplay = observer(({ showDetails }: GuildFinanceDisplayProps) => {
  const financeStore = useMemo(() => container.resolve(GuildFinanceStore), []);
  const resourceMap = useMemo(() => {
    return GUILD_RESOURCES.reduce<Record<string, (typeof GUILD_RESOURCES)[number]>>((acc, resource) => {
      acc[resource.id] = resource;

      return acc;
    }, {});
  }, []);

  return (
    <div className={styles.guildFinanceDisplay}>
      <div>
        💰 Золото:
        {' '}
        <span>{financeStore.gold}</span>
      </div>

      {showDetails && (
        <div className={styles.resources}>
          {Object.entries(financeStore.resources).map(([resourceId, amount]) => {
            const definition = resourceMap[resourceId];
            if (!definition) return null;

            return (
              <div key={resourceId} className={styles.resourceItem} title={definition.description}>
                <span className={styles.resourceIcon}>{definition.icon}</span>
                <span className={styles.resourceName}>{definition.name}</span>
                <span className={styles.resourceAmount}>{amount}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default GuildFinanceDisplay;
