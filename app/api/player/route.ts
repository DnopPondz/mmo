import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PLAYER_COLLECTION, createDefaultPlayer } from '@/lib/player';
import type { Player } from '@/lib/types';

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId');
  if (!playerId) {
    return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
  }

  const db = await getDatabase();
  const collection = db.collection<Player>(PLAYER_COLLECTION);
  let player = await collection.findOne({ id: playerId });

  if (!player) {
    player = createDefaultPlayer(playerId);
    const now = new Date().toISOString();
    await collection.insertOne({ ...player, createdAt: now, updatedAt: now });
  }

  const { _id, ...rest } = player as Player & { _id?: unknown };
  return NextResponse.json({ player: rest });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const player: Player | undefined = body.player;
  if (!player || !player.id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const db = await getDatabase();
  const collection = db.collection<Player>(PLAYER_COLLECTION);
  const now = new Date().toISOString();
  await collection.updateOne(
    { id: player.id },
    { $set: { ...player, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );

  return NextResponse.json({ status: 'ok' });
}
