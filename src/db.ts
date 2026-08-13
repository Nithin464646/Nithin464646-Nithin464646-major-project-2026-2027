/**
 * MongoDB Atlas Connection Module
 * Provides a singleton MongoClient connection for the AgriConnect server.
 *
 * Usage:
 *   import { getDb } from './src/db.js';
 *   const db = await getDb();
 *   const users = db.collection('users');
 */

import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "agriconnect";

if (!MONGODB_URI) {
  console.warn("[MongoDB] MONGODB_URI not set in .env — database features disabled.");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDb(): Promise<Db | null> {
  if (!MONGODB_URI) return null;
  if (db) return db;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[MongoDB] Connected to Atlas — database: ${DB_NAME}`);
    return db;
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err);
    return null;
  }
}

export async function getDb(): Promise<Db | null> {
  if (db) return db;
  return connectDb();
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[MongoDB] Connection closed.");
  }
}
