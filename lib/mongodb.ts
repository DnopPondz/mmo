import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.warn('MONGODB_URI is not set. API routes depending on MongoDB will fail.');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {};

let clientPromise: Promise<MongoClient> | undefined;

if (!global._mongoClientPromise && uri) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function getMongoClient() {
  if (!clientPromise) {
    throw new Error('MongoDB client not initialised. Ensure MONGODB_URI is configured.');
  }
  return clientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db();
}
