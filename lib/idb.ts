import { openDB, type IDBPDatabase, type DBSchema } from "idb"

export type Destination = {
  id?: number
  name: string
  notes?: string
  dateAdded: string
  visited: boolean
}

const DATABASE_NAME = "travelWishlistDB"
const DATABASE_VERSION = 1
const STORE_NAME = "destinations"

interface TravelDB extends DBSchema {
  destinations: {
    key: number
    value: Destination
    indexes: {
      by_dateAdded: string
      by_name: string
      by_visited: IDBValidKey
    }
  }
}

let dbPromise: Promise<IDBPDatabase<TravelDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TravelDB>(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          })
          store.createIndex("by_dateAdded", "dateAdded")
          store.createIndex("by_name", "name")
          store.createIndex("by_visited", "visited")
        }
      },
    })
  }
  return dbPromise
}

export async function addDestination(
  name: string,
  notes?: string
): Promise<Destination> {
  const db = await getDB()
  const item: Destination = {
    name: name.trim(),
    notes: (notes ?? "").trim() || undefined,
    dateAdded: new Date().toISOString(),
    visited: false,
  }
  const id = await db.add(STORE_NAME, item)
  return { ...item, id }
}

export async function getDestinations(): Promise<Destination[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  return all.sort((a, b) => a.dateAdded.localeCompare(b.dateAdded))
}

export async function updateDestination(
  updated: Destination
): Promise<Destination> {
  if (updated.id == null) throw new Error("Destination id is required")
  const db = await getDB()
  await db.put(STORE_NAME, updated)
  return updated
}

export async function deleteDestination(id: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function setVisited(id: number, visited: boolean): Promise<void> {
  const db = await getDB()
  const item = await db.get(STORE_NAME, id)
  if (!item) throw new Error("Destination not found")
  await db.put(STORE_NAME, { ...item, visited })
}
