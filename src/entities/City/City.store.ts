import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { DISTRICT_DEFINITIONS, type DistrictDefinition } from '../../assets/city/districts';
import type { FactionId } from '../../assets/factions/factions';
import { GameStateStore } from '../GameState/GameStateStore';
import { TimeStore } from '../TimeStore/TimeStore';

export type DistrictState = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  control: {
    factionId: FactionId | 'neutral';
    value: number; // 0-100, отражает силу влияния
  };
  prosperity: number;
  security: number;
  unrest: number;
  recentEvents: DistrictEvent[];
};

export type DistrictEvent = {
  id: string;
  day: number;
  text: string;
};

export type DistrictSnapshot = {
  id: string;
  controlFaction: FactionId | 'neutral';
  controlValue: number;
  prosperity: number;
  security: number;
  unrest: number;
  recentEvents: DistrictEvent[];
};

export type CitySnapshot = {
  districts: DistrictSnapshot[];
};

type QuestOutcome = 'success' | 'failure' | 'timeout';

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

@singleton()
export class CityStore {
  districts: DistrictState[] = [];
  private syncing = false;

  constructor(
    @inject(TimeStore) private timeStore: TimeStore,
    @inject(GameStateStore) private gameStateStore: GameStateStore,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });

    this.initializeDistricts();

    reaction(
      () => this.timeStore.absoluteDay,
      (day, previous) => {
        if (this.syncing) return;
        if (previous === undefined) return;
        if (day !== previous) {
          this.onNewDay();
        }
      },
      { fireImmediately: false },
    );
  }

  get hotspots() {
    return this.districts
      .filter(district => district.unrest >= 60 || district.security <= 40)
      .sort((a, b) => b.unrest - a.unrest);
  }

  getDistrictById = (districtId: string | undefined | null) => {
    if (!districtId) return null;

    return this.districts.find(district => district.id === districtId) ?? null;
  };

  pickDistrictForFaction = (factionId: FactionId | 'citizens' | 'neutral' | undefined) => {
    const candidates = factionId
      ? this.districts.filter(district => district.control.factionId === factionId || district.control.factionId === 'neutral')
      : this.districts;

    if (candidates.length === 0) return null;

    return candidates[Math.floor(Math.random() * candidates.length)].id;
  };

  applyQuestOutcome = (districtId: string | null | undefined, outcome: QuestOutcome, questTitle: string, factionId?: FactionId) => {
    const district = this.getDistrictById(districtId);
    if (!district) return;

    const baseShift = outcome === 'success' ? 8 : outcome === 'failure' ? -10 : -4;
    const prosperityDelta = outcome === 'success' ? 6 : outcome === 'failure' ? -5 : -2;
    const securityDelta = outcome === 'success' ? 5 : outcome === 'failure' ? -7 : -3;
    const unrestDelta = outcome === 'success' ? -8 : outcome === 'failure' ? 12 : 6;

    if (outcome === 'success' && factionId) {
      district.control = {
        factionId,
        value: clamp(outcome === 'success' ? district.control.value + baseShift : district.control.value + baseShift),
      };
    } else {
      district.control = {
        factionId: district.control.factionId,
        value: clamp(district.control.value + baseShift),
      };
    }

    district.prosperity = clamp(district.prosperity + prosperityDelta);
    district.security = clamp(district.security + securityDelta);
    district.unrest = clamp(district.unrest + unrestDelta);

    this.pushEvent(district, this.describeOutcome(outcome, questTitle));
  };

  applyHeatChange = (heatDelta: number) => {
    if (heatDelta === 0) return;

    const spread = heatDelta > 0 ? 1 : -1;
    this.districts.forEach((district) => {
      district.security = clamp(district.security - spread * Math.abs(heatDelta) * 0.3);
      district.unrest = clamp(district.unrest + spread * Math.abs(heatDelta) * 0.4);
    });
  };

  onNewDay = () => {
    const globalHeat = this.gameStateStore.heat;

    this.districts.forEach((district) => {
      const unrestTrend = district.unrest > 50 ? -2 : 1;
      district.unrest = clamp(district.unrest + unrestTrend);

      const securityDecay = globalHeat > 70 ? -2 : globalHeat > 40 ? -1 : 0;
      district.security = clamp(district.security + securityDecay);

      if (district.security < 30 && district.recentEvents.length < 8) {
        this.pushEvent(district, 'Район нуждается в усиленной охране — безопасность падает.');
      }
    });
  };

  getSnapshot(): CitySnapshot {
    return {
      districts: this.districts.map(district => ({
        id: district.id,
        controlFaction: district.control.factionId,
        controlValue: district.control.value,
        prosperity: district.prosperity,
        security: district.security,
        unrest: district.unrest,
        recentEvents: district.recentEvents.slice(-10),
      })),
    };
  }

  loadSnapshot(snapshot: CitySnapshot | null | undefined) {
    if (!snapshot) return;

    this.setSyncing(true);

    try {
      snapshot.districts.forEach((districtSnapshot) => {
        const district = this.districts.find(item => item.id === districtSnapshot.id);
        if (!district) return;

        district.control.factionId = districtSnapshot.controlFaction;
        district.control.value = clamp(districtSnapshot.controlValue);
        district.prosperity = clamp(districtSnapshot.prosperity);
        district.security = clamp(districtSnapshot.security);
        district.unrest = clamp(districtSnapshot.unrest);
        district.recentEvents = districtSnapshot.recentEvents ?? [];
      });
    } finally {
      this.setSyncing(false);
    }
  }

  setSyncing(value: boolean) {
    this.syncing = value;
  }

  private initializeDistricts() {
    if (this.districts.length > 0) return;

    this.districts = DISTRICT_DEFINITIONS.map(this.createDistrictFromDefinition);
  }

  private createDistrictFromDefinition(definition: DistrictDefinition): DistrictState {
    return {
      id: definition.id,
      name: definition.name,
      description: definition.description,
      tags: definition.tags,
      control: {
        factionId: definition.startingControl,
        value: 60,
      },
      prosperity: clamp(definition.startingProsperity),
      security: clamp(definition.startingSecurity),
      unrest: clamp(definition.startingUnrest),
      recentEvents: [],
    };
  }

  private pushEvent(district: DistrictState, text: string) {
    district.recentEvents = [
      {
        id: crypto.randomUUID(),
        day: this.timeStore.absoluteDay,
        text,
      },
      ...district.recentEvents,
    ].slice(0, 12);
  }

  private describeOutcome(outcome: QuestOutcome, questTitle: string) {
    switch (outcome) {
      case 'success':
        return `Задание «${questTitle}» успешно выполнено — влияние гильдии растёт.`;
      case 'failure':
        return `Провал задания «${questTitle}» породил проблемы в районе.`;
      case 'timeout':
      default:
        return `Срок задания «${questTitle}» истёк — жители недовольны.`;
    }
  }
}
