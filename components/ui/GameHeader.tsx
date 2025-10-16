'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';

export function GameHeader() {
  return (
    <header className="relative mb-10 overflow-hidden rounded-3xl border border-cyan-500/10 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-cyan-900/20 p-10 shadow-neon">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
            <SparklesIcon className="h-4 w-4" />
            Idle Adventure
          </span>
          <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">
            Idle MMO RPG
          </h1>
          <p className="text-lg text-slate-300">
            สร้างตำนานของคุณในโลกแฟนตาซีแบบไม่ต้องเฝ้าหน้าจอ นำฮีโร่ออกล่ามอนสเตอร์
            สะสมสมบัติ และประชันอันดับกับผู้เล่นจากทั่วโลก
          </p>
        </div>
        <div className="grid gap-4 text-sm text-slate-300">
          <div className="rounded-2xl bg-slate-950/70 px-4 py-3 text-right shadow-inner">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Powered by</p>
            <p className="font-semibold text-cyan-200">Bun · Next.js · MongoDB · Vercel</p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 px-4 py-3 text-right shadow-inner">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Status</p>
            <p className="font-semibold text-emerald-300">ออนไลน์</p>
          </div>
        </div>
      </div>
    </header>
  );
}
