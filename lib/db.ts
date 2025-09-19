export type Destination = {
  id?: number
  name: string
  notes?: string
  dateAdded: string
  visited: boolean
  imageUrl?: string
}

const DATABASE_NAME = "travelWishlistDB"
const DATABASE_VERSION = 1
const STORE_NAME = "destinations"

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        })
        // Useful indexes for future stretch goals
        store.createIndex("by_dateAdded", "dateAdded")
        store.createIndex("by_name", "name")
        store.createIndex("by_visited", "visited")
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => void | T | Promise<T>
): Promise<T> {
  const db = await openDatabase()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)
    let result: any

    const maybeResolve = async () => {
      try {
        const value = await result
        resolve(value)
      } catch (err) {
        reject(err)
      }
    }

    try {
      result = fn(store)
    } catch (err) {
      reject(err)
      return
    }

    tx.oncomplete = () => maybeResolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function addDestination(
  name: string,
  notes?: string,
  imageUrl?: string
): Promise<Destination> {
  const newItem: Destination = {
    name: name.trim(),
    notes: (notes ?? "").trim() || undefined,
    dateAdded: new Date().toISOString(),
    visited: false,
    imageUrl: (imageUrl ?? "").trim() || undefined,
  }

  return withStore("readwrite", (store) => {
    const req = store.add(newItem)
    return new Promise<Destination>((resolve, reject) => {
      req.onsuccess = () => resolve({ ...newItem, id: req.result as number })
      req.onerror = () => reject(req.error)
    })
  })
}

export async function getDestinations(): Promise<Destination[]> {
  return withStore("readonly", (store) => {
    const req = store.getAll()
    return new Promise<Destination[]>((resolve, reject) => {
      req.onsuccess = () => {
        const items = (req.result as Destination[]).sort((a, b) =>
          a.dateAdded.localeCompare(b.dateAdded)
        )
        resolve(items)
      }
      req.onerror = () => reject(req.error)
    })
  })
}

export async function updateDestination(
  updated: Destination
): Promise<Destination> {
  if (updated.id == null) throw new Error("Destination id is required")
  return withStore("readwrite", (store) => {
    const req = store.put(updated)
    return new Promise<Destination>((resolve, reject) => {
      req.onsuccess = () => resolve(updated)
      req.onerror = () => reject(req.error)
    })
  })
}

export async function deleteDestination(id: number): Promise<void> {
  return withStore("readwrite", (store) => {
    const req = store.delete(id)
    return new Promise<void>((resolve, reject) => {
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  })
}

export async function setVisited(id: number, visited: boolean): Promise<void> {
  return withStore("readwrite", (store) => {
    const getReq = store.get(id)
    return new Promise<void>((resolve, reject) => {
      getReq.onsuccess = () => {
        const item = getReq.result as Destination | undefined
        if (!item) {
          reject(new Error("Destination not found"))
          return
        }
        const putReq = store.put({ ...item, visited })
        putReq.onsuccess = () => resolve()
        putReq.onerror = () => reject(putReq.error)
      }
      getReq.onerror = () => reject(getReq.error)
    })
  })
}
