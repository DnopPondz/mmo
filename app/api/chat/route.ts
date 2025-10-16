import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { addChatMessageToMemory, listChatFromMemory } from '@/lib/inMemoryStore';
import { CHAT_COLLECTION, CHAT_LIMIT } from '@/lib/chat';
import type { ChatMessage } from '@/lib/types';

export async function GET() {
  if (!process.env.MONGODB_URI) {
    const messages = listChatFromMemory();
    return NextResponse.json({ messages });
  }

  const db = await getDatabase();
  const collection = db.collection<ChatMessage>(CHAT_COLLECTION);
  const messages = await collection
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(CHAT_LIMIT)
    .toArray();

  return NextResponse.json({ messages: messages.reverse() });
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

  if (!process.env.MONGODB_URI) {
    addChatMessageToMemory(message);
    return NextResponse.json({ status: 'ok' });
  }

  const db = await getDatabase();
  const collection = db.collection<ChatMessage>(CHAT_COLLECTION);
  await collection.insertOne(message);

  return NextResponse.json({ status: 'ok' });
}
