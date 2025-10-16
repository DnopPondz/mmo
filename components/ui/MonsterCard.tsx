'use client';

import { ProgressBar } from './ProgressBar';
import type { Monster } from '@/lib/types';

interface MonsterCardProps {
  monster: Monster | null;
}

export function MonsterCard({ monster }: MonsterCardProps) {
  if (!monster) {
    return (
      <section className="glass-panel flex h-full items-center justify-center p-8 text-center text-slate-400">
        <p>กำลังค้นหาศัตรู...</p>
      </section>
    );
  }

  return (
    <section className="glass-panel grid gap-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">Encounter</p>
          <h2 className="font-display text-3xl text-rose-400">{monster.name}</h2>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p>ATK: <span className="text-rose-200">{monster.attack}</span></p>
          <p>DEF: <span className="text-sky-200">{monster.defense}</span></p>
        </div>
      </header>

      <pre className="mx-auto max-w-full whitespace-pre-wrap text-center font-mono text-sm leading-tight text-rose-200">
        {monster.art}
      </pre>

      <div>
        <div className="mb-2 flex justify-between text-xs uppercase tracking-widest text-slate-400">
          <span>HP</span>
          <span className="font-mono text-rose-200">{monster.hp} / {monster.maxHp}</span>
        </div>
        <ProgressBar value={monster.hp} max={monster.maxHp} color="from-rose-500 to-pink-500" height="h-4" />
      </div>
    </section>
  );
}
