'use client';

import clsx from 'clsx';
import type { Item, Player } from '@/lib/types';
import { RARITIES } from '@/lib/constants';

interface InventoryCardProps {
  player: Player;
  onAction: (item: Item, isEquipped: boolean) => void;
}

const buttonStyle = 'rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:scale-105';

export function InventoryCard({ player, onAction }: InventoryCardProps) {
  const renderItem = (item: Item, isEquipped = false, isConsumable = false) => (
    <div
      key={`${item.id}-${isEquipped ? 'eq' : 'inv'}-${Math.random()}`}
      className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2 shadow-inner"
    >
      <div>
        <p className={clsx('font-semibold', RARITIES[item.rarity]?.color)}>{item.name}</p>
        <p className="text-xs text-slate-500">
          {item.attack ? `ATK +${item.attack} ` : ''}
          {item.defense ? `DEF +${item.defense}` : ''}
          {isConsumable && item.effect?.type === 'heal' && `Heals ${item.effect.amount}`}
          {isConsumable && item.effect?.type === 'buff' && `Buff ${item.effect.stat} +${item.effect.amount}`}
        </p>
      </div>
      <button
        onClick={() => onAction(item, isEquipped)}
        className={clsx(buttonStyle, {
          'bg-amber-500 hover:bg-amber-400': isEquipped,
          'bg-indigo-500 hover:bg-indigo-400': isConsumable && !isEquipped,
          'bg-emerald-500 hover:bg-emerald-400': !isConsumable && !isEquipped
        })}
      >
        {isEquipped ? 'Unequip' : isConsumable ? 'Use' : 'Equip'}
      </button>
    </div>
  );

  return (
    <section className="glass-panel space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h3 className="font-display text-xl text-purple-200">คลังไอเทม</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Inventory</span>
      </header>

      <div className="space-y-4 text-sm">
        <div>
          <h4 className="mb-2 text-xs uppercase tracking-[0.4em] text-slate-500">Equipped</h4>
          <div className="space-y-2">
            {player.equipment.weapon
              ? renderItem(player.equipment.weapon, true)
              : <p className="text-xs text-slate-500">ยังไม่มีอาวุธสวมใส่</p>}
            {player.equipment.armor
              ? renderItem(player.equipment.armor, true)
              : <p className="text-xs text-slate-500">ยังไม่มีเกราะสวมใส่</p>}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs uppercase tracking-[0.4em] text-slate-500">Backpack</h4>
          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {player.inventory.length > 0
              ? player.inventory.map((item) => renderItem(item, false, item.type === 'consumable'))
              : <p className="text-xs text-slate-500">กระเป๋าว่างเปล่า</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
