import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const g = globalThis as unknown as { mongooseCache?: MongooseCache };

const cache: MongooseCache = g.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!g.mongooseCache) {
  g.mongooseCache = cache;
}

export default async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }

  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
