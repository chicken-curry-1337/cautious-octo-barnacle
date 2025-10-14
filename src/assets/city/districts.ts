import type { FactionId } from '../factions/factions';

export type DistrictDefinition = {
  id: string;
  name: string;
  description: string;
  startingControl: FactionId | 'neutral';
  startingProsperity: number; // 0-100
  startingSecurity: number; // 0-100
  startingUnrest: number; // 0-100
  tags: string[];
};

export const DISTRICT_DEFINITIONS: DistrictDefinition[] = [
  {
    id: 'harbor',
    name: 'Порт Равенфорда',
    description: 'Торговые доки, где сталкиваются интересы гильдии, стражи и контрабандистов.',
    startingControl: 'merchants',
    startingProsperity: 70,
    startingSecurity: 55,
    startingUnrest: 25,
    tags: ['trade', 'smuggling', 'supply'],
  },
  {
    id: 'market',
    name: 'Центральный рынок',
    description: 'Шумная площадь с лавками ремесленников и бесконечным потоком заказов.',
    startingControl: 'citizens',
    startingProsperity: 65,
    startingSecurity: 45,
    startingUnrest: 20,
    tags: ['commerce', 'civic'],
  },
  {
    id: 'crownward',
    name: 'Коронный квартал',
    description: 'Резиденции знати и ратуша, где принимают ключевые решения.',
    startingControl: 'guard',
    startingProsperity: 80,
    startingSecurity: 70,
    startingUnrest: 10,
    tags: ['government', 'influence'],
  },
  {
    id: 'shadows',
    name: 'Сумрачные трущобы',
    description: 'Лабиринт переулков, в которых прячутся картель и шёпот-сеть.',
    startingControl: 'cartel',
    startingProsperity: 35,
    startingSecurity: 30,
    startingUnrest: 45,
    tags: ['shadow', 'smuggling'],
  },
  {
    id: 'arcane_spire',
    name: 'Арканная башня',
    description: 'Квартал магов и исследовательских лабораторий с редкими артефактами.',
    startingControl: 'guild',
    startingProsperity: 55,
    startingSecurity: 60,
    startingUnrest: 18,
    tags: ['arcane', 'research'],
  },
  {
    id: 'outskirts',
    name: 'Окраинные деревни',
    description: 'Пригородные поселения, зависящие от гильдии в защите и снабжении.',
    startingControl: 'neutral',
    startingProsperity: 40,
    startingSecurity: 35,
    startingUnrest: 30,
    tags: ['agriculture', 'civic'],
  },
];
