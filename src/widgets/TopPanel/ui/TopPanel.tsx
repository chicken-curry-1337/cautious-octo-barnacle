import { observer } from 'mobx-react-lite';

import GuildFinanceDisplay from './GuildFinanceDisplay/GuildFinanceDisplay';
import styles from './TopPanel.module.css';

export const TopPanel = observer(() => {
  return (
    <div className={styles.topPanel}>
      <GuildFinanceDisplay />
    </div>
  );
});
