import { useEffect, useState } from 'react';

import styles from './Notification.module.css';

type Notification = {
  id: number;
  message: string;
};

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Для теста
  useEffect(() => {
    addNotification('Герой уже занят другим квестом.');
  }, []);

  return (
    <div className={styles.container}>
      {notifications.map(n => (
        <div key={n.id} className={`${styles.notification} ${styles.fadeIn}`}>
          <div className={styles.icon}>⚔️</div>
          <div className={styles.message}>{n.message}</div>
          <button
            onClick={() => removeNotification(n.id)}
            className={styles.closeButton}
            aria-label="Закрыть уведомление"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
