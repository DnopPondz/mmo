'use client';

import type { Player } from '@/lib/types';

interface LeaderboardCardProps {
  players: Player[];
}

export function LeaderboardCard({ players }: LeaderboardCardProps) {
  const topPlayers = [...players]
    .sort((a, b) => (b.level - a.level) || (b.xp - a.xp))
    .slice(0, 8);

  return (
    <section className="glass-panel space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-400">Global</p>
          <h3 className="font-display text-xl text-cyan-200">ตารางอันดับ</h3>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Top 8</span>
      </header>

      <ol className="space-y-2 text-sm">
        {topPlayers.length === 0 && <p className="text-slate-500">ยังไม่มีนักผจญภัยคนอื่น เข้าร่วมเป็นคนแรก!</p>}
        {topPlayers.map((player, index) => (
          <li
            key={player.id}
            className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2 shadow-inner"
          >
            <div>
              <span className="mr-2 font-mono text-xs text-slate-500">#{index + 1}</span>
              <span className="font-semibold text-slate-200">{player.name}</span>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Lv {player.level}</p>
              <p className="font-mono text-[10px] text-slate-500">XP {player.xp}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
