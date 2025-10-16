import type { Db, MongoClient } from 'mongodb';
import { CHAT_COLLECTION, CHAT_LIMIT } from './chat';
import { PLAYER_COLLECTION } from './player';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? 'idle-mmo';

if (!uri) {
  console.warn('MONGODB_URI is not set. API routes will fall back to the in-memory store.');
}

let clientPromise: Promise<MongoClient> | null = null;
let clientLoadError: Error | null = null;
let databasePromise: Promise<Db> | null = null;
let initializationPromise: Promise<void> | null = null;

export function isMongoConfigured() {
  return Boolean(uri);
}

async function loadMongoClient() {
  if (!isMongoConfigured()) {
    throw new Error('MongoDB client not initialised. Ensure MONGODB_URI is configured.');
  }

  if (clientLoadError) {
    throw clientLoadError;
  }

  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(uri!);
        const connection = await client.connect();
        clientLoadError = null;
        return connection;
      } catch (error) {
        clientLoadError = error instanceof Error ? error : new Error(String(error));
        clientPromise = null;
        throw clientLoadError;
      }
    })();
  }

  return clientPromise;
}

export async function getMongoClient() {
  return loadMongoClient();
}

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const client = await loadMongoClient();
      const database = client.db(dbName);
      await ensureMongoCollections(database);
      return database;
    })().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

export function getMongoLoadError() {
  return clientLoadError;
}

async function ensureMongoCollections(db: Db) {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const collections = await db
        .listCollections({}, { nameOnly: true })
        .toArray();
      const existing = new Set(collections.map((collection) => collection.name));

      if (!existing.has(PLAYER_COLLECTION)) {
        await db.createCollection(PLAYER_COLLECTION);
      }

      await db.collection(PLAYER_COLLECTION).createIndex({ id: 1 }, { unique: true });

      if (!existing.has(CHAT_COLLECTION)) {
        await db.createCollection(CHAT_COLLECTION, {
          capped: true,
          size: 512 * 1024,
          max: CHAT_LIMIT * 4
        });
      }

      await db.collection(CHAT_COLLECTION).createIndex({ createdAt: -1 });
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export async function ensureMongoSetup() {
  if (!isMongoConfigured()) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI before running the setup.');
  }

  await getDatabase();
}

export function getDatabaseName() {
  return dbName;
}
