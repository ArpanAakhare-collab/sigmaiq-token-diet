import * as admin from "firebase-admin";
import { config } from "@/lib/config";

// Initialize Firebase Admin with safe fallback for managed environments
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
      // In Firebase Cloud Functions / GCP, initializeApp() uses managed default credentials automatically
      admin.initializeApp({
        projectId: config.firebaseAdmin.projectId || "sigmaiq-a6fd6",
      });
    }
  } catch (error: any) {
    console.warn("Firebase Admin Initialization Notice:", error?.message || error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
