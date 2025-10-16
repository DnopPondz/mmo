'use client';

import { getNextLevelXp } from '@/lib/constants';
import type { Player } from '@/lib/types';
import { ProgressBar } from './ProgressBar';

interface PlayerCardProps {
  player: Player;
  calculatedStats: { attack: number; defense: number; maxHp: number };
}

export function PlayerCard({ player, calculatedStats }: PlayerCardProps) {
  return (
    <section className="glass-panel p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your hero</p>
          <h2 className="font-display text-2xl text-cyan-300">{player.name}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Level</p>
          <p className="text-3xl font-display text-emerald-400">{player.level}</p>
        </div>
      </header>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-300">
            <span>HP</span>
            <span className="font-mono text-rose-300">{player.hp} / {calculatedStats.maxHp}</span>
          </div>
          <ProgressBar value={player.hp} max={calculatedStats.maxHp} color="from-rose-500 to-orange-400" />
        </div>
        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-300">
            <span>XP</span>
            <span className="font-mono text-amber-300">{player.xp} / {getNextLevelXp(player.level)}</span>
          </div>
          <ProgressBar value={player.xp} max={getNextLevelXp(player.level)} color="from-amber-400 to-yellow-300" />
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-xl bg-slate-800/50 p-3 shadow-inner">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Attack</dt>
            <dd className="text-lg font-semibold text-rose-300">{calculatedStats.attack}</dd>
            <p className="text-[10px] text-slate-500">Base {player.attack}</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 shadow-inner">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Defense</dt>
            <dd className="text-lg font-semibold text-sky-300">{calculatedStats.defense}</dd>
            <p className="text-[10px] text-slate-500">Base {player.defense}</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 shadow-inner">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Gold</dt>
            <dd className="text-lg font-semibold text-amber-300">{player.gold.toLocaleString()} G</dd>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 shadow-inner">
            <dt className="text-xs uppercase tracking-wider text-slate-500">Stat Points</dt>
            <dd className="text-lg font-semibold text-emerald-300">{player.statPoints}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
