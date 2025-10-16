import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PLAYER_COLLECTION } from '@/lib/player';
import type { Player } from '@/lib/types';

export async function GET() {
  const db = await getDatabase();
  const collection = db.collection<Player>(PLAYER_COLLECTION);
  const players = await collection
    .find({}, { projection: { _id: 0 } })
    .sort({ level: -1, xp: -1 })
    .limit(25)
    .toArray();

  return NextResponse.json({ players });
}
