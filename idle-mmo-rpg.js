import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// --- Game Config ---
const MONSTERS = [
    { name: 'Slime', hp: 30, attack: 5, defense: 2, rewardXp: 10, rewardGold: 5, art: `
      .--.
     / oo \\
    | \\/  |
     \\_  _/
      \`--\`
    ` },
    { name: 'Goblin', hp: 50, attack: 8, defense: 4, rewardXp: 20, rewardGold: 10, art: `
     ,      ,
    /(.-""-.)\\
    |  _ _  |
    | |' '| |
    \\  \\_/  /
     '.___.'
    ` },
    { name: 'Orc', hp: 100, attack: 15, defense: 8, rewardXp: 50, rewardGold: 25, art: `
      /\\_ /\\
     | O O |
     | \\_/ |
     \\ | | /
      \`"""\`
    ` },
    { name: 'Dragon', hp: 500, attack: 40, defense: 20, rewardXp: 300, rewardGold: 150, art: `
             ,
        _.-'|'-._
       /|'.--.'|\\
      | |  :: | |
      | |  :: | |
       \\|'--'|/
        '-.__.-'
    ` },
];

const RARITIES = {
    common: { name: 'Common', color: 'text-slate-300', weight: 60 },
    rare: { name: 'Rare', color: 'text-sky-400', weight: 25 },
    lord: { name: 'Lord', color: 'text-amber-400', weight: 10 },
    legend: { name: 'Legend', color: 'text-purple-500', weight: 4 },
    hell: { name: 'Hell', color: 'text-red-500', weight: 0.9 },
    haven: { name: 'Haven', color: 'text-yellow-300', weight: 0.1 },
};

const ITEMS = {
    // Consumables
    'small_health_potion': { id: 'small_health_potion', name: 'Small Health Potion', type: 'consumable', effect: { type: 'heal', amount: 50 }, rarity: 'common', cost: 50 },
    'strength_buff_potion': { id: 'strength_buff_potion', name: 'Strength Potion', type: 'consumable', effect: { type: 'buff', stat: 'attack', amount: 10, duration: 60000 }, rarity: 'rare', cost: 200 }, // 1 minute
    
    // Weapons
    'rusty_sword': { id: 'rusty_sword', name: 'Rusty Sword', type: 'weapon', attack: 3, defense: 0, rarity: 'common', cost: 100 },
    'steel_sword': { id: 'steel_sword', name: 'Steel Sword', type: 'weapon', attack: 8, defense: 0, rarity: 'rare', cost: 500 },
    'lord_blade': { id: 'lord_blade', name: 'Lord Blade', type: 'weapon', attack: 15, defense: 2, rarity: 'lord', cost: 2000 },
    'legendary_trident': { id: 'legendary_trident', name: 'Legendary Trident', type: 'weapon', attack: 30, defense: 5, rarity: 'legend' },
    'hellfire_axe': { id: 'hellfire_axe', name: 'Hellfire Axe', type: 'weapon', attack: 50, defense: -5, rarity: 'hell' },
    'heavens_spear': { id: 'heavens_spear', name: 'Heaven\'s Spear', type: 'weapon', attack: 45, defense: 10, rarity: 'haven' },

    // Armors
    'leather_armor': { id: 'leather_armor', name: 'Leather Armor', type: 'armor', attack: 0, defense: 5, rarity: 'common', cost: 120 },
    'iron_plate': { id: 'iron_plate', name: 'Iron Plate', type: 'armor', attack: 0, defense: 10, rarity: 'rare', cost: 600 },
    'lord_mail': { id: 'lord_mail', name: 'Lord Mail', type: 'armor', attack: 2, defense: 18, rarity: 'lord', cost: 2500 },
    'legendary_shield': { id: 'legendary_shield', name: 'Legendary Shield', type: 'armor', attack: 5, defense: 25, rarity: 'legend' },
    'hellish_cuirass': { id: 'hellish_cuirass', name: 'Hellish Cuirass', type: 'armor', attack: 10, defense: 40, rarity: 'hell' },
    'holy_robe': { id: 'holy_robe', name: 'Holy Robe', type: 'armor', attack: 0, defense: 50, rarity: 'haven' },
};

const ITEM_DROP_CHANCE = 0.3; // 30% chance to drop an item
const GACHA_COST = 10;

const getNextLevelXp = (level) => Math.floor(100 * Math.pow(1.2, level - 1));

// --- UI Components ---
const PlayerStats = ({ player, calculatedStats }) => (
    <div className="bg-slate-800 p-4 rounded-lg shadow-inner w-full text-slate-300">
        <h2 className="text-xl font-bold text-green-400 mb-4 border-b border-slate-700 pb-2">Your Hero</h2>
        <div className="space-y-3">
            <div>
                <div className="flex justify-between font-bold"><span>Level:</span><span>{player.level}</span></div>
            </div>
             <div>
                <div className="flex justify-between"><span>HP:</span><span className="text-red-400 font-mono">{player.hp} / {calculatedStats.maxHp}</span></div>
                <progress value={player.hp} max={calculatedStats.maxHp} className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-red-500 [&::-moz-progress-bar]:bg-red-500"></progress>
            </div>
            <div>
                <div className="flex justify-between"><span>XP:</span><span className="text-yellow-400 font-mono">{player.xp} / {getNextLevelXp(player.level)}</span></div>
                <progress value={player.xp} max={getNextLevelXp(player.level)} className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-yellow-500 [&::-moz-progress-bar]:bg-yellow-500"></progress>
            </div>
            <div className="flex justify-between"><span>Attack:</span><span>{calculatedStats.attack} <span className="text-slate-400">({player.attack})</span></span></div>
            <div className="flex justify-between"><span>Defense:</span><span>{calculatedStats.defense} <span className="text-slate-400">({player.defense})</span></span></div>
            <div className="flex justify-between"><span>Gold:</span><span className="text-amber-400">{player.gold} G</span></div>
        </div>
    </div>
);

const StatAllocation = ({ player, onAllocate }) => {
    if (!player || player.statPoints <= 0) return null;
    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-inner w-full text-slate-300 mt-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-2">Level Up!</h2>
            <p className="mb-4">You have <span className="font-bold text-yellow-300">{player.statPoints}</span> stat points to spend.</p>
            <div className="flex justify-between gap-2">
                <button onClick={() => onAllocate('attack')} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded">+100 Attack</button>
                <button onClick={() => onAllocate('defense')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded">+50 Defense</button>
                <button onClick={() => onAllocate('maxHp')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded">+10 Max HP</button>
            </div>
        </div>
    );
};


const MonsterInfo = ({ monster }) => {
    if (!monster) return null;
    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-inner flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">{monster.name}</h2>
            <pre className="text-red-300 text-center text-sm leading-tight font-mono">{monster.art}</pre>
            <div className="w-full mt-4">
                <div className="flex justify-between text-slate-300"><span>HP:</span><span className="font-mono">{monster.hp} / {monster.maxHp}</span></div>
                <progress value={monster.hp} max={monster.maxHp} className="w-full h-4 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-red-500 [&::-moz-progress-bar]:bg-red-500"></progress>
            </div>
        </div>
    );
};

const ActionLog = ({ log }) => (
    <div className="bg-slate-900 p-4 rounded-lg shadow-inner h-64 flex flex-col">
        <h3 className="text-lg font-bold text-cyan-400 mb-2 border-b border-slate-700 pb-2">Combat Log</h3>
        <div className="flex-grow overflow-y-auto pr-2 text-sm space-y-1 font-mono">
            {log.map((entry, index) => (
                <p key={index} className={`opacity-80 ${entry.type === 'player' ? 'text-green-400' : entry.type === 'monster' ? 'text-red-400' : entry.type === 'item' ? 'text-purple-400' : entry.type === 'gacha' ? RARITIES[entry.rarity]?.color : 'text-yellow-400'}`}>
                    {entry.message}
                </p>
            ))}
        </div>
    </div>
);

const Leaderboard = ({ players }) => (
    <div className="bg-slate-800 p-4 rounded-lg shadow-inner w-full text-slate-300">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-2">Leaderboard</h2>
        <ol className="space-y-2">
            {[...players].sort((a, b) => b.level - a.level || b.xp - a.xp).slice(0, 10).map((p, index) => (
                <li key={p.id} className="flex justify-between items-center bg-slate-700 p-2 rounded">
                    <span className="font-bold">{index + 1}. {p.name || `Hero #${p.id.substring(0,6)}`}</span>
                    <span>Lvl {p.level}</span>
                </li>
            ))}
        </ol>
    </div>
);

const Inventory = ({ player, onAction }) => {
    const { equipment, inventory } = player;

    const renderItem = (item, isEquipped = false, isConsumable = false) => (
        <div key={item.id + Math.random()} className="flex justify-between items-center bg-slate-700 p-2 rounded">
            <div>
                <p className={`font-bold ${RARITIES[item.rarity]?.color}`}>{item.name}</p>
                <p className="text-xs text-slate-400">
                    {item.attack > 0 && `ATK: ${item.attack} `} {item.defense > 0 && `DEF: ${item.defense}`}
                    {isConsumable && item.effect.type === 'heal' && `Heals ${item.effect.amount} HP`}
                    {isConsumable && item.effect.type === 'buff' && `+${item.effect.amount} ${item.effect.stat} for ${item.effect.duration / 1000}s`}
                </p>
            </div>
            <button
                onClick={() => onAction(item, isEquipped)}
                className={`text-xs px-2 py-1 rounded ${isEquipped ? 'bg-yellow-600 hover:bg-yellow-700' : isConsumable ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {isEquipped ? 'Unequip' : isConsumable ? 'Use' : 'Equip'}
            </button>
        </div>
    );

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-purple-400 mb-4 border-b border-slate-700 pb-2">Inventory</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-md font-semibold mb-2 text-slate-400">Equipped</h3>
                    <div className="space-y-2">
                        {equipment.weapon ? renderItem(equipment.weapon, true) : <p className="text-sm text-slate-500">Weapon slot empty</p>}
                        {equipment.armor ? renderItem(equipment.armor, true) : <p className="text-sm text-slate-500">Armor slot empty</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-md font-semibold mb-2 text-slate-400">Backpack</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {inventory.length > 0 ? inventory.map(item => renderItem(item, false, item.type === 'consumable')) : <p className="text-sm text-slate-500">Backpack is empty</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Shop = ({ player, onBuy, onGacha, gachaResult }) => {
    const [tab, setTab] = useState('buy');

    const shopItems = Object.values(ITEMS).filter(item => item.cost);

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-amber-400 mb-4 border-b border-slate-700 pb-2">Shop & Gacha</h2>
            <div className="flex border-b border-slate-700 mb-4">
                <button onClick={() => setTab('buy')} className={`px-4 py-2 ${tab === 'buy' ? 'bg-slate-700' : ''}`}>Buy Items</button>
                <button onClick={() => setTab('gacha')} className={`px-4 py-2 ${tab === 'gacha' ? 'bg-slate-700' : ''}`}>Gacha</button>
            </div>
            {tab === 'buy' && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {shopItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-700 p-2 rounded">
                            <div>
                                <p className={`font-bold ${RARITIES[item.rarity]?.color}`}>{item.name}</p>
                                <p className="text-xs text-slate-400">{item.cost} G</p>
                            </div>
                            <button onClick={() => onBuy(item)} className="text-xs bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded">Buy</button>
                        </div>
                    ))}
                </div>
            )}
            {tab === 'gacha' && (
                <div className="text-center">
                    <p className="mb-4">Spend {GACHA_COST} Gold for a random item!</p>
                    <button onClick={onGacha} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Pull Gacha</button>
                    {gachaResult && (
                        <p className="mt-4">You got: <span className={`font-bold ${RARITIES[gachaResult.rarity]?.color}`}>{gachaResult.name}</span></p>
                    )}
                </div>
            )}
        </div>
    );
};


const WorldChat = ({ db, appId, player, messages }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !player) return;

        const chatCollectionRef = collection(db, `artifacts/${appId}/public/data/chat`);
        await addDoc(chatCollectionRef, {
            text: newMessage,
            playerName: player.name,
            playerId: player.id,
            timestamp: serverTimestamp(),
        });

        setNewMessage('');
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-inner h-96 flex flex-col">
            <h2 className="text-xl font-bold text-purple-400 mb-4 border-b border-slate-700 pb-2">World Chat</h2>
            <div className="flex-grow overflow-y-auto mb-4 pr-2 text-sm space-y-2">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <span className={`font-bold ${msg.playerId === player?.id ? 'text-green-400' : 'text-cyan-400'}`}>
                            {msg.playerName}:
                        </span>
                        <span className="text-slate-300 ml-2">{msg.text}</span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-slate-700 text-slate-200 p-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </form>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [player, setPlayer] = useState(null);
    const [monster, setMonster] = useState(null);
    const [log, setLog] = useState([]);
    const [firebase, setFirebase] = useState({ db: null, auth: null, userId: null });
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [appId, setAppId] = useState('default-app-id');
    const [leaderboard, setLeaderboard] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [gachaResult, setGachaResult] = useState(null);

    // --- Firebase Init ---
    useEffect(() => {
        const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        setAppId(currentAppId);
        
        try {
            if (typeof __firebase_config !== 'undefined') {
                const firebaseConfig = JSON.parse(__firebase_config);
                const app = initializeApp(firebaseConfig);
                const db = getFirestore(app);
                const auth = getAuth(app);
                
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        setFirebase({ db, auth, userId: user.uid });
                    } else {
                        try {
                            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                                await signInWithCustomToken(auth, __initial_auth_token);
                            } else {
                                await signInAnonymously(auth);
                            }
                        } catch (error) {
                            console.error("Firebase sign-in failed:", error);
                        }
                    }
                    setIsAuthReady(true);
                });
            } else {
                console.error("Firebase config missing.");
                setIsAuthReady(true);
            }
        } catch (error) {
            console.error("Firebase init error:", error);
            setIsAuthReady(true);
        }
    }, []);

    // --- Load Player Data ---
    useEffect(() => {
        if (!isAuthReady || !firebase.userId) return;

        const docRef = doc(firebase.db, `artifacts/${appId}/public/data/players`, firebase.userId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setPlayer(docSnap.data());
            } else {
                // Create new player
                const newPlayer = {
                    id: firebase.userId,
                    name: `Hero #${firebase.userId.substring(0,6)}`,
                    level: 1,
                    xp: 0,
                    maxHp: 50,
                    hp: 50,
                    attack: 10,
                    defense: 5,
                    gold: 10000,
                    inventory: [],
                    equipment: { weapon: null, armor: null },
                    statPoints: 0,
                    activeBuffs: [],
                };
                setDoc(docRef, newPlayer).then(() => setPlayer(newPlayer));
            }
        });

        return () => unsubscribe();
    }, [isAuthReady, firebase.userId, appId]);

    // --- Load Leaderboard and Chat Data ---
    useEffect(() => {
        if (!isAuthReady || !firebase.db) return;

        // Leaderboard
        const playersCollectionRef = collection(firebase.db, `artifacts/${appId}/public/data/players`);
        const playersQuery = query(playersCollectionRef);
        const unsubscribePlayers = onSnapshot(playersQuery, (querySnapshot) => {
            const playersData = [];
            querySnapshot.forEach((doc) => {
                playersData.push({ id: doc.id, ...doc.data() });
            });
            setLeaderboard(playersData);
        });

        // Chat
        const chatCollectionRef = collection(firebase.db, `artifacts/${appId}/public/data/chat`);
        const chatQuery = query(chatCollectionRef, orderBy('timestamp', 'desc'), limit(50));
        const unsubscribeChat = onSnapshot(chatQuery, (querySnapshot) => {
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            setChatMessages(messages.reverse());
        });

        return () => {
            unsubscribePlayers();
            unsubscribeChat();
        };
    }, [isAuthReady, firebase.db, appId]);

    const addLog = useCallback((message, type, rarity) => {
        setLog(prevLog => [{ message, type, rarity, time: new Date().toLocaleTimeString() }, ...prevLog.slice(0, 50)]);
    }, []);
    
    // --- Spawn Monster ---
    const spawnMonster = useCallback((playerLevel) => {
        const monsterData = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
        const levelModifier = Math.max(1, playerLevel - 1);
        const hp = Math.floor(monsterData.hp * (1 + levelModifier * 0.2));
        setMonster({ 
            ...monsterData, 
            hp: hp,
            maxHp: hp,
            attack: Math.floor(monsterData.attack * (1 + levelModifier * 0.1)),
            defense: Math.floor(monsterData.defense * (1 + levelModifier * 0.1)),
         });
        addLog(`A wild ${monsterData.name} appears!`, 'system');
    }, [addLog]);

    useEffect(() => {
        if (player && !monster) {
            spawnMonster(player.level);
        }
    }, [monster, player, spawnMonster]);
    
    const calculatedStats = useMemo(() => {
        if (!player) return { attack: 0, defense: 0, maxHp: 0 };
        let { attack, defense, maxHp, equipment, activeBuffs } = player;
        
        if (equipment.weapon) {
            attack += equipment.weapon.attack || 0;
            defense += equipment.weapon.defense || 0;
        }
        if (equipment.armor) {
            attack += equipment.armor.attack || 0;
            defense += equipment.armor.defense || 0;
        }

        activeBuffs?.forEach(buff => {
            if (buff.stat === 'attack') attack += buff.amount;
            if (buff.stat === 'defense') defense += buff.amount;
        });
        
        return { attack, defense, maxHp };
    }, [player]);


    // --- Game Logic: Combat, Rewards, and Timers ---
    useEffect(() => {
        // Main game loop
        const gameLoop = setInterval(() => {
            // Update player state based on combat results
            setPlayer(p => {
                if (!p || p.hp <= 0 || !monster || monster.hp <= 0) return p;
                
                // Monster attacks player
                const monsterDamage = Math.max(1, monster.attack - calculatedStats.defense);
                const newPlayerHp = p.hp - monsterDamage;

                if (newPlayerHp <= 0) {
                    addLog('You have been defeated! Respawning...', 'system');
                    setTimeout(() => {
                        setPlayer(p => p ? { ...p, hp: calculatedStats.maxHp } : null);
                        addLog('You have respawned!', 'system');
                    }, 5000);
                    return { ...p, hp: 0 };
                }
                addLog(`${monster.name} hits you for ${monsterDamage} damage.`, 'monster');
                return { ...p, hp: newPlayerHp };
            });
            
            // Update monster state based on combat results
            setMonster(m => {
                if (!m || m.hp <= 0 || !player || player.hp <= 0) return m;

                // Player attacks monster
                const playerDamage = Math.max(1, calculatedStats.attack - m.defense);
                const newMonsterHp = m.hp - playerDamage;

                if (newMonsterHp <= 0) {
                    // --- Monster Defeat Logic ---
                    addLog(`You defeated the ${monster.name}!`, 'system');
                    addLog(`You gained ${monster.rewardXp} XP and ${monster.rewardGold} Gold.`, 'system');

                    setPlayer(p => {
                        if (!p) return null;
                        
                        let newInventory = [...p.inventory];
                        if (Math.random() < ITEM_DROP_CHANCE) {
                            const itemKeys = Object.keys(ITEMS);
                            const randomItemKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
                            const droppedItem = ITEMS[randomItemKey];
                            newInventory.push(droppedItem);
                            addLog(`The ${monster.name} dropped a ${droppedItem.name}!`, 'item');
                        }

                        let newXp = p.xp + monster.rewardXp;
                        let newLevel = p.level;
                        let statPointsGained = p.statPoints;
                        let leveledUp = false;

                        while (newXp >= getNextLevelXp(newLevel)) {
                            newXp -= getNextLevelXp(newLevel);
                            newLevel++;
                            statPointsGained += 3;
                            leveledUp = true;
                            addLog(`LEVEL UP! You are now level ${newLevel}!`, 'system');
                        }
                        
                        return {
                            ...p,
                            xp: newXp,
                            gold: p.gold + monster.rewardGold,
                            level: newLevel,
                            hp: leveledUp ? calculatedStats.maxHp : p.hp,
                            inventory: newInventory,
                            statPoints: statPointsGained
                        };
                    });
        
                    spawnMonster(player.level);
                    return { ...m, hp: 0 }; // Return monster with 0 hp
                }
                
                addLog(`You hit ${m.name} for ${playerDamage} damage.`, 'player');
                return { ...m, hp: newMonsterHp };
            });

        }, 2200); // Unified combat tick

        // Buff timer check
        const buffInterval = setInterval(() => {
            let buffsExpired = false;
            const now = Date.now();
            setPlayer(p => {
                if (!p || !p.activeBuffs || p.activeBuffs.length === 0) return p;
                
                const updatedBuffs = p.activeBuffs.filter(buff => {
                    if (now > buff.expiresAt) {
                        addLog(`${buff.name} has worn off.`, 'system');
                        buffsExpired = true;
                        return false;
                    }
                    return true;
                });

                if (buffsExpired) {
                    return {...p, activeBuffs: updatedBuffs };
                }
                return p;
            });
        }, 1000);

        return () => {
            clearInterval(gameLoop);
            clearInterval(buffInterval);
        };
    }, [player, monster, calculatedStats, addLog, spawnMonster]);


    const handleStatAllocation = (stat) => {
        setPlayer(p => {
            if (!p || p.statPoints <= 0) return p;
            const newPlayer = { ...p, statPoints: p.statPoints - 1 };
            if (stat === 'attack') newPlayer.attack += 1;
            if (stat === 'defense') newPlayer.defense += 1;
            if (stat === 'maxHp') newPlayer.maxHp += 10;
            return newPlayer;
        });
    };

    const handleInventoryAction = (item, isEquipped) => {
        if (item.type === 'consumable') { // Use item
            setPlayer(p => {
                if (!p) return null;
                // Find first instance of the item to remove
                const itemIndex = p.inventory.findIndex(invItem => invItem.id === item.id);
                if (itemIndex === -1) return p; // Item not found
                
                const newInventory = [...p.inventory];
                newInventory.splice(itemIndex, 1);
                const newPlayer = {...p, inventory: newInventory };

                const effect = item.effect;
                
                if (effect.type === 'heal') {
                    newPlayer.hp = Math.min(calculatedStats.maxHp, newPlayer.hp + effect.amount);
                    addLog(`Used ${item.name}, healed for ${effect.amount} HP.`, 'item');
                }
                if(effect.type === 'buff') {
                    const newBuff = {
                        name: item.name,
                        stat: effect.stat,
                        amount: effect.amount,
                        expiresAt: Date.now() + effect.duration,
                    };
                    addLog(`Used ${item.name}, gained ${effect.amount} ${effect.stat}!`, 'item');
                    newPlayer.activeBuffs = [...(newPlayer.activeBuffs || []), newBuff];
                }
                return newPlayer;
            });
        } else { // Equip/Unequip
            setPlayer(p => {
                if (!p) return null;
                const newPlayer = { ...p, equipment: { ...p.equipment }, inventory: [...p.inventory] };
                if (isEquipped) {
                    newPlayer.inventory.push(item);
                    if (item.type === 'weapon') newPlayer.equipment.weapon = null;
                    if (item.type === 'armor') newPlayer.equipment.armor = null;
                } else {
                    const currentItem = newPlayer.equipment[item.type];
                    if (currentItem) newPlayer.inventory.push(currentItem);
                    
                    // Find and remove first instance of item from inventory
                    const itemIndex = newPlayer.inventory.findIndex(invItem => invItem.id === item.id);
                    if(itemIndex !== -1) {
                         newPlayer.inventory.splice(itemIndex, 1);
                         newPlayer.equipment[item.type] = item;
                    }
                }
                return newPlayer;
            });
        }
    };
    
    const handleBuyItem = (item) => {
         setPlayer(p => {
            if (p.gold < item.cost) {
                addLog("Not enough gold!", "system");
                return p;
            }
            addLog(`Bought ${item.name} for ${item.cost} G.`, 'item');
            return {
                ...p,
                gold: p.gold - item.cost,
                inventory: [...p.inventory, item]
            };
        });
    };

    const handleGacha = () => {
        if (!player || player.gold < GACHA_COST) {
            addLog("Not enough gold for Gacha!", "system");
            return;
        }

        const totalWeight = Object.values(RARITIES).reduce((sum, rarity) => sum + rarity.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedRarity;
        for (const rarityKey in RARITIES) {
            const rarity = RARITIES[rarityKey];
            if (random < rarity.weight) {
                selectedRarity = rarityKey;
                break;
            }
            random -= rarity.weight;
        }

        const possibleItems = Object.values(ITEMS).filter(item => item.rarity === selectedRarity);
        if (possibleItems.length === 0) {
            addLog("Gacha failed to find an item, try again!", "system");
            return;
        }
        const wonItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];

        setGachaResult(wonItem);
        addLog(`[Gacha] You pulled a [${RARITIES[wonItem.rarity].name}] ${wonItem.name}!`, 'gacha', wonItem.rarity);
        
        setPlayer(p => ({
            ...p,
            gold: p.gold - GACHA_COST,
            inventory: [...p.inventory, wonItem]
        }));
    };

    // --- Save Player Data ---
    useEffect(() => {
        if (!player || !isAuthReady || !firebase.userId) return;
        
        const handler = setTimeout(() => {
            const docRef = doc(firebase.db, `artifacts/${appId}/public/data/players`, firebase.userId);
            setDoc(docRef, player, { merge: true });
        }, 1000);

        return () => clearTimeout(handler);
    }, [player, isAuthReady, firebase.userId, appId]);

    if (!player) {
        return <div className="bg-slate-900 text-white w-full h-screen flex items-center justify-center font-bold text-xl">Loading Game...</div>
    }

    return (
        <div className="bg-slate-900 text-white font-sans w-full min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-wider">Idle MMO RPG</h1>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column */}
                    <aside className="lg-col-span-1 space-y-6">
                        <PlayerStats player={player} calculatedStats={calculatedStats} />
                        <StatAllocation player={player} onAllocate={handleStatAllocation} />
                        <Leaderboard players={leaderboard} />
                    </aside>

                    {/* Center Column */}
                    <main className="lg-col-span-2 space-y-6">
                        <MonsterInfo monster={monster} />
                        <ActionLog log={log} />
                    </main>

                    {/* Right Column (Placeholder) */}
                    <aside className="lg-col-span-1 space-y-6">
                        <Inventory player={player} onAction={handleInventoryAction} />
                        <Shop player={player} onBuy={handleBuyItem} onGacha={handleGacha} gachaResult={gachaResult} />
                        <WorldChat db={firebase.db} appId={appId} player={player} messages={chatMessages} />
                    </aside>
                </div>
                 <footer className="text-center mt-8 text-slate-500 text-sm">
                    <p>Session ID: <span className="font-mono bg-slate-800 p-1 rounded">{appId}</span></p>
                </footer>
            </div>
        </div>
    );
}

