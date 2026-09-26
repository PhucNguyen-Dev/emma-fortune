/**
 * A tiny IndexedDB locker for the owner's own song recordings. Songs can be
 * far larger than localStorage allows, and IndexedDB keeps them purely on
 * this device — nothing is uploaded anywhere.
 */

const DB_NAME = "emma-fortune-music";
const STORE = "tracks";

export const MAX_TRACK_FILE_BYTES = 25 * 1024 * 1024;

export function trackStorageAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable in this browser"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open the song locker"));
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = run(tx.objectStore(STORE));
        request.onsuccess = () => {
          resolve(request.result as T);
          db.close();
        };
        request.onerror = () => {
          reject(request.error ?? new Error("Song locker request failed"));
          db.close();
        };
      }),
  );
}

type StoredTrack = {
  bytes: ArrayBuffer;
  type: string;
  name: string;
  addedAt: string;
};

export async function saveTrackFile(trackId: string, file: Blob, name = "recording"): Promise<void> {
  // Store raw bytes + metadata rather than the Blob itself: structured clones
  // of Blob objects vary between implementations (and test environments).
  const bytes = await file.arrayBuffer();
  const payload: StoredTrack = {
    bytes,
    type: file.type || "audio/mpeg",
    name,
    addedAt: new Date().toISOString(),
  };
  await withStore("readwrite", (store) => store.put(payload, trackId));
}

export async function getTrackFile(trackId: string): Promise<Blob | null> {
  const record = await withStore<StoredTrack | undefined>("readonly", (store) => store.get(trackId));
  if (!record) return null;
  return new Blob([record.bytes], { type: record.type || "audio/mpeg" });
}

export async function deleteTrackFile(trackId: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(trackId));
}

/** Which of the given tracks have an owner recording? */
export async function listUploadedTrackIds(
  trackIds: string[],
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  for (const id of trackIds) {
    result[id] = (await getTrackFile(id)) !== null;
  }
  return result;
}

export function isAcceptableTrackFile(file: File): { ok: true } | { ok: false; reason: string } {
  const looksAudio =
    file.type.startsWith("audio/") || /\.(mp3|m4a|ogg|wav|flac)$/i.test(file.name);
  if (!looksAudio) {
    return { ok: false, reason: "That file doesn't look like a song. MP3, M4A, OGG or WAV, please." };
  }
  if (file.size > MAX_TRACK_FILE_BYTES) {
    return { ok: false, reason: "That song is a little too large (the limit is 25 MB)." };
  }
  if (file.size === 0) {
    return { ok: false, reason: "That file is empty." };
  }
  return { ok: true };
}
