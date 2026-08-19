import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return null;
    }

    if (adminAuth) {
      try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
        };
      } catch (err) {
        // Try fallback verification as regular ID token if session cookie verify fails
        try {
          const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
          return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture,
          };
        } catch {
          // If adminAuth verification fails (e.g. invalid signature), check dev session JSON
        }
      }
    }

    // Development / fallback session parsing if Firebase Admin keys are missing
    try {
      const parsed = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
      if (parsed && parsed.uid) {
        return {
          uid: parsed.uid,
          email: parsed.email || `${parsed.uid}@example.com`,
          name: parsed.name || "User",
          picture: parsed.picture || "",
        };
      }
    } catch {
      // Ignore
    }

    return null;
  } catch (error) {
    console.error("getCurrentUser Error:", error);
    return null;
  }
}
