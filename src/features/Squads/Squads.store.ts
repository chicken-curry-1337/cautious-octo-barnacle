import { makeAutoObservable } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { HeroesStore } from '../Heroes/Heroes.store';

export type Squad = {
  id: string;
  name: string;
  heroIds: string[];
};

@singleton()
export class SquadsStore {
  private squadsMap: Record<string, Squad> = {};
  private syncing = false;
  readonly maxSquadSize = 5;

  constructor(@inject(HeroesStore) private heroesStore: HeroesStore) {
    makeAutoObservable(this);
  }

  get squads(): Squad[] {
    const knownHeroIds = new Set(this.heroesStore.heroes.map(hero => hero.id));

    return Object.values(this.squadsMap)
      .map(squad => ({
        ...squad,
        heroIds: squad.heroIds.filter(id => knownHeroIds.has(id)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getSquad(id: string) {
    return this.squadsMap[id] ?? null;
  }

  createSquad(name: string, heroIds: string[]) {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Название отряда не может быть пустым.');

    const uniqueHeroIds = this.normalizeHeroIds(heroIds);
    const id = crypto.randomUUID();

    this.squadsMap[id] = {
      id,
      name: trimmedName,
      heroIds: uniqueHeroIds,
    };
  }

  updateSquad(id: string, data: { name?: string; heroIds?: string[] }) {
    const squad = this.squadsMap[id];
    if (!squad) return;

    if (typeof data.name === 'string') {
      const trimmedName = data.name.trim();
      if (!trimmedName) throw new Error('Название отряда не может быть пустым.');
      squad.name = trimmedName;
    }

    if (data.heroIds) {
      squad.heroIds = this.normalizeHeroIds(data.heroIds);
    }
  }

  disbandSquad(id: string) {
    delete this.squadsMap[id];
  }

  private normalizeHeroIds(heroIds: string[]) {
    const knownHeroIds = new Set(this.heroesStore.heroes.map(hero => hero.id));
    const unique = Array.from(new Set(heroIds.filter(id => knownHeroIds.has(id))));

    if (unique.length > this.maxSquadSize) {
      throw new Error(`В отряде может быть максимум ${this.maxSquadSize} героев.`);
    }

    return unique;
  }

  setSyncing(value: boolean) {
    this.syncing = value;
  }

  loadSnapshot(squads: Squad[]) {
    this.setSyncing(true);

    try {
      const map: Record<string, Squad> = {};
      squads.forEach((squad) => {
        map[squad.id] = {
          id: squad.id,
          name: squad.name,
          heroIds: squad.heroIds.slice(0, this.maxSquadSize),
        };
      });

      this.squadsMap = map;
    } finally {
      this.setSyncing(false);
    }
  }
}
