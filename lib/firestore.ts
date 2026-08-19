import * as admin from "firebase-admin";
import { config } from "@/lib/config";

// Initialize Firebase Admin if needed
if (!admin.apps.length) {
  try {
    const hasValidCert =
      config.firebaseAdmin.clientEmail &&
      config.firebaseAdmin.privateKey &&
      config.firebaseAdmin.privateKey.includes("-----BEGIN PRIVATE KEY-----");

    if (hasValidCert) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebaseAdmin.projectId,
          clientEmail: config.firebaseAdmin.clientEmail,
          privateKey: config.firebaseAdmin.privateKey,
        }),
      });
    } else {
      admin.initializeApp({
        projectId: config.firebaseAdmin.projectId || "sigmaiq-a6fd6",
      });
    }
  } catch (err) {
    console.warn("Firebase Admin init note:", err);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;

// Determine if live Admin Firestore is available
let firestoreDb: admin.firestore.Firestore | null = null;
try {
  if (admin.apps.length && (config.firebaseAdmin.clientEmail || process.env.NODE_ENV === "production")) {
    firestoreDb = admin.firestore();
  }
} catch (e) {
  firestoreDb = null;
}

// In-Memory store for non-production local dev fallback ONLY (Zero filesystem touches)
let memoryStore: Record<string, Record<string, any>> = (globalThis as any)._sigmaMemoryStore || {};
(globalThis as any)._sigmaMemoryStore = memoryStore;

function getStoreData(): Record<string, Record<string, any>> {
  return memoryStore;
}

function saveStoreData(data: Record<string, Record<string, any>>) {
  memoryStore = data;
  (globalThis as any)._sigmaMemoryStore = memoryStore;
}

/**
 * Generic Firestore collection query and mutation helper
 * Scopes queries by ownerUid or workspaceId
 * PRODUCTION RULE: Uses Firestore Admin directly. Zero filesystem operations.
 */
export async function getCollectionDocs<T = any>(
  collectionName: string,
  ownerUid?: string,
  filterFn?: (doc: any) => boolean
): Promise<T[]> {
  if (firestoreDb) {
    try {
      let query: admin.firestore.Query = firestoreDb.collection(collectionName);
      if (ownerUid) {
        query = query.where("ownerUid", "==", ownerUid);
      }
      const snapshot = await query.get();
      const results: any[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      if (filterFn) return results.filter(filterFn);
      return results as T[];
    } catch (err: any) {
      console.warn(`Firestore read notice for ${collectionName}:`, err?.message || err);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Firestore read error on production: ${err.message || "Connection failed"}`);
      }
    }
  }

  // Local non-production development in-memory fallback
  const store = getStoreData();
  const collection = store[collectionName] || {};
  let items = Object.values(collection);
  if (ownerUid) {
    items = items.filter((item: any) => item.ownerUid === ownerUid || item.workspaceId === ownerUid);
  }
  if (filterFn) {
    items = items.filter(filterFn);
  }
  return items as T[];
}

export async function getDocById<T = any>(collectionName: string, docId: string): Promise<T | null> {
  if (firestoreDb) {
    try {
      const docRef = await firestoreDb.collection(collectionName).doc(docId).get();
      if (docRef.exists) {
        return { id: docRef.id, ...docRef.data() } as T;
      }
    } catch (err: any) {
      console.warn(`Firestore doc get notice for ${collectionName}/${docId}:`, err?.message || err);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Firestore doc get error on production: ${err.message || "Connection failed"}`);
      }
    }
  }

  const store = getStoreData();
  const collection = store[collectionName] || {};
  return (collection[docId] as T) || null;
}

export async function setDoc(collectionName: string, docId: string, data: any): Promise<void> {
  const timestamp = new Date().toISOString();
  const payload = {
    ...data,
    id: docId,
    updatedAt: timestamp,
    createdAt: data.createdAt || timestamp,
  };

  if (firestoreDb) {
    try {
      await firestoreDb.collection(collectionName).doc(docId).set(payload, { merge: true });
      return;
    } catch (err: any) {
      console.warn(`Firestore write notice for ${collectionName}/${docId}:`, err?.message || err);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Firestore write error on production: ${err.message || "Connection failed"}`);
      }
    }
  }

  // Non-production memory store update
  const store = getStoreData();
  if (!store[collectionName]) {
    store[collectionName] = {};
  }
  store[collectionName][docId] = {
    ...(store[collectionName][docId] || {}),
    ...payload,
  };
  saveStoreData(store);
}

export async function deleteDoc(collectionName: string, docId: string): Promise<boolean> {
  if (firestoreDb) {
    try {
      await firestoreDb.collection(collectionName).doc(docId).delete();
      return true;
    } catch (err: any) {
      console.warn(`Firestore delete notice for ${collectionName}/${docId}:`, err?.message || err);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Firestore delete error on production: ${err.message || "Connection failed"}`);
      }
    }
  }

  const store = getStoreData();
  if (store[collectionName] && store[collectionName][docId]) {
    delete store[collectionName][docId];
    saveStoreData(store);
    return true;
  }
  return false;
}
