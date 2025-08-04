import { useState, type ReactNode } from 'react';

import styles from './Tabs.module.css';

export type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  children: ReactNode[]; // ожидается, что порядок children соответствует порядку tabs
  defaultTab?: string;
};

const Tabs = ({ tabs, children, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0].id);

  return (
    <div className={styles.container}>
      <div className={styles.tabList}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${
              tab.id === activeTab ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {children[tabs.findIndex(tab => tab.id === activeTab)]}
      </div>
    </div>
  );
};

export default Tabs;
