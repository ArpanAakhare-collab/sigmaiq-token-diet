export const config = {
  appName: "SigmaIQ",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAW-zBI9BQSiCliRaar6kXa8HEIK8R67Aw",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sigmaiq-a6fd6.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sigmaiq-a6fd6",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sigmaiq-a6fd6.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "605593261909",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:605593261909:web:b7ddab30dbb3f6764781dc",
  },
  firebaseAdmin: {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "sigmaiq-a6fd6",
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
    privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },
  pricing: {
    inputCostPer1M: 0.15, // Default $0.15 / 1M input tokens
    outputCostPer1M: 0.60, // Default $0.60 / 1M output tokens
    optimizerCostPerQuery: 0.00005, // Optimizer overhead cost per query
  },
};

export function isFirebaseConfigured(): boolean {
  const key = config.firebase.apiKey;
  return Boolean(key && key !== "unconfigured" && key.trim().length > 5);
}

export function isGeminiConfigured(): boolean {
  return Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 5);
}
