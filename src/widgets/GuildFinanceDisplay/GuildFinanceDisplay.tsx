import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GuildFinanceStore } from '../../entities/Finance/Finance.store';

import styles from './GuildFinanceDisplay.module.css';

const GuildFinanceDisplay = observer(() => {
  const financeStore = useMemo(() => container.resolve(GuildFinanceStore), []);

  return (
    <div className={styles['guild-finance-display']}>
      <p>
        💰 Золото:
        {' '}
        <span>{financeStore.gold}</span>
      </p>

      {Object.entries(financeStore.resources).map(([resource, amount]) => (
        <p key={resource}>
          {resource === 'wood' && '🪵'}
          {resource === 'iron' && '🪓'}
          {resource === 'herbs' && '🌿'}
          {resource.charAt(0).toUpperCase() + resource.slice(1)}
          :
          {' '}
          <span>{amount}</span>
        </p>
      ))}
    </div>
  );
});

export default GuildFinanceDisplay;
