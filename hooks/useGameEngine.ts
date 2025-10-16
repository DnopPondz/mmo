'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GACHA_COST, ITEM_DROP_CHANCE, ITEMS, MONSTERS, RARITIES, getNextLevelXp } from '@/lib/constants';
import { createDefaultPlayer } from '@/lib/player';
import type { ChatMessage, Item, LogEntry, Monster, Player } from '@/lib/types';

const PLAYER_STORAGE_KEY = 'idle-mmo-player-id';

const calculateStats = (player: Player) => {
  let attack = player.attack;
  let defense = player.defense;
  let maxHp = player.maxHp;

  if (player.equipment.weapon) {
    attack += player.equipment.weapon.attack ?? 0;
    defense += player.equipment.weapon.defense ?? 0;
  }

  if (player.equipment.armor) {
    attack += player.equipment.armor.attack ?? 0;
    defense += player.equipment.armor.defense ?? 0;
  }

  if (player.activeBuffs?.length) {
    for (const buff of player.activeBuffs) {
      if (buff.stat === 'attack') attack += buff.amount;
      if (buff.stat === 'defense') defense += buff.amount;
      if (buff.stat === 'maxHp') maxHp += buff.amount;
    }
  }

  return { attack, defense, maxHp };
};

const rollItemDrop = () => {
  if (Math.random() > ITEM_DROP_CHANCE) return null;
  const itemPool = Object.values(ITEMS);
  return itemPool[Math.floor(Math.random() * itemPool.length)];
};

const generateMonster = (playerLevel: number): Monster => {
  const monsterData = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
  const levelModifier = Math.max(1, playerLevel - 1);
  const maxHp = Math.floor((monsterData.rewardXp + 50) * (1 + levelModifier * 0.2));

  return {
    name: monsterData.name,
    art: monsterData.art,
    rewardXp: monsterData.rewardXp,
    rewardGold: monsterData.rewardGold,
    attack: Math.floor(monsterData.attack * (1 + levelModifier * 0.1)),
    defense: Math.floor(monsterData.defense * (1 + levelModifier * 0.1)),
    hp: maxHp,
    maxHp
  };
};

export function useGameEngine() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gachaResult, setGachaResult] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<Player | null>(null);
  const initialisedRef = useRef(false);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let storedId: string | null = null;
    if (typeof window !== 'undefined') {
      storedId = localStorage.getItem(PLAYER_STORAGE_KEY);
      if (!storedId) {
        storedId = crypto.randomUUID();
        localStorage.setItem(PLAYER_STORAGE_KEY, storedId);
      }
    }
    setPlayerId(storedId);
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'], rarity?: Item['rarity']) => {
    setLog((prev) => {
      const entry: LogEntry = { message, type, rarity, time: new Date().toLocaleTimeString() };
      return [entry, ...prev].slice(0, 60);
    });
  }, []);

  const fetchPlayer = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/player?playerId=${id}`);
      if (!res.ok) {
        throw new Error('Unable to fetch player.');
      }
      const data = await res.json();
      setPlayer(data.player);
      playerRef.current = data.player;
      initialisedRef.current = true;
      setError(null);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถโหลดข้อมูลผู้เล่นได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCollections = useCallback(async () => {
    if (!playerId) return;
    try {
      const [leaderboardRes, chatRes] = await Promise.all([
        fetch('/api/leaderboard'),
        fetch('/api/chat')
      ]);

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.players);
      }

      if (chatRes.ok) {
        const data = await chatRes.json();
        setChatMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to refresh collections', err);
    }
  }, [playerId]);

  useEffect(() => {
    if (playerId) {
      fetchPlayer(playerId);
      refreshCollections();
      const interval = setInterval(refreshCollections, 5000);
      return () => clearInterval(interval);
    }
  }, [playerId, fetchPlayer, refreshCollections]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    if (!player && playerId && initialisedRef.current) {
      const newPlayer = createDefaultPlayer(playerId);
      setPlayer(newPlayer);
      playerRef.current = newPlayer;
    }
  }, [player, playerId]);

  const calculatedStats = useMemo(() => (player ? calculateStats(player) : { attack: 0, defense: 0, maxHp: 0 }), [player]);

  const spawnMonster = useCallback(
    (level: number) => {
      const newMonster = generateMonster(level);
      setMonster(newMonster);
      addLog(`พบ ${newMonster.name} ในป่าแห่งความลึกลับ!`, 'system');
    },
    [addLog]
  );

  useEffect(() => {
    if (player && !monster) {
      spawnMonster(player.level);
    }
  }, [player, monster, spawnMonster]);

  useEffect(() => {
    if (!player || !monster) return;

    const loop = setInterval(() => {
      setMonster((currentMonster) => {
        const currentPlayer = playerRef.current;
        if (!currentMonster || !currentPlayer) return currentMonster;

        const stats = calculateStats(currentPlayer);
        const playerDamage = Math.max(0, stats.attack - currentMonster.defense + Math.floor(Math.random() * 5));
        const monsterDamage = Math.max(0, currentMonster.attack - stats.defense + Math.floor(Math.random() * 5));

        const newMonsterHp = currentMonster.hp - playerDamage;
        let updatedMonster: Monster = { ...currentMonster, hp: Math.max(0, newMonsterHp) };

        if (newMonsterHp <= 0) {
          addLog(`คุณสังหาร ${currentMonster.name} ได้สำเร็จ!`, 'player');
          const drop = rollItemDrop();
          if (drop) {
            addLog(`คุณได้รับไอเทม ${drop.name}!`, 'item', drop.rarity);
          }

          setPlayer((prev) => {
            if (!prev) return prev;
            const gainedXp = currentMonster.rewardXp;
            const gainedGold = currentMonster.rewardGold;
            let { level, xp, statPoints } = prev;
            let newXp = prev.xp + gainedXp;
            let newLevel = level;
            let newStatPoints = statPoints;
            let leveledUp = false;

            while (newXp >= getNextLevelXp(newLevel)) {
              newXp -= getNextLevelXp(newLevel);
              newLevel += 1;
              newStatPoints += 1;
              leveledUp = true;
            }

            const newInventory = drop ? [...prev.inventory, drop] : prev.inventory;
            const updatedPlayer: Player = {
              ...prev,
              xp: newXp,
              level: newLevel,
              statPoints: newStatPoints,
              gold: prev.gold + gainedGold,
              inventory: newInventory,
              hp: leveledUp ? stats.maxHp : Math.min(stats.maxHp, prev.hp)
            };

            if (leveledUp) {
              addLog(`เลเวลอัพ! คุณขึ้นเป็นเลเวล ${newLevel}`, 'system');
            }

            playerRef.current = updatedPlayer;
            return updatedPlayer;
          });

          spawnMonster(playerRef.current?.level ?? 1);
          updatedMonster = { ...currentMonster, hp: 0 };
        } else {
          addLog(`คุณโจมตี ${currentMonster.name} และสร้างความเสียหาย ${playerDamage}`, 'player');
        }

        setPlayer((prev) => {
          if (!prev) return prev;
          const newHp = Math.max(0, prev.hp - monsterDamage);
          const updatedPlayer = { ...prev, hp: newHp };

          if (monsterDamage > 0) {
            addLog(`${currentMonster.name} โจมตีใส่คุณ ${monsterDamage} หน่วยความเสียหาย!`, 'monster');
          }

          if (newHp <= 0) {
            addLog('คุณพ่ายแพ้... ฟื้นคืนชีวิตพร้อมความฮึดสู้ใหม่!', 'system');
            updatedPlayer.hp = Math.floor(calculatedStats.maxHp * 0.75);
            updatedPlayer.gold = Math.max(0, updatedPlayer.gold - 50);
          }

          playerRef.current = updatedPlayer;
          return updatedPlayer;
        });

        return updatedMonster;
      });
    }, 2200);

    return () => clearInterval(loop);
  }, [player, monster, calculatedStats.maxHp, addLog, spawnMonster]);

  useEffect(() => {
    if (!player) return;
    const checkBuffs = setInterval(() => {
      setPlayer((prev) => {
        if (!prev || !prev.activeBuffs?.length) return prev;
        const now = Date.now();
        const activeBuffs = prev.activeBuffs.filter((buff) => {
          if (buff.expiresAt > now) return true;
          addLog(`${buff.name} หมดเวลาผลแล้ว`, 'system');
          return false;
        });
        const updatedPlayer = { ...prev, activeBuffs };
        playerRef.current = updatedPlayer;
        return updatedPlayer;
      });
    }, 1000);

    return () => clearInterval(checkBuffs);
  }, [player, addLog]);

  const scheduleSave = useCallback(
    (updatedPlayer: Player) => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
      pendingSaveRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await fetch('/api/player', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player: updatedPlayer })
          });
        } catch (err) {
          console.error('Failed to save player', err);
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    },
    []
  );

  useEffect(() => {
    if (!player) return;
    scheduleSave(player);
  }, [player, scheduleSave]);

  const handleStatAllocation = useCallback((stat: 'attack' | 'defense' | 'maxHp') => {
    setPlayer((prev) => {
      if (!prev || prev.statPoints <= 0) return prev;
      const updated = { ...prev, statPoints: prev.statPoints - 1 };
      if (stat === 'attack') updated.attack += 1;
      if (stat === 'defense') updated.defense += 1;
      if (stat === 'maxHp') updated.maxHp += 10;
      playerRef.current = updated;
      addLog(`คุณเพิ่มค่า ${stat} ของตัวละคร`, 'system');
      return updated;
    });
  }, [addLog]);

  const handleInventoryAction = useCallback((item: Item, isEquipped: boolean) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const inventory = [...prev.inventory];
      const equipment = { ...prev.equipment };

      if (item.type === 'consumable') {
        const itemIndex = inventory.findIndex((inv) => inv.id === item.id);
        if (itemIndex === -1) return prev;
        inventory.splice(itemIndex, 1);

        if (item.effect?.type === 'heal') {
          const stats = calculateStats(prev);
          const healed = Math.min(stats.maxHp, prev.hp + item.effect.amount);
          addLog(`ใช้ ${item.name} และฟื้นพลัง ${item.effect.amount}`, 'item');
          const updated = { ...prev, hp: healed, inventory };
          playerRef.current = updated;
          return updated;
        }

        if (item.effect?.type === 'buff' && item.effect.stat) {
          addLog(`ใช้ ${item.name} ได้รับบัพ ${item.effect.amount} ${item.effect.stat}`, 'item');
          const buff = {
            name: item.name,
            stat: item.effect.stat,
            amount: item.effect.amount,
            expiresAt: Date.now() + (item.effect.duration ?? 0)
          };
          const updated = { ...prev, activeBuffs: [...prev.activeBuffs, buff], inventory };
          playerRef.current = updated;
          return updated;
        }
        return prev;
      }

      if (isEquipped) {
        inventory.push(item);
        if (item.type === 'weapon') equipment.weapon = null;
        if (item.type === 'armor') equipment.armor = null;
      } else {
        const idx = inventory.findIndex((inv) => inv.id === item.id);
        if (idx !== -1) {
          inventory.splice(idx, 1);
        }
        if (item.type === 'weapon') {
          if (equipment.weapon) inventory.push(equipment.weapon);
          equipment.weapon = item;
        }
        if (item.type === 'armor') {
          if (equipment.armor) inventory.push(equipment.armor);
          equipment.armor = item;
        }
      }

      const updated = { ...prev, equipment, inventory };
      playerRef.current = updated;
      addLog(isEquipped ? `ถอด ${item.name}` : `สวมใส่ ${item.name}`, 'system');
      return updated;
    });
  }, [addLog]);

  const handleBuyItem = useCallback((item: Item) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      if ((item.cost ?? Infinity) > prev.gold) {
        addLog('ทองไม่พอสำหรับการซื้อ!', 'system');
        return prev;
      }
      const updated = {
        ...prev,
        gold: prev.gold - (item.cost ?? 0),
        inventory: [...prev.inventory, item]
      };
      addLog(`ซื้อ ${item.name} มาไว้ในกระเป๋า`, 'item');
      playerRef.current = updated;
      return updated;
    });
  }, [addLog]);

  const handleGacha = useCallback(() => {
    setPlayer((prev) => {
      if (!prev) return prev;
      if (prev.gold < GACHA_COST) {
        addLog('คุณต้องการทองเพิ่มอีกเล็กน้อยเพื่อสุ่มกาชา', 'system');
        return prev;
      }

      const totalWeight = Object.values(RARITIES).reduce((sum, rarity) => sum + rarity.weight, 0);
      let random = Math.random() * totalWeight;
      let selected: keyof typeof RARITIES = 'common';
      for (const rarityKey of Object.keys(RARITIES) as Array<keyof typeof RARITIES>) {
        const rarity = RARITIES[rarityKey];
        if (random < rarity.weight) {
          selected = rarityKey;
          break;
        }
        random -= rarity.weight;
      }

      const possibleItems = Object.values(ITEMS).filter((itm) => itm.rarity === selected);
      const wonItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      addLog(`สุ่มได้ ${wonItem.name} ระดับ ${RARITIES[wonItem.rarity].name}`, 'gacha', wonItem.rarity);
      setGachaResult(wonItem);

      const updated = {
        ...prev,
        gold: prev.gold - GACHA_COST,
        inventory: [...prev.inventory, wonItem]
      };
      playerRef.current = updated;
      return updated;
    });
  }, [addLog]);

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!playerRef.current || !text.trim()) return;
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            playerId: playerRef.current.id,
            playerName: playerRef.current.name
          })
        });
        if (!res.ok) throw new Error('Chat failed');
        await refreshCollections();
      } catch (err) {
        console.error('Failed to send chat', err);
        addLog('ไม่สามารถส่งข้อความได้', 'system');
      }
    },
    [refreshCollections, addLog]
  );

  return {
    player,
    playerId,
    monster,
    log,
    leaderboard,
    chatMessages,
    gachaResult,
    calculatedStats,
    isLoading,
    isSaving,
    error,
    handleStatAllocation,
    handleInventoryAction,
    handleBuyItem,
    handleGacha,
    sendChatMessage,
    refreshCollections
  };
}
