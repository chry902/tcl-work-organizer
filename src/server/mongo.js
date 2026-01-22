import mongoose from "mongoose";

// Astro/Vite: env disponibili in import.meta.env
const MONGODB_URI = import.meta.env.MONGODB_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI mancante. Mettila in .env (root) e riavvia il server.");
}

let cached = globalThis._mongoose;

if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
