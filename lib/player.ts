import type { Player } from './types';

export const PLAYER_COLLECTION = 'players';

export const createDefaultPlayer = (id: string): Player => ({
  id,
  name: `Hero #${id.substring(0, 6)}`,
  level: 1,
  xp: 0,
  maxHp: 50,
  hp: 50,
  attack: 10,
  defense: 5,
  gold: 250,
  inventory: [],
  equipment: { weapon: null, armor: null },
  statPoints: 0,
  activeBuffs: []
});
