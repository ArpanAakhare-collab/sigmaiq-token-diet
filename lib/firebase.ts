import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { config, isFirebaseConfigured } from "@/lib/config";

const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
};

// Ensure single Firebase App initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Provider with explicit prompt
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Establishes HTTP-only server session cookie and triggers background profile sync
 */
export async function syncSessionToken(user: User, providerId: string = "google.com"): Promise<string> {
  const idToken = await user.getIdToken(true);

  // 1. Establish HTTP-only Session Cookie on Server (Awaited for fast session creation)
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to establish authenticated server session.");
  }

  // 2. Synchronize User Profile in Firestore in BACKGROUND (Non-blocking so login does not hang)
  fetch("/api/auth/user-sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: user.uid,
      displayName: user.displayName || user.email?.split("@")[0] || "Authenticated User",
      email: user.email || "",
      photoURL: user.photoURL || "",
      authProvider: providerId,
      emailVerified: user.emailVerified,
    }),
  }).catch((err) => console.warn("Background user sync notice:", err));

  return idToken;
}

export async function signInWithGoogle(): Promise<User | null> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Authentication Configuration Missing: Please verify environment variables.");
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncSessionToken(result.user, "google.com");
    return result.user;
  } catch (error: any) {
    console.error("Firebase Google Auth Error:", error);

    // If popup is blocked, attempt redirect fallback seamlessly
    if (error.code === "auth/popup-blocked") {
      console.warn("Popup blocked. Redirecting via Firebase Auth handler...");
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Google sign-in popup was closed before completing.");
    }
    if (error.code === "auth/unauthorized-domain") {
      const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
      throw new Error(
        `Firebase rejected domain '${host}'. Ensure Google Provider is enabled in Firebase Console (Authentication > Sign-in method) and '${host}' & '127.0.0.1' are listed under Authorized domains.`
      );
    }
    if (error.code === "auth/operation-not-allowed") {
      throw new Error(
        "Google Sign-In is disabled in your Firebase project. Please enable 'Google' under Firebase Console > Authentication > Sign-in method."
      );
    }
    if (error.code === "auth/network-request-failed") {
      throw new Error("Network request failed. Please check your internet connection.");
    }

    throw new Error(error.message || "Google authentication failed. Please try again.");
  }
}

export async function checkRedirectAuth(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await syncSessionToken(result.user, "google.com");
      return result.user;
    }
  } catch (err) {
    console.warn("Redirect auth check note:", err);
  }
  return null;
}

export async function loginWithEmailPassword(email: string, pass: string): Promise<User> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Authentication Configuration Missing.");
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    await syncSessionToken(credential.user, "password");
    return credential.user;
  } catch (error: any) {
    console.error("Email Login Error:", error);
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      throw new Error("Invalid email or password.");
    }
    if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email format.");
    }
    if (error.code === "auth/too-many-requests") {
      throw new Error("Access temporarily blocked due to multiple failed login attempts. Please try again later.");
    }
    throw new Error("Authentication failed. Please verify your email and password.");
  }
}

export async function registerWithEmailPassword(email: string, pass: string, name?: string): Promise<User> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Authentication Configuration Missing.");
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && credential.user) {
      await updateProfile(credential.user, { displayName: name });
    }
    await sendEmailVerification(credential.user).catch((err) => console.warn("Email verification send note:", err));
    await syncSessionToken(credential.user, "password");
    return credential.user;
  } catch (error: any) {
    console.error("Email Registration Error:", error);
    if (error.code === "auth/email-already-in-use") {
      throw new Error("An account with this email address already exists. Please sign in instead.");
    }
    if (error.code === "auth/weak-password") {
      throw new Error("Password must be at least 8 characters long.");
    }
    if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address format.");
    }
    throw new Error(error.message || "Account creation failed. Please try again.");
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Authentication Configuration Missing.");
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password Reset Error:", error);
  }
}

export async function resendVerificationEmail(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

export async function checkUserEmailVerified(): Promise<boolean> {
  if (auth.currentUser) {
    await auth.currentUser.reload();
    return auth.currentUser.emailVerified;
  }
  return false;
}

/**
 * Fast, reliable sign-out with max 1.5s timeout fallback
 */
export async function logoutUser(): Promise<void> {
  try {
    await Promise.race([
      Promise.all([
        firebaseSignOut(auth),
        fetch("/api/auth/session", { method: "DELETE", credentials: "include" }),
      ]),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch (err) {
    console.warn("Client SignOut notice:", err);
  } finally {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}
