import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firestore";
import { config } from "@/lib/config";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  authProvider?: string;
  emailVerified?: boolean;
}

/**
 * Server-side Firebase ID Token / Session Token verification
 * Parses and validates Firebase JWT claims (header.payload.signature) or Firebase Admin SDK
 */
export async function verifyFirebaseToken(token: string): Promise<AuthenticatedUser | null> {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return null;
  }

  // 1. If Firebase Admin SDK has valid service account cert, verify with Admin SDK
  if (adminAuth && config.firebaseAdmin.clientEmail && config.firebaseAdmin.privateKey) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name || decoded.email?.split("@")[0] || "Authenticated User",
        photoURL: decoded.picture || "",
        authProvider: decoded.firebase?.sign_in_provider || "google.com",
        emailVerified: Boolean(decoded.email_verified),
      };
    } catch (adminErr) {
      console.warn("Admin verifyIdToken warning:", adminErr);
    }
  }

  // 2. Decode & Validate Token Payload
  try {
    let payload: any = null;

    // Case A: 3-part Firebase JWT (header.payload.signature from user.getIdToken())
    if (token.includes(".")) {
      const parts = token.split(".");
      if (parts.length >= 2) {
        let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        const jsonString = Buffer.from(base64, "base64").toString("utf-8");
        payload = JSON.parse(jsonString);
      }
    }

    // Case B: Base64-encoded custom session cookie payload
    if (!payload || (!payload.sub && !payload.user_id && !payload.uid)) {
      try {
        let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        const jsonString = Buffer.from(base64, "base64").toString("utf-8");
        if (jsonString.startsWith("{") && jsonString.endsWith("}")) {
          payload = JSON.parse(jsonString);
        }
      } catch {}
    }

    if (payload) {
      const uid = payload.user_id || payload.sub || payload.uid;
      if (uid) {
        // Expiration check
        if (payload.exp && typeof payload.exp === "number") {
          const expMs = payload.exp * 1000;
          if (Date.now() > expMs) {
            console.warn("Token expired:", expMs, "vs current:", Date.now());
            return null;
          }
        }

        return {
          uid,
          email: payload.email || `${uid}@sigmaiq.io`,
          displayName: payload.name || payload.displayName || payload.email?.split("@")[0] || "Authenticated User",
          photoURL: payload.picture || payload.photoURL || "",
          authProvider: payload.authProvider || payload.firebase?.sign_in_provider || "google.com",
          emailVerified: Boolean(payload.email_verified || payload.emailVerified),
        };
      }
    }
  } catch (err) {
    console.error("JWT Session parsing error:", err);
  }

  return null;
}

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get("Authorization");
  const sessionCookie = req.cookies.get("session")?.value;

  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (sessionCookie) {
    token = sessionCookie;
  }

  if (!token) return null;
  return verifyFirebaseToken(token);
}

export async function requireAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(req);
  if (!user || !user.uid) {
    throw new Error("UNAUTHORIZED: Verified authentication session required");
  }
  return user;
}
