export type ResourceRarity = 'common' | 'uncommon' | 'rare' | 'exotic' | 'legendary';
export type ResourceCategory = 'material' | 'alchemical' | 'magical' | 'story';

export type GuildResource = {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: ResourceRarity;
  category: ResourceCategory;
  startingAmount?: number;
};

export const GUILD_RESOURCES: GuildResource[] = [
  {
    id: 'timber',
    name: 'Строевой лес',
    icon: '🪵',
    description: 'Обработанная древесина для расширения и укрепления гильдейских построек.',
    rarity: 'common',
    category: 'material',
    startingAmount: 250,
  },
  {
    id: 'iron_ore',
    name: 'Железная руда',
    icon: '⛏️',
    description: 'Сырье для изготовления оружия, брони и инструментов.',
    rarity: 'common',
    category: 'material',
    startingAmount: 180,
  },
  {
    id: 'healing_herbs',
    name: 'Целебные травы',
    icon: '🌿',
    description: 'Редкие растения, ускоряющие восстановление героев между заданиями.',
    rarity: 'uncommon',
    category: 'alchemical',
    startingAmount: 90,
  },
  {
    id: 'arcane_dust',
    name: 'Аркана-прах',
    icon: '✨',
    description: 'Концентрированная магическая субстанция, необходимая для ритуалов и зачарований.',
    rarity: 'uncommon',
    category: 'magical',
  },
  {
    id: 'monster_parts',
    name: 'Части чудовищ',
    icon: '🦴',
    description: 'Трофеи с монстров, ценимые алхимиками и мастерами редких эликсиров.',
    rarity: 'rare',
    category: 'alchemical',
  },
  {
    id: 'sunstone',
    name: 'Солнечный камень',
    icon: '🔆',
    description: 'Редкий кристалл, аккумулирующий свет и тепло. Используется в улучшениях и мощных артефактах.',
    rarity: 'exotic',
    category: 'magical',
  },
  {
    id: 'guild_charter_fragment',
    name: 'Фрагмент гильдейской хартии',
    icon: '📜',
    description: 'Часть старой хартии, подтверждающая права гильдии на операции в конкретных регионах.',
    rarity: 'rare',
    category: 'story',
  },
  {
    id: 'ancient_relic',
    name: 'Древний реликт',
    icon: '🗝️',
    description: 'Старинный артефакт, открывающий доступ к сюжетным заданиям и влиятельным покровителям.',
    rarity: 'legendary',
    category: 'story',
  },
  {
    id: 'city_favor_token',
    name: 'Знак благосклонности города',
    icon: '🏛️',
    description: 'Печать совета Равенфорда, позволяющая инициировать особые сюжетные миссии.',
    rarity: 'rare',
    category: 'story',
  },
  {
    id: 'guild_renown',
    name: 'Репутация гильдии',
    icon: '⭐',
    description: 'Нематериальный, но осязаемый ресурс доверия — требуется для крупных событий и контрактов.',
    rarity: 'uncommon',
    category: 'story',
    startingAmount: 25,
  },
];
