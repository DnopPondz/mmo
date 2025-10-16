import { CHAT_LIMIT } from './chat';
import { createDefaultPlayer } from './player';
import type { ChatMessage, Player } from './types';

export type InMemoryStore = {
  players: Map<string, Player>;
  chat: ChatMessage[];
};

const globalWithStore = globalThis as typeof globalThis & {
  __idleMmoStore?: InMemoryStore;
};

function getStore(): InMemoryStore {
  if (!globalWithStore.__idleMmoStore) {
    globalWithStore.__idleMmoStore = {
      players: new Map(),
      chat: []
    };
  }
  return globalWithStore.__idleMmoStore;
}

export function getPlayerFromMemory(playerId: string): Player {
  const store = getStore();
  let player = store.players.get(playerId);
  if (!player) {
    player = createDefaultPlayer(playerId);
    store.players.set(playerId, player);
  }
  return player;
}

export function upsertPlayerInMemory(player: Player) {
  const store = getStore();
  store.players.set(player.id, player);
}

export function listPlayersFromMemory(): Player[] {
  const store = getStore();
  return Array.from(store.players.values());
}

export function listChatFromMemory(): ChatMessage[] {
  const store = getStore();
  return store.chat;
}

export function addChatMessageToMemory(message: ChatMessage) {
  const store = getStore();
  store.chat = [...store.chat.slice(-(CHAT_LIMIT - 1)), message];
}
