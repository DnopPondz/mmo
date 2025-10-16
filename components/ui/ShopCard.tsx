'use client';

import { useState } from 'react';
import { GACHA_COST, ITEMS, RARITIES } from '@/lib/constants';
import type { Item, Player } from '@/lib/types';

interface ShopCardProps {
  player: Player;
  onBuy: (item: Item) => void;
  onGacha: () => void;
  gachaResult: Item | null;
}

export function ShopCard({ player, onBuy, onGacha, gachaResult }: ShopCardProps) {
  const [tab, setTab] = useState<'buy' | 'gacha'>('buy');
  const shopItems = Object.values(ITEMS).filter((item) => item.cost);

  return (
    <section className="glass-panel space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-400">Merchant</p>
          <h3 className="font-display text-xl text-amber-200">ร้านค้ามหาเวทย์</h3>
        </div>
        <div className="rounded-full bg-slate-900/60 px-3 py-1 text-xs text-amber-200 shadow-inner">
          Gold: {player.gold.toLocaleString()}
        </div>
      </header>

      <div className="flex rounded-full bg-slate-900/60 p-1 text-sm shadow-inner">
        <button
          onClick={() => setTab('buy')}
          className={`flex-1 rounded-full px-3 py-1 font-semibold transition ${tab === 'buy' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}
        >
          ซื้อไอเทม
        </button>
        <button
          onClick={() => setTab('gacha')}
          className={`flex-1 rounded-full px-3 py-1 font-semibold transition ${tab === 'gacha' ? 'bg-purple-500 text-white' : 'text-slate-400'}`}
        >
          สุ่มกาชา
        </button>
      </div>

      {tab === 'buy' && (
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1 text-sm">
          {shopItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2 shadow-inner">
              <div>
                <p className={`font-semibold ${RARITIES[item.rarity]?.color}`}>{item.name}</p>
                <p className="text-xs text-slate-500">{item.cost?.toLocaleString()} G</p>
              </div>
              <button
                onClick={() => onBuy(item)}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:scale-105 hover:bg-amber-400"
              >
                ซื้อ
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'gacha' && (
        <div className="space-y-3 text-center text-sm">
          <p className="text-slate-300">ใช้ {GACHA_COST} ทองเพื่อสุ่มไอเทมระดับเทพ!</p>
          <button
            onClick={onGacha}
            className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-semibold text-white shadow-neon transition hover:scale-105"
          >
            สุ่มเดี๋ยวนี้
          </button>
          {gachaResult && (
            <p className="text-sm text-slate-200">
              คุณได้รับ <span className={`font-semibold ${RARITIES[gachaResult.rarity]?.color}`}>{gachaResult.name}</span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
