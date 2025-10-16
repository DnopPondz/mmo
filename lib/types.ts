export type RarityKey = 'common' | 'rare' | 'lord' | 'legend' | 'hell' | 'haven';

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'weapon' | 'armor';
  attack?: number;
  defense?: number;
  rarity: RarityKey;
  cost?: number;
  effect?: {
    type: 'heal' | 'buff';
    amount: number;
    stat?: 'attack' | 'defense' | 'maxHp';
    duration?: number;
  };
}

export interface Buff {
  name: string;
  stat: 'attack' | 'defense' | 'maxHp';
  amount: number;
  expiresAt: number;
}

export interface Player {
  id: string;
  name: string;
  level: number;
  xp: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  gold: number;
  inventory: Item[];
  equipment: {
    weapon: Item | null;
    armor: Item | null;
  };
  statPoints: number;
  activeBuffs: Buff[];
  updatedAt?: string;
  createdAt?: string;
}

export interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  rewardXp: number;
  rewardGold: number;
  art: string;
}

export interface LogEntry {
  message: string;
  type: 'player' | 'monster' | 'system' | 'item' | 'gacha';
  rarity?: RarityKey;
  time: string;
}

export interface ChatMessage {
  _id?: string;
  id?: string;
  playerId: string;
  playerName: string;
  text: string;
  createdAt: string;
}
