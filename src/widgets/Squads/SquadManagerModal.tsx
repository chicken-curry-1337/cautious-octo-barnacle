import { useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { traitMap } from '../../assets/traits/traits';
import { HeroesStore } from '../../features/Heroes/Heroes.store';
import { QuestsStore } from '../../features/Quests/Quests.store';
import { SquadsStore } from '../../features/Squads/Squads.store';

import styles from './SquadManagerModal.module.css';

type SquadManagerModalProps = {
  isOpen: boolean;
  onClose?: () => void;
};

const SquadManagerModal = observer(({ isOpen, onClose }: SquadManagerModalProps) => {
  const squadsStore = useMemo(() => container.resolve(SquadsStore), []);
  const heroesStore = useMemo(() => container.resolve(HeroesStore), []);
  const questsStore = useMemo(() => container.resolve(QuestsStore), []);
  const [editingSquadId, setEditingSquadId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formHeroIds, setFormHeroIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const formSynergyKey = formHeroIds.slice().sort().join('|');
  const formSynergy = useMemo(() => {
    return questsStore.getPartySynergySummary(formHeroIds);
  }, [questsStore, formSynergyKey]);

  useEffect(() => {
    if (!editingSquadId) return;
    const squad = squadsStore.getSquad(editingSquadId);
    if (!squad) return;

    setFormName(squad.name);
    setFormHeroIds([...squad.heroIds]);
  }, [editingSquadId, squadsStore]);

  useEffect(() => {
    if (!isOpen) {
      setEditingSquadId(null);
      setFormName('');
      setFormHeroIds([]);
      setError(null);
      setNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const heroes = heroesStore.heroes;
  const heroMap = Object.fromEntries(heroes.map(hero => [hero.id, hero]));

  const startCreate = () => {
    setEditingSquadId('new');
    setFormName(`Отряд ${squadsStore.squads.length + 1}`);
    setFormHeroIds([]);
    setError(null);
    setNotice(null);
  };

  const cancelEdit = () => {
    setEditingSquadId(null);
    setFormName('');
    setFormHeroIds([]);
    setError(null);
  };

  const toggleHero = (heroId: string) => {
    setError(null);
    setNotice(null);
    setFormHeroIds((prev) => {
      if (prev.includes(heroId)) {
        return prev.filter(id => id !== heroId);
      }

      if (prev.length >= squadsStore.maxSquadSize) {
        setError(`В отряде может быть максимум ${squadsStore.maxSquadSize} героев.`);

        return prev;
      }

      return [...prev, heroId];
    });
  };

  const handleSave = () => {
    try {
      let message: string | null = null;

      if (editingSquadId === 'new') {
        squadsStore.createSquad(formName, formHeroIds);
        message = 'Отряд создан.';
      } else if (editingSquadId) {
        squadsStore.updateSquad(editingSquadId, { name: formName, heroIds: formHeroIds });
        message = 'Отряд обновлён.';
      }

      cancelEdit();

      if (message) {
        setNotice(message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить отряд.');
    }
  };

  const handleDisband = (squadId: string) => {
    squadsStore.disbandSquad(squadId);

    if (editingSquadId === squadId) {
      cancelEdit();
    }
    setNotice('Отряд расформирован.');
  };

  const isEditing = editingSquadId !== null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>Управление отрядами</div>
          {onClose && (
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Закрыть окно отрядов">
              ×
            </button>
          )}
        </div>

        <div className={styles.body}>
          <button type="button" className={styles.createButton} onClick={startCreate}>
            Создать новый отряд
          </button>

          {isEditing && (
            <div className={styles.form}>
              <div className={styles.inputRow}>
                <label htmlFor="squad-name">Название отряда</label>
                <input
                  id="squad-name"
                  className={styles.input}
                  value={formName}
                  maxLength={40}
                  onChange={event => setFormName(event.target.value)}
                />
              </div>

              <div className={styles.inputRow}>
                <span>
                  Состав (макс.
                  {' '}
                  {squadsStore.maxSquadSize}
                  )
                </span>
                <div className={styles.heroesList}>
                  {heroes.length === 0 && <span>Нет доступных героев.</span>}
                  {heroes.map((hero) => {
                    const inSquad = formHeroIds.includes(hero.id);
                    const unavailable = hero.assignedQuestId !== null || hero.injured;
                    const statusMessages: string[] = [];
                    if (hero.assignedQuestId) statusMessages.push('в задании');
                    if (hero.injured) statusMessages.push('ранен');

                    return (
                      <label key={hero.id} className={styles.heroRow}>
                        <input
                          type="checkbox"
                          checked={inSquad}
                          onChange={() => toggleHero(hero.id)}
                        />
                        <div className={styles.heroMeta}>
                          <span className={styles.heroName}>
                            {hero.name}
                            {' '}
                            (
                            {hero.type}
                            )
                          </span>
                          <span>
                            Уровень:
                            {' '}
                            {hero.level}
                            {' '}
                            | 💪
                            {hero.strength}
                            {' '}
                            | 🎯
                            {hero.agility}
                            {' '}
                            | 🧠
                            {hero.intelligence}
                          </span>
                          {statusMessages.length > 0 && (
                            <span className={styles.heroStatus}>{statusMessages.join(', ')}</span>
                          )}
                          {(hero.traits?.length ?? 0) > 0 && (
                            <div className={styles.heroTraits}>
                              {hero.traits
                                .map(traitId => traitMap[traitId])
                                .filter(Boolean)
                                .map(trait => (
                                  <span
                                    key={`${hero.id}-${trait.id}`}
                                    className={clsx(
                                      styles.heroTrait,
                                      trait.rarity === 'rare' && styles.heroTraitRare,
                                      trait.rarity === 'unique' && styles.heroTraitUnique,
                                    )}
                                  >
                                    <span className={styles.heroTraitName}>{trait.name}</span>
                                    <span className={styles.heroTraitDesc}>{trait.description}</span>
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                <span className={styles.limitHint}>
                  {formHeroIds.length}
                  {' '}
                  из
                  {' '}
                  {squadsStore.maxSquadSize}
                </span>
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.primaryButton} onClick={handleSave}>
                  Сохранить
                </button>
                <button type="button" className={styles.secondaryButton} onClick={cancelEdit}>
                  Отмена
                </button>
              </div>
              <div className={styles.formSynergy}>
                Бонус к успеху:
                {' '}
                {formSynergy.successBonus >= 0 ? '+' : ''}
                {formSynergy.successBonus}
                %
                {' • '}
                Модификатор травм:
                {' '}
                ×
                {formSynergy.injuryMultiplier.toFixed(2)}
                {formSynergy.notes.length > 0 && (
                  <ul className={styles.formSynergyNotes}>
                    {formSynergy.notes.map(note => (
                      <li key={note.id}>{note.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {notice && <div className={clsx(styles.message, styles.notice)}>{notice}</div>}
          {error && <div className={clsx(styles.message, styles.error)}>{error}</div>}

          <div className={styles.squadList}>
            {squadsStore.squads.length === 0 && (
              <div className={styles.message}>
                У вас пока нет сохранённых отрядов. Создайте новый, чтобы быстро отправлять героев на задания.
              </div>
            )}
            {squadsStore.squads.map((squad) => {
              const members = squad.heroIds
                .map(id => heroMap[id])
                .filter(Boolean)
                .map(hero => `${hero.name} (${hero.type})`);
              const synergy = questsStore.getPartySynergySummary(squad.heroIds);

              return (
                <article key={squad.id} className={styles.squadCard}>
                  <div className={styles.squadHeader}>
                    <span className={styles.squadName}>{squad.name}</span>
                    <span>
                      {squad.heroIds.length}
                      {' '}
                      /
                      {' '}
                      {squadsStore.maxSquadSize}
                    </span>
                  </div>
                  <div className={styles.squadMembers}>
                    {members.length > 0 ? members.join(', ') : 'Нет участников'}
                  </div>
                  <div className={styles.squadSynergy}>
                    Бонус к успеху:
                    {' '}
                    {synergy.successBonus >= 0 ? '+' : ''}
                    {synergy.successBonus}
                    %
                    {' • '}
                    Травмы ×
                    {synergy.injuryMultiplier.toFixed(2)}
                  </div>
                  {synergy.notes.length > 0 && (
                    <ul className={styles.squadSynergyNotes}>
                      {synergy.notes.map(note => (
                        <li key={`${squad.id}-${note.id}`}>{note.text}</li>
                      ))}
                    </ul>
                  )}
                  <div className={styles.squadActions}>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => setEditingSquadId(squad.id)}
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => handleDisband(squad.id)}
                    >
                      Расформировать
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export default SquadManagerModal;
