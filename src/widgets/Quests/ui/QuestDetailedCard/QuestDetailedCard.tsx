import React, { useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { factionMap, type FactionId } from '../../../../assets/factions/factions';
import { MAIN_HERO_ID } from '../../../../assets/heroes/mainHero';
import { modifiers as questModifiers } from '../../../../assets/modifiers/modifiers';
import { GUILD_RESOURCES } from '../../../../assets/resources/resources';
import type { GuildResource } from '../../../../assets/resources/resources';
import { CityStore } from '../../../../entities/City/City.store';
import { TimeStore } from '../../../../entities/TimeStore/TimeStore';
import { UpgradeStore } from '../../../../entities/Upgrade/Upgrade.store';
import { HeroesStore } from '../../../../features/Heroes/Heroes.store';
import { QuestsStore } from '../../../../features/Quests/Quests.store';
import { SquadsStore } from '../../../../features/Squads/Squads.store';
import type { IChar } from '../../../../shared/types/hero';
import { QuestStatus, type IQuest } from '../../../../shared/types/quest';

import styles from './QuestDetailedCard.module.css';

interface QuestDetailedCardProps {
  quest: IQuest;
  onAssign: (questId: string, heroIds: string[]) => void;
  onClose: () => void;
}

export const QuestDetailedCard: React.FC<QuestDetailedCardProps> = observer(
  ({ quest, onAssign, onClose }) => {
    const questStore = container.resolve(QuestsStore);
    const heroesStore = container.resolve(HeroesStore);
    const squadsStore = container.resolve(SquadsStore);
    const { absoluteDay } = container.resolve(TimeStore);
    const upgradeStore = container.resolve(UpgradeStore);
    const cityStore = container.resolve(CityStore);

    // heroes теперь из mobx state напрямую — компонент будет реактивно обновляться
    const { heroes, availableHeroes } = heroesStore;

    const [selectedHeroesIds, setSelectedHeroesIds] = useState<string[]>([]);
    const [openedModifierId, setOpenedModifierId] = useState<string | null>(null);
    const [squadMessage, setSquadMessage] = useState<{ type: 'error' | 'notice'; text: string } | null>(null);
    const resourceMap = useMemo(() => {
      return GUILD_RESOURCES.reduce<Record<string, GuildResource>>((acc, resource) => {
        acc[resource.id] = resource;

        return acc;
      }, {});
    }, []);

    const factionDetails = useMemo(() => {
      if (!quest.factionId) return null;
      const faction = factionMap[quest.factionId as FactionId];
      if (!faction) return null;

      return {
        name: faction.name,
        reputationRequirement: quest.reputationRequirement ?? faction.minReputation,
        successRepDelta: quest.successRepDelta ?? faction.successRepDelta,
        failureRepDelta: quest.failureRepDelta ?? faction.failureRepDelta,
        successHeatDelta: quest.successHeatDelta ?? faction.successHeatDelta ?? 0,
        failureHeatDelta: quest.failureHeatDelta ?? faction.failureHeatDelta ?? 0,
      };
    }, [quest.failureHeatDelta, quest.factionId, quest.reputationRequirement, quest.successHeatDelta]);

    const chainDetails = useMemo(() => {
      if (!quest.chainId) return null;

      const totalStages = quest.chainTotalStages ?? ((quest.chainStageIndex ?? 0) + 1);
      const currentStage = (quest.chainStageIndex ?? 0) + 1;

      return {
        leaderTitle: quest.chainLeaderTitle ?? 'Лидер фракции',
        leaderName: quest.chainLeaderName ?? 'Неизвестная наставница',
        totalStages,
        currentStage,
        unlocksLeader: quest.unlocksLeader ?? false,
        portrait: quest.chainLeaderPortrait ?? null,
      };
    }, [
      quest.chainId,
      quest.chainLeaderName,
      quest.chainLeaderTitle,
      quest.chainStageIndex,
      quest.chainTotalStages,
      quest.unlocksLeader,
      quest.chainLeaderPortrait,
    ]);

    const formatDelta = (value: number) => {
      if (value > 0) return `+${value}`;
      if (value < 0) return `${value}`;

      return '0';
    };

    const maxPartySize = questStore.maxPartySize;

    const toggleHero = (id: string) => {
      setSquadMessage(null);
      setSelectedHeroesIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter(h => h !== id);
        }

        if (prev.length >= maxPartySize) {
          return prev;
        }

        return [...prev, id];
      });
    };

    const assignedHeroes = quest.assignedHeroIds
      .map(id => heroes.find(h => h.id === id))
      .filter(Boolean) as IChar[];

    const totalStrength = assignedHeroes.reduce(
      (sum, h) => sum + h.strength,
      0,
    );
    const totalAgility = assignedHeroes.reduce((sum, h) => sum + h.agility, 0);
    const totalIntelligence = assignedHeroes.reduce(
      (sum, h) => sum + h.intelligence,
      0,
    );

    const deadlineDaysLeft = quest.deadlineAccept - absoluteDay;

    const status = useMemo(() => {
      if (quest.status === QuestStatus.NotStarted) return 'Ожидает';
      if (quest.status === QuestStatus.InProgress) return 'В процессе';
      if (quest.status === QuestStatus.FailedDeadline) return 'Просрочено';
      if (quest.status === QuestStatus.CompletedFail) return 'Неуспешно';

      return 'Выполнено';
    }, [quest.status]);

    const availableForQuestHeroes = availableHeroes.filter(
      h => !quest.assignedHeroIds.includes(h.id) && h.assignedQuestId === null,
    );

    const availableHeroIds = useMemo(
      () => new Set(availableForQuestHeroes.map(hero => hero.id)),
      [availableForQuestHeroes],
    );

    const questAllowsSquads = quest.status === QuestStatus.NotStarted && !quest.isStory;

    const squadEntries = useMemo(() => {
      return squadsStore.squads.map((squad) => {
        const members = squad.heroIds
          .map(id => heroes.find(hero => hero.id === id))
          .filter((hero): hero is IChar => Boolean(hero));
        const synergy = questStore.getPartySynergySummary(squad.heroIds);
        let reason: string | null = null;

        if (squad.heroIds.length === 0) {
          reason = 'Нет участников';
        } else if (!questAllowsSquads) {
          reason = quest.isStory
            ? 'Сюжетное задание требует ручного управления'
            : 'Задание уже в работе';
        } else {
          const unavailable = squad.heroIds.filter(id => !availableHeroIds.has(id));

          if (unavailable.length > 0) {
            reason = 'Не все герои доступны';
          } else if (quest.assignedHeroIds.length + members.length > maxPartySize) {
            reason = 'Превышен лимит отряда';
          }
        }

        const canAssign = reason === null;

        return {
          squad,
          members,
          synergy,
          canAssign,
          reason,
        };
      });
    }, [availableHeroIds, heroes, maxPartySize, quest.assignedHeroIds, questAllowsSquads, quest.isStory, questStore, squadsStore.squads]);

    useEffect(() => {
      if (!quest.chainId) return;
      if (quest.assignedHeroIds.includes(MAIN_HERO_ID)) return;

      const mainHeroAvailable = availableForQuestHeroes.some(hero => hero.id === MAIN_HERO_ID);
      if (!mainHeroAvailable) return;

      setSelectedHeroesIds((prev) => {
        if (prev.includes(MAIN_HERO_ID)) return prev;
        const updated = [MAIN_HERO_ID, ...prev.filter(id => id !== MAIN_HERO_ID)];

        if (updated.length > maxPartySize) {
          return updated.slice(0, maxPartySize);
        }

        return updated;
      });
    }, [availableForQuestHeroes, maxPartySize, quest.assignedHeroIds, quest.chainId]);

    useEffect(() => {
      setSelectedHeroesIds([]);
      setSquadMessage(null);
    }, [quest.id]);

    const successChance = useMemo(
      () => questStore.getNewQuestSuccessChance(quest.id, selectedHeroesIds),
      [questStore, quest.id, selectedHeroesIds],
    );

    // Функция для цвета прогресса по шансу успеха
    const getProgressColor = (percent: number) => {
      if (percent < 40) return '#e53935'; // красный
      if (percent < 70) return '#fbc02d'; // жёлтый

      return '#43a047'; // зелёный
    };

    const district = quest.districtId ? cityStore.getDistrictById(quest.districtId) : null;

    const rewardMultiplier = quest.isIllegal
      ? upgradeStore.getNumericEffectProduct('illegal_reward_mult')
      : upgradeStore.getNumericEffectProduct('legal_reward_mult');
    const expectedReward = Math.round(quest.reward * (rewardMultiplier || 1));
    const guildProfit = expectedReward;

    const modifiers = useMemo(() => {
      if (!quest.modifiers || quest.modifiers.length === 0) return [];

      return quest.modifiers
        .map(modifierId => questModifiers.find(modifier => modifier.id === modifierId))
        .filter((modifier): modifier is (typeof questModifiers)[number] => Boolean(modifier));
    }, [quest.modifiers]);

    const resourceRewards = useMemo(() => {
      if (!quest.resourceRewards) return [];

      return Object.entries(quest.resourceRewards)
        .map(([resourceId, amount]) => {
          const resource = resourceMap[resourceId];
          if (!resource || amount <= 0) return null;

          return { ...resource, amount };
        })
        .filter((resource): resource is GuildResource & { amount: number } => Boolean(resource));
    }, [quest.resourceRewards, resourceMap]);

    const requiredResources = useMemo(() => {
      if (!quest.requiredResources) return [];

      return Object.entries(quest.requiredResources)
        .map(([resourceId, amount]) => {
          const resource = resourceMap[resourceId];
          if (!resource || amount <= 0) return null;

          return { ...resource, amount };
        })
        .filter((resource): resource is GuildResource & { amount: number } => Boolean(resource));
    }, [quest.requiredResources, resourceMap]);

    const heroIdsForSynergy = quest.status === QuestStatus.NotStarted ? selectedHeroesIds : quest.assignedHeroIds;
    const synergyKey = [...heroIdsForSynergy].sort().join('|');
    const partySynergy = useMemo(() => questStore.getPartySynergySummary(heroIdsForSynergy), [questStore, synergyKey]);

    const toggleModifier = (id: string) => {
      setOpenedModifierId(prev => (prev === id ? null : id));
    };

    const canRevealAll = upgradeStore.getBooleanEffect('reveal_hidden');
    const revealLimit = upgradeStore.getNumericEffectMax('reveal_hidden_count');
    const visibleResourceRewards = canRevealAll
      ? resourceRewards
      : resourceRewards.slice(0, revealLimit);
    const hiddenRewardsCount = resourceRewards.length - visibleResourceRewards.length;

    const visibleRequiredResources = canRevealAll
      ? requiredResources
      : requiredResources.slice(0, revealLimit);
    const hiddenRequirementsCount = requiredResources.length - visibleRequiredResources.length;

    const selectionLimitReached = selectedHeroesIds.length >= maxPartySize;

    const handleAssignSquad = (squadId: string) => {
      const entry = squadEntries.find(item => item.squad.id === squadId);
      if (!entry) return;

      if (!entry.canAssign) {
        if (entry.reason) {
          setSquadMessage({ type: 'error', text: entry.reason });
        }

        return;
      }

      const heroIds = entry.squad.heroIds.filter(id => availableHeroIds.has(id));

      if (heroIds.length === 0) {
        setSquadMessage({ type: 'error', text: 'В отряде нет доступных героев.' });

        return;
      }

      setSelectedHeroesIds(heroIds.slice(0, maxPartySize));
      setSquadMessage({
        type: 'notice',
        text: `Отряд «${entry.squad.name}» выбран. Проверьте вероятность успеха и подтвердите отправку.`,
      });
    };

    return (
      <>
        <div className={styles.background} onClick={onClose} />
        <div className={clsx(styles.wrapper, {
          [styles.wrapperShowButton]: selectedHeroesIds.length !== 0,
        })}
        >

          <div className={styles.container}>
            <div className="card">
              <h3>
                {quest.title}
                . Дата создания:
                {quest.dateCreated}
              </h3>
              <p>
                {quest.status === QuestStatus.NotStarted && quest.description}
                {quest.status === QuestStatus.CompletedSuccess && quest.successResult}
                {quest.status === QuestStatus.CompletedFail && quest.failResult}
                {quest.status === QuestStatus.FailedDeadline && quest.deadlineResult}
              </p>
              {(quest.status === QuestStatus.NotStarted) && (
                <p>
                  Дедлайн:
                  {' '}
                  {deadlineDaysLeft > 0
                    ? `через ${deadlineDaysLeft} дн.`
                    : 'Последняя возможность взять задание!'}
                </p>
              )}
              {(quest.status === QuestStatus.InProgress && quest.executionDeadline !== null) && (
                <p>
                  Будет выполнено через:
                  {' '}
                  {quest.executionDeadline - questStore.timeStore.absoluteDay >= 0
                    ? `через ${quest.executionDeadline - questStore.timeStore.absoluteDay} дн.`
                    : `Выполнено`}
                </p>
              )}
              <p>
                Статус:
                {' '}
                <strong>{status}</strong>
              </p>

              {district && (
                <div className={styles.districtSection}>
                  <strong>Район:</strong>
                  {' '}
                  {district.name}
                  {district.control.factionId && district.control.factionId !== 'neutral' && (
                    <span>
                      {' '}
                      (под контролем
                      {' '}
                      {factionMap[district.control.factionId]?.name ?? 'неизвестно'}
                      )
                    </span>
                  )}
                  <div className={styles.districtDescription}>{district.description}</div>
                </div>
              )}

              {factionDetails && (
                <div className={styles.factionSection}>
                  <div className={styles.factionSectionRow}>
                    <strong>Заказчик:</strong>
                    {' '}
                    {factionDetails.name}
                  </div>
                  <div className={styles.factionSectionRow}>
                    Требуется репутация:
                    {' '}
                    <strong>{factionDetails.reputationRequirement}</strong>
                  </div>
                  <div className={styles.factionSectionRow}>
                    Репутация — успех:
                    {' '}
                    {formatDelta(factionDetails.successRepDelta)}
                    , провал:
                    {' '}
                    {formatDelta(factionDetails.failureRepDelta)}
                  </div>
                  {(factionDetails.successHeatDelta || factionDetails.failureHeatDelta) && (
                    <div className={styles.factionSectionRow}>
                      Heat — успех:
                      {' '}
                      {formatDelta(factionDetails.successHeatDelta)}
                      , провал:
                      {' '}
                      {formatDelta(factionDetails.failureHeatDelta)}
                    </div>
                  )}
                </div>
              )}

              {chainDetails && (
                <div className={styles.chainSection}>
                  {chainDetails.portrait && (
                    <div className={styles.chainPortraitWrapper}>
                      <img
                        src={chainDetails.portrait}
                        alt={chainDetails.leaderName}
                        className={styles.chainPortrait}
                      />
                    </div>
                  )}
                  <div className={styles.chainSectionRow}>
                    Цепочка фракции — этап
                    {' '}
                    {chainDetails.currentStage}
                    /
                    {chainDetails.totalStages}
                  </div>
                  <div className={styles.chainSectionRow}>
                    Куратор:
                    {' '}
                    {chainDetails.leaderName}
                    {' '}
                    (
                    {chainDetails.leaderTitle}
                    )
                  </div>
                  {chainDetails.unlocksLeader && (
                    <div className={styles.chainSectionRowHighlight}>
                      Успех откроет личный канал связи с лидером.
                    </div>
                  )}
                  <div className={styles.chainSectionRowNote}>Главный герой должен участвовать в отряде для этой цепочки.</div>
                </div>
              )}

              <p>
                Награда:
                {' '}
                <span className={styles.reward}>
                  💰
                  {quest.reward}
                  {' '}
                  золота
                </span>
              </p>

              <p>
                Ожидаемая награда с учётом инфраструктуры:
                {' '}
                <strong>
                  {expectedReward}
                  {' '}
                  золота
                </strong>
              </p>

              <p>
                Тип контракта:
                {' '}
                <strong>
                  {quest.isIllegal ? 'Нелегальный' : 'Официальный'}
                </strong>
              </p>

              {visibleRequiredResources.length > 0 && (
                <div className={styles.resourceRequirements}>
                  <strong>Требуются ресурсы для старта:</strong>
                  <div className={styles.resourceRewardList}>
                    {visibleRequiredResources.map(resource => (
                      <div key={`req-${resource.id}`} className={styles.resourceRewardItem} title={resource.description}>
                        <span className={styles.resourceRewardIcon}>{resource.icon}</span>
                        <span className={styles.resourceRewardName}>{resource.name}</span>
                        <span className={styles.resourceRewardAmount}>
                          -
                          {resource.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                  {hiddenRequirementsCount > 0 && (
                    <p className={styles.hiddenInfo}>
                      Неизвестно ещё ресурсов:
                      {' '}
                      {hiddenRequirementsCount}
                      . Постройте разведцентр, чтобы раскрыть больше данных.
                    </p>
                  )}
                </div>
              )}

              {visibleResourceRewards.length > 0 && (
                <div className={styles.resourceRewards}>
                  <strong>Другие трофеи:</strong>
                  <div className={styles.resourceRewardList}>
                    {visibleResourceRewards.map(reward => (
                      <div key={reward.id} className={styles.resourceRewardItem} title={reward.description}>
                        <span className={styles.resourceRewardIcon}>{reward.icon}</span>
                        <span className={styles.resourceRewardName}>{reward.name}</span>
                        <span className={styles.resourceRewardAmount}>
                          +
                          {reward.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                  {hiddenRewardsCount > 0 && (
                    <p className={styles.hiddenInfo}>
                      Есть ещё неизвестные награды:
                      {' '}
                      {hiddenRewardsCount}
                      . Улучшите разведку, чтобы увидеть полный список.
                    </p>
                  )}
                </div>
              )}

              <p>
                Итоговая выгода гильдии:
                {' '}
                <span
                  style={{
                    color: guildProfit >= 0 ? '#43a047' : '#e53935',
                    fontWeight: '600',
                  }}
                >
                  {guildProfit}
                  {' '}
                  золота
                </span>
              </p>

              {quest.status === QuestStatus.NotStarted && (
                <div className={styles.successChance}>
                  <strong>Шанс успеха:</strong>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${successChance}%`,
                        backgroundColor: getProgressColor(successChance),
                      }}
                      title={`${successChance}%`}
                    />
                  </div>
                  <span>
                    {successChance}
                    %
                  </span>
                </div>
              )}

              {heroIdsForSynergy.length > 0 && (
                <div className={styles.synergySection}>
                  <strong>Химия отряда:</strong>
                  <div className={styles.synergySummary}>
                    <span>
                      Бонус к успеху:
                      {partySynergy.successBonus >= 0 ? '+' : ''}
                      {partySynergy.successBonus}
                      %
                    </span>
                    {partySynergy.injuryMultiplier !== 1 && (
                      <span>
                        Модификатор травм: ×
                        {partySynergy.injuryMultiplier.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {partySynergy.notes.length === 0
                    ? (
                        <p className={styles.synergyNoNotes}>Особых взаимодействий не обнаружено.</p>
                      )
                    : (
                        <ul className={styles.synergyNotes}>
                          {partySynergy.notes.map(note => (
                            <li key={note.id} className={note.type === 'bonus' ? styles.synergyNoteBonus : styles.synergyNotePenalty}>
                              {note.text}
                            </li>
                          ))}
                        </ul>
                      )}
                </div>
              )}

              <div>
                <strong>Назначенные герои:</strong>
                {assignedHeroes.length === 0
                  ? (
                      <span> — нет</span>
                    )
                  : (
                      <ul className={styles.assignedHeroesList}>
                        {assignedHeroes.map(hero => (
                          <li key={hero.id}>
                            {hero.name}
                            {' '}
                            (
                            {hero.type}
                            ) — 💪
                            {hero.strength}
                            {' '}
                            | 🎯
                            {' '}
                            {hero.agility}
                            {' '}
                            | 🧠
                            {hero.intelligence}
                          </li>
                        ))}
                      </ul>
                    )}
              </div>

              <div>
                <strong>Требования по статам:</strong>
                {' '}
                💪
                {quest.requiredStrength}
                {' '}
                |
                🎯
                {quest.requiredAgility}
                {' '}
                | 🧠
                {quest.requiredIntelligence}
              </div>

              <div>
                <strong>Суммарные статы героев:</strong>
                {' '}
                💪
                {totalStrength}
                {' '}
                | 🎯
                {' '}
                {totalAgility}
                {' '}
                | 🧠
                {totalIntelligence}
              </div>

              {modifiers.length > 0 && (
                <div className={styles.modifiersSection}>
                  <strong>Модификаторы:</strong>
                  <div className={styles.modifierTags}>
                    {modifiers.map(modifier => (
                      <div key={modifier.id} className={styles.modifierTagWrapper}>
                        <button
                          type="button"
                          onClick={() => toggleModifier(modifier.id)}
                          className={clsx(styles.modifierTag, {
                            [styles.modifierTagActive]: openedModifierId === modifier.id,
                          })}
                        >
                          {modifier.name}
                        </button>
                        {openedModifierId === modifier.id && (
                          <div className={styles.modifierDropdown}>
                            {modifier.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {quest.resourcePenalty && (
                <div className={styles.penalties}>
                  <strong>🔻 Возможные потери при провале:</strong>
                  <ul>
                    {(quest.resourcePenalty.goldLoss ?? 0) > 0 && (
                      <li>
                        💰 Потеря золота:
                        {quest.resourcePenalty.goldLoss ?? 0}
                      </li>
                    )}
                    {(quest.resourcePenalty.injuryChance ?? 0) > 0 && (
                      <li>
                        🤕 Шанс ранения героя:
                        {' '}
                        {quest.resourcePenalty.injuryChance}
                        %
                      </li>
                    )}
                    {(quest.resourcePenalty.itemLossChance ?? 0) > 0 && (
                      <li>
                        🎒 Шанс потери предметов:
                        {' '}
                        {quest.resourcePenalty.itemLossChance}
                        %
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {quest.status === QuestStatus.NotStarted && (
            <div className={clsx(styles.heroSelector)}>
              <strong>Доступные герои для назначения:</strong>
              <div className={styles.partyLimit}>
                Максимальный размер отряда:
                {maxPartySize}
              </div>
              {questAllowsSquads && squadsStore.squads.length > 0 && (
                <div className={styles.squadSection}>
                  <strong>Готовые отряды:</strong>
                  {squadMessage && (
                    <div
                      className={clsx(
                        styles.squadMessage,
                        squadMessage.type === 'error' ? styles.squadError : styles.squadNotice,
                      )}
                    >
                      {squadMessage.text}
                    </div>
                  )}
                  <div className={styles.squadList}>
                    {squadEntries.length === 0
                      ? (
                          <span className={styles.squadUnavailable}>Нет сохранённых отрядов.</span>
                        )
                      : (
                          squadEntries.map(entry => (
                            <div key={entry.squad.id} className={styles.squadItem}>
                              <div className={styles.squadInfo}>
                                <span className={styles.squadName}>{entry.squad.name}</span>
                                <span className={styles.squadMeta}>
                                  {entry.members.length > 0
                                    ? entry.members.map(member => member.name).join(', ')
                                    : 'Нет участников'}
                                </span>
                                <span className={styles.squadMeta}>
                                  Бонус к успеху:
                                  {' '}
                                  {entry.synergy.successBonus >= 0 ? '+' : ''}
                                  {entry.synergy.successBonus}
                                  %
                                  {' • '}
                                  Травмы ×
                                  {entry.synergy.injuryMultiplier.toFixed(2)}
                                </span>
                                {entry.synergy.notes.length > 0 && (
                                  <ul className={styles.squadSynergyNotes}>
                                    {entry.synergy.notes.map(note => (
                                      <li key={`${entry.squad.id}-${note.id}`}>{note.text}</li>
                                    ))}
                                  </ul>
                                )}
                                {entry.reason && (
                                  <span className={styles.squadUnavailable}>{entry.reason}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                className={styles.squadAssignButton}
                                onClick={() => handleAssignSquad(entry.squad.id)}
                                disabled={!entry.canAssign}
                              >
                                Выбрать отряд
                              </button>
                            </div>
                          ))
                        )}
                  </div>
                </div>
              )}
              <div className={styles.heroSelectorScroller}>
                {availableForQuestHeroes.length === 0
                  ? (
                      <p>Нет доступных героев</p>
                    )
                  : availableForQuestHeroes.map(hero => (
                      <div key={hero.id} className={clsx({ [styles.mainHeroItem]: hero.id === MAIN_HERO_ID })}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedHeroesIds.includes(hero.id)}
                            onChange={() => toggleHero(hero.id)}
                            disabled={(quest.chainId && hero.id === MAIN_HERO_ID)
                              || (!selectedHeroesIds.includes(hero.id) && selectionLimitReached)}
                          />
                          {hero.name}
                          {' '}
                          (
                          {hero.type}
                          {' '}
                          {hero.level}
                          {' '}
                          lvl) — 💪
                          {' '}
                          {hero.strength}
                          {' '}
                          | 🎯
                          {hero.agility}
                          {' '}
                          | 🧠
                          {' '}
                          {hero.intelligence}
                          <span className={styles.minStake}>
                            {' '}
                            — зарплата:
                            {' '}
                            {hero.monthlySalary}
                            {' '}
                            золота/мес.
                          </span>
                          {hero.id === MAIN_HERO_ID && (
                            <span className={styles.mainHeroTag}>Главный герой</span>
                          )}
                        </label>
                      </div>
                    ))}

                {selectionLimitReached && (
                  <p className={styles.limitWarning}>Максимальный состав достигнут.</p>
                )}
              </div>
            </div>
          )}

          {quest.status === QuestStatus.NotStarted && (
            <button
              className={clsx(styles.assignBtn, {
                [styles.assignBtnActive]: selectedHeroesIds.length !== 0,
              })}
              disabled={availableForQuestHeroes.length === 0 || selectedHeroesIds.length === 0}
              onClick={() => {
                console.log('click');
                setSquadMessage(null);
                onAssign(quest.id, selectedHeroesIds);
                setSelectedHeroesIds([]);
              }}
            >
              Назначить героев
            </button>
          )}
        </div>
      </>
    );
  },
);
