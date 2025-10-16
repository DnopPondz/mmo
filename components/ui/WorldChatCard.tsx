'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/lib/types';

interface WorldChatCardProps {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void> | void;
  currentPlayerId?: string | null;
}

export function WorldChatCard({ messages, onSend, currentPlayerId }: WorldChatCardProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) return;
    await onSend(text.trim());
    setText('');
  };

  return (
    <section className="glass-panel flex h-96 flex-col p-6">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl text-purple-200">World Chat</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Global</span>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto pr-2 text-sm">
        {messages.map((message) => (
          <div
            key={message.createdAt + message.playerId}
            className={`rounded-xl px-3 py-2 shadow-inner ${message.playerId === currentPlayerId ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-900/60 text-slate-200'}`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-300">{message.playerName}</span>
              <span className="font-mono text-[10px]">{new Date(message.createdAt).toLocaleTimeString()}</span>
            </div>
            <p>{message.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-3">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="ส่งข้อความถึงผองเพื่อน..."
          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 shadow-inner focus:border-cyan-400 focus:outline-none"
        />
      </form>
    </section>
  );
}
