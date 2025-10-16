import type { Item, Monster, RarityKey } from './types';

export const MONSTERS: Omit<Monster, 'hp' | 'maxHp'>[] = [
  {
    name: 'Slime',
    attack: 5,
    defense: 2,
    rewardXp: 10,
    rewardGold: 5,
    art: `
      .--.
     / oo \\
    | \\/  |
     \\_  _/
      \`--\`
    `
  },
  {
    name: 'Goblin',
    attack: 8,
    defense: 4,
    rewardXp: 20,
    rewardGold: 10,
    art: `
     ,      ,
    /(.-""-.)\\
    |  _ _  |
    | |' '| |
    \\  \\_/  /
     '.___.'
    `
  },
  {
    name: 'Orc',
    attack: 15,
    defense: 8,
    rewardXp: 50,
    rewardGold: 25,
    art: `
      /\\_ /\\
     | O O |
     | \\_/ |
     \\ | | /
      \`"""\`
    `
  },
  {
    name: 'Dragon',
    attack: 40,
    defense: 20,
    rewardXp: 300,
    rewardGold: 150,
    art: `
             ,
        _.-'|'-._
       /|'.--.'|\\
      | |  :: | |
      | |  :: | |
       \\|'--'|/
        '-.__.-'
    `
  }
];

export const RARITIES: Record<RarityKey, { name: string; color: string; weight: number }> = {
  common: { name: 'Common', color: 'text-slate-300', weight: 60 },
  rare: { name: 'Rare', color: 'text-sky-400', weight: 25 },
  lord: { name: 'Lord', color: 'text-amber-400', weight: 10 },
  legend: { name: 'Legend', color: 'text-purple-500', weight: 4 },
  hell: { name: 'Hell', color: 'text-red-500', weight: 0.9 },
  haven: { name: 'Haven', color: 'text-yellow-300', weight: 0.1 }
};

export const ITEMS: Record<string, Item> = {
  // Consumables
  small_health_potion: {
    id: 'small_health_potion',
    name: 'Small Health Potion',
    type: 'consumable',
    effect: { type: 'heal', amount: 50 },
    rarity: 'common',
    cost: 50
  },
  strength_buff_potion: {
    id: 'strength_buff_potion',
    name: 'Strength Potion',
    type: 'consumable',
    effect: { type: 'buff', stat: 'attack', amount: 10, duration: 60_000 },
    rarity: 'rare',
    cost: 200
  },

  // Weapons
  rusty_sword: {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    type: 'weapon',
    attack: 3,
    defense: 0,
    rarity: 'common',
    cost: 100
  },
  steel_sword: {
    id: 'steel_sword',
    name: 'Steel Sword',
    type: 'weapon',
    attack: 8,
    defense: 0,
    rarity: 'rare',
    cost: 500
  },
  lord_blade: {
    id: 'lord_blade',
    name: 'Lord Blade',
    type: 'weapon',
    attack: 15,
    defense: 2,
    rarity: 'lord',
    cost: 2000
  },
  legendary_trident: {
    id: 'legendary_trident',
    name: 'Legendary Trident',
    type: 'weapon',
    attack: 30,
    defense: 5,
    rarity: 'legend'
  },
  hellfire_axe: {
    id: 'hellfire_axe',
    name: 'Hellfire Axe',
    type: 'weapon',
    attack: 50,
    defense: -5,
    rarity: 'hell'
  },
  heavens_spear: {
    id: 'heavens_spear',
    name: "Heaven's Spear",
    type: 'weapon',
    attack: 45,
    defense: 10,
    rarity: 'haven'
  },

  // Armors
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: 'armor',
    attack: 0,
    defense: 5,
    rarity: 'common',
    cost: 120
  },
  iron_plate: {
    id: 'iron_plate',
    name: 'Iron Plate',
    type: 'armor',
    attack: 0,
    defense: 10,
    rarity: 'rare',
    cost: 600
  },
  lord_mail: {
    id: 'lord_mail',
    name: 'Lord Mail',
    type: 'armor',
    attack: 2,
    defense: 18,
    rarity: 'lord',
    cost: 2500
  },
  legendary_shield: {
    id: 'legendary_shield',
    name: 'Legendary Shield',
    type: 'armor',
    attack: 5,
    defense: 25,
    rarity: 'legend'
  },
  hellish_cuirass: {
    id: 'hellish_cuirass',
    name: 'Hellish Cuirass',
    type: 'armor',
    attack: 10,
    defense: 40,
    rarity: 'hell'
  },
  holy_robe: {
    id: 'holy_robe',
    name: 'Holy Robe',
    type: 'armor',
    attack: 0,
    defense: 50,
    rarity: 'haven'
  }
};

export const ITEM_DROP_CHANCE = 0.3;
export const GACHA_COST = 10;

export const getNextLevelXp = (level: number) => Math.floor(100 * Math.pow(1.2, level - 1));
