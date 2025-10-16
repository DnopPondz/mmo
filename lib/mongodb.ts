import type { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('MONGODB_URI is not set. API routes will fall back to the in-memory store.');
}

let clientPromise: Promise<MongoClient> | null = null;
let clientLoadError: Error | null = null;

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
  const client = await loadMongoClient();
  return client.db();
}

export function getMongoLoadError() {
  return clientLoadError;
}
