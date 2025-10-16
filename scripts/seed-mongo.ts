import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Missing MONGODB_URI. Copy .env.example to .env.local and fill in your credentials.');
  process.exit(1);
}

const [{ ensureMongoSetup, getDatabase, getDatabaseName }, { createDefaultPlayer, PLAYER_COLLECTION }, { CHAT_COLLECTION }] = await Promise.all([
  import('../lib/mongodb'),
  import('../lib/player'),
  import('../lib/chat')
]);

await ensureMongoSetup();
const db = await getDatabase();

const demoPlayerId = 'demo-player';
const now = new Date().toISOString();
const demoPlayer = {
  ...createDefaultPlayer(demoPlayerId),
  createdAt: now,
  updatedAt: now
};

await db.collection(PLAYER_COLLECTION).updateOne(
  { id: demoPlayerId },
  { $setOnInsert: demoPlayer },
  { upsert: true }
);

await db.collection(CHAT_COLLECTION).updateOne(
  { _id: 'seed-welcome-message' },
  {
    $set: {
      playerId: demoPlayerId,
      playerName: demoPlayer.name,
      text: 'Welcome to the Idle MMO! Your MongoDB connection is ready to go.',
      createdAt: now
    }
  },
  { upsert: true }
);

console.log(`Seeded MongoDB database "${getDatabaseName() ?? '(default)'}" with a demo player and chat message.`);
console.log('You can now start the development server with `bun dev`.');

process.exit(0);
