import * as admin from "firebase-admin";
import { config } from "@/lib/config";
import fs from "fs";
import path from "path";

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
        projectId: config.firebaseAdmin.projectId || "sigmaiq-dev",
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
  if (admin.apps.length && config.firebaseAdmin.clientEmail) {
    firestoreDb = admin.firestore();
  }
} catch (e) {
  firestoreDb = null;
}

// Persistent Storage Fallback directory for local environment durability
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "firestore_store.json");

function ensureStoreFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({}), "utf8");
  }
}

function getStoreData(): Record<string, Record<string, any>> {
  ensureStoreFile();
  try {
    const content = fs.readFileSync(STORE_FILE, "utf8");
    return JSON.parse(content || "{}");
  } catch {
    return {};
  }
}

function saveStoreData(data: Record<string, Record<string, any>>) {
  ensureStoreFile();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Generic Firestore collection query and mutation helper
 * Scopes queries by ownerUid or workspaceId
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
    } catch (err) {
      console.warn(`Firestore read warning for ${collectionName}, using store:`, err);
    }
  }

  // Local persistent Firestore store
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
    } catch (err) {
      console.warn(`Firestore doc get warning for ${collectionName}/${docId}:`, err);
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
    } catch (err) {
      console.warn(`Firestore write warning for ${collectionName}/${docId}:`, err);
    }
  }

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
    } catch (err) {
      console.warn(`Firestore delete warning for ${collectionName}/${docId}:`, err);
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
