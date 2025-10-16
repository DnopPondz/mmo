'use client';

import type { Player } from '@/lib/types';

interface StatAllocationCardProps {
  player: Player;
  onAllocate: (stat: 'attack' | 'defense' | 'maxHp') => void;
}

const STAT_CONFIG = [
  { key: 'attack', label: '+1 Attack', color: 'from-rose-500 to-orange-500' },
  { key: 'defense', label: '+1 Defense', color: 'from-sky-500 to-cyan-500' },
  { key: 'maxHp', label: '+10 Max HP', color: 'from-emerald-500 to-lime-500' }
] as const;

export function StatAllocationCard({ player, onAllocate }: StatAllocationCardProps) {
  if (player.statPoints <= 0) return null;

  return (
    <section className="glass-panel p-6 space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-amber-400">Level up!</p>
        <h3 className="font-display text-xl text-amber-200">จัดสรรค่าสถานะ</h3>
        <p className="text-sm text-slate-400">คุณมี {player.statPoints} แต้มให้ใช้อัปเกรดตัวละคร</p>
      </header>

      <div className="grid gap-3">
        {STAT_CONFIG.map((stat) => (
          <button
            key={stat.key}
            onClick={() => onAllocate(stat.key)}
            className={`rounded-xl bg-gradient-to-r ${stat.color} py-2 text-sm font-semibold text-white shadow-neon transition hover:scale-[1.02]`}
          >
            {stat.label}
          </button>
        ))}
      </div>
    </section>
  );
}
