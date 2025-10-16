import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getMongoLoadError, isMongoConfigured } from '@/lib/mongodb';
import { getPlayerFromMemory, upsertPlayerInMemory } from '@/lib/inMemoryStore';
import { PLAYER_COLLECTION, createDefaultPlayer } from '@/lib/player';
import type { Player } from '@/lib/types';

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId');
  if (!playerId) {
    return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
  }

  if (isMongoConfigured()) {
    try {
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
    } catch (error) {
      console.error('MongoDB unavailable for GET /api/player, falling back to memory.', error);
    }
  } else {
    const loadError = getMongoLoadError();
    if (loadError) {
      console.error('MongoDB driver failed to load, falling back to memory.', loadError);
    }
  }

  const player = getPlayerFromMemory(playerId);
  return NextResponse.json({ player });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const player: Player | undefined = body.player;
  if (!player || !player.id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (isMongoConfigured()) {
    try {
      const db = await getDatabase();
      const collection = db.collection<Player>(PLAYER_COLLECTION);
      const now = new Date().toISOString();
      await collection.updateOne(
        { id: player.id },
        { $set: { ...player, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true }
      );

      return NextResponse.json({ status: 'ok' });
    } catch (error) {
      console.error('MongoDB unavailable for PUT /api/player, falling back to memory.', error);
    }
  } else {
    const loadError = getMongoLoadError();
    if (loadError) {
      console.error('MongoDB driver failed to load, falling back to memory.', loadError);
    }
  }

  upsertPlayerInMemory(player);
  return NextResponse.json({ status: 'ok' });
}
