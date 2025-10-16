'use client';

import clsx from 'clsx';
import type { LogEntry } from '@/lib/types';
import { RARITIES } from '@/lib/constants';

interface ActionLogProps {
  log: LogEntry[];
}

export function ActionLog({ log }: ActionLogProps) {
  return (
    <section className="glass-panel flex h-80 flex-col p-6">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl text-cyan-200">บันทึกการต่อสู้</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Chronicle</span>
      </header>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto pr-2 text-sm">
        {log.length === 0 && <p className="text-slate-500">บันทึกยังว่างเปล่า เริ่มต่อสู้เพื่อสร้างเรื่องราว!</p>}
        {log.map((entry, index) => (
          <p
            key={`${entry.time}-${index}`}
            className={clsx('rounded-lg border border-transparent bg-slate-900/60 px-3 py-2 font-mono text-xs shadow-inner', {
              'border-emerald-500/30 text-emerald-300': entry.type === 'player',
              'border-rose-500/30 text-rose-300': entry.type === 'monster',
              'border-purple-500/30 text-purple-300': entry.type === 'item',
              'border-yellow-500/30 text-amber-200': entry.type === 'system',
              [RARITIES[entry.rarity!]?.color ?? 'text-cyan-200']: entry.type === 'gacha'
            })}
          >
            <span className="mr-2 text-[10px] text-slate-500">{entry.time}</span>
            {entry.message}
          </p>
        ))}
      </div>
    </section>
  );
}
