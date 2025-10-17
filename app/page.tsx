'use client';

import { PlayerCard } from '@/components/ui/PlayerCard';
import { StatAllocationCard } from '@/components/ui/StatAllocationCard';
import { LeaderboardCard } from '@/components/ui/LeaderboardCard';
import { MonsterCard } from '@/components/ui/MonsterCard';
import { ActionLog } from '@/components/ui/ActionLog';
import { InventoryCard } from '@/components/ui/InventoryCard';
import { ShopCard } from '@/components/ui/ShopCard';
import { WorldChatCard } from '@/components/ui/WorldChatCard';
import { GameHeader } from '@/components/ui/GameHeader';
import { GameFooter } from '@/components/ui/GameFooter';
import { useGameEngine } from '@/hooks/useGameEngine';

export default function HomePage() {
  const {
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
    sendChatMessage
  } = useGameEngine();

  if (isLoading || !player) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="glass-panel px-10 py-6 text-center">
          <p className="font-display text-2xl text-cyan-200">กำลังเปิดประตูสู่โลก MMO...</p>
          <p className="text-sm text-slate-500">ขอเพียงครู่เดียว</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-10">
      <GameHeader />

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-1">
          <PlayerCard player={player} calculatedStats={calculatedStats} />
          <StatAllocationCard player={player} onAllocate={handleStatAllocation} />
          <LeaderboardCard players={leaderboard} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <MonsterCard monster={monster} />
          <ActionLog log={log} />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <InventoryCard player={player} onAction={handleInventoryAction} />
          <ShopCard player={player} onBuy={handleBuyItem} onGacha={handleGacha} gachaResult={gachaResult} />
          <WorldChatCard messages={chatMessages} onSend={sendChatMessage} currentPlayerId={playerId} />
        </div>
      </div>

      <GameFooter />
    </main>
  );
}
