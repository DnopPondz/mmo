import { NextResponse } from 'next/server';
import { getDatabase, getMongoLoadError, isMongoConfigured } from '@/lib/mongodb';
import { listPlayersFromMemory } from '@/lib/inMemoryStore';
import { PLAYER_COLLECTION } from '@/lib/player';
import type { Player } from '@/lib/types';

export async function GET() {
  if (isMongoConfigured()) {
    try {
      const db = await getDatabase();
      const collection = db.collection<Player>(PLAYER_COLLECTION);
      const players = await collection
        .find({}, { projection: { _id: 0 } })
        .sort({ level: -1, xp: -1 })
        .limit(25)
        .toArray();

      return NextResponse.json({ players });
    } catch (error) {
      console.error('MongoDB unavailable for GET /api/leaderboard, falling back to memory.', error);
    }
  } else {
    const loadError = getMongoLoadError();
    if (loadError) {
      console.error('MongoDB driver failed to load, falling back to memory.', loadError);
    }
  }

  const players = listPlayersFromMemory()
    .slice()
    .sort((a, b) => (b.level !== a.level ? b.level - a.level : b.xp - a.xp))
    .slice(0, 25);
  return NextResponse.json({ players });
}
