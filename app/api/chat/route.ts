import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getMongoLoadError, isMongoConfigured } from '@/lib/mongodb';
import { addChatMessageToMemory, listChatFromMemory } from '@/lib/inMemoryStore';
import { CHAT_COLLECTION, CHAT_LIMIT } from '@/lib/chat';
import type { ChatMessage } from '@/lib/types';

export async function GET() {
  if (isMongoConfigured()) {
    try {
      const db = await getDatabase();
      const collection = db.collection<ChatMessage>(CHAT_COLLECTION);
      const messages = await collection
        .find({ _id: { $ne: 'seed-welcome-message' } }, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(CHAT_LIMIT)
        .toArray();

      return NextResponse.json({ messages: messages.reverse() });
    } catch (error) {
      console.error('MongoDB unavailable for GET /api/chat, falling back to memory.', error);
    }
  } else {
    const loadError = getMongoLoadError();
    if (loadError) {
      console.error('MongoDB driver failed to load, falling back to memory.', loadError);
    }
  }

  const messages = listChatFromMemory();
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const text: string = body.text;
  const playerId: string = body.playerId;
  const playerName: string = body.playerName;

  if (!text || !playerId || !playerName) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const trimmed = text.toString().slice(0, 240);
  const message: ChatMessage = {
    playerId,
    playerName,
    text: trimmed,
    createdAt: new Date().toISOString()
  };

  if (isMongoConfigured()) {
    try {
      const db = await getDatabase();
      const collection = db.collection<ChatMessage>(CHAT_COLLECTION);
      await collection.insertOne(message);

      return NextResponse.json({ status: 'ok' });
    } catch (error) {
      console.error('MongoDB unavailable for POST /api/chat, falling back to memory.', error);
    }
  } else {
    const loadError = getMongoLoadError();
    if (loadError) {
      console.error('MongoDB driver failed to load, falling back to memory.', loadError);
    }
  }

  addChatMessageToMemory(message);
  return NextResponse.json({ status: 'ok' });
}
