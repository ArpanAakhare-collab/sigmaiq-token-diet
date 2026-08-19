import * as admin from "firebase-admin";
import { config } from "@/lib/config";

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
        projectId: config.firebaseAdmin.projectId || "demo-app",
      });
    }
  } catch (error) {
    console.warn("Firebase Admin Initialization Warning:", error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
