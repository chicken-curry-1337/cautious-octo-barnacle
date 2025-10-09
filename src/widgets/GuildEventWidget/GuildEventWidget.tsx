import { useMemo, useState } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { GUILD_RESOURCES } from '../../assets/resources/resources';
import { GuildEventStore } from '../../entities/Event/GuildEventStore';

import styles from './GuildEventWidget.module.css';

export const GuildEventWidget = observer(() => {
  const eventStore = useMemo(() => container.resolve(GuildEventStore), []);
  const [error, setError] = useState<string | null>(null);

  const resourceMap = useMemo(() => {
    return GUILD_RESOURCES.reduce<Record<string, (typeof GUILD_RESOURCES)[number]>>((acc, resource) => {
      acc[resource.id] = resource;

      return acc;
    }, {});
  }, []);

  const event = eventStore.currentEvent;
  if (!event) return null;

  const handleOptionClick = (optionId: string) => {
    const success = eventStore.resolveEvent(optionId);

    if (!success) {
      setError('Недостаточно ресурсов.');

      return;
    }

    setError(null);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.options}>
          {event.options.map((option) => {
            const resourceCostEntries = option.resourceCost ? Object.entries(option.resourceCost) : [];
            const resourceRewardEntries = option.resourceReward ? Object.entries(option.resourceReward) : [];
            const disabled = !eventStore.canResolveOption(option.id);

            return (
              <button
                key={option.id}
                className={clsx(styles.optionButton, {
                  [styles.optionButtonDisabled]: disabled,
                })}
                onClick={() => handleOptionClick(option.id)}
                disabled={disabled}
              >
                <div className={styles.optionLabel}>{option.label}</div>
                {option.description && <p className={styles.optionDescription}>{option.description}</p>}
                {resourceCostEntries.length > 0 && (
                  <div className={styles.costSection}>
                    <span>Стоимость:</span>
                    <div className={styles.resourceList}>
                      {resourceCostEntries.map(([resourceId, amount]) => {
                        const resource = resourceMap[resourceId];
                        if (!resource) return null;

                        return (
                          <span key={`${option.id}-cost-${resourceId}`} className={styles.resourceTag}>
                            {resource.icon}
                            {' '}
                            {resource.name}
                            {' '}
                            <strong>
                              -
                              {amount}
                            </strong>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {resourceRewardEntries.length > 0 && (
                  <div className={styles.rewardSection}>
                    <span>Награды:</span>
                    <div className={styles.resourceList}>
                      {resourceRewardEntries.map(([resourceId, amount]) => {
                        const resource = resourceMap[resourceId];
                        if (!resource) return null;

                        return (
                          <span key={`${option.id}-reward-${resourceId}`} className={styles.resourceTag}>
                            {resource.icon}
                            {' '}
                            {resource.name}
                            {' '}
                            <strong>
                              +
                              {amount}
                            </strong>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
