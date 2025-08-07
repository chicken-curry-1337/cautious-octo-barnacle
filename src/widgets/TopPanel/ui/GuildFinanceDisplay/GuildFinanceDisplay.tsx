import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GuildFinanceStore } from '../../../../entities/Finance/Finance.store';

import styles from './GuildFinanceDisplay.module.css';

const GuildFinanceDisplay = observer(() => {
  const financeStore = useMemo(() => container.resolve(GuildFinanceStore), []);

  return (
    <div className={styles.guildFinanceDisplay}>
      <div>
        💰 Золото:
        {' '}
        <span>{financeStore.gold}</span>
      </div>

      {Object.entries(financeStore.resources).map(([resource, amount]) => (
        <div key={resource}>
          {resource === 'wood' && <div>🪵</div>}
          {resource === 'iron' && <div>🪓</div>}
          {resource === 'herbs' && <div>🌿</div>}
          {resource.charAt(0).toUpperCase() + resource.slice(1)}
          :
          {' '}
          <span>{amount}</span>
        </div>
      ))}
    </div>
  );
});

export default GuildFinanceDisplay;
