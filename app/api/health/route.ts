import { NextResponse } from "next/server";
import { isFirebaseConfigured, isGeminiConfigured } from "@/lib/config";
import { getCollectionDocs } from "@/lib/firestore";

export async function GET() {
  try {
    const authStatus = isFirebaseConfigured() ? "connected" : "degraded";
    
    let firestoreStatus = "connected";
    try {
      await getCollectionDocs("settings", undefined);
    } catch {
      firestoreStatus = "degraded";
    }

    const backendStatus = "connected";
    const geminiStatus = isGeminiConfigured() ? "configured" : "degraded";
    const webhookStatus = "ready";

    return NextResponse.json({
      status: authStatus === "connected" && firestoreStatus === "connected" ? "healthy" : "degraded",
      subsystems: {
        auth: authStatus,
        database: firestoreStatus,
        backend: backendStatus,
        gemini: geminiStatus,
        webhooks: webhookStatus,
      },
      details: {
        firebaseConfigured: isFirebaseConfigured(),
        geminiConfigured: isGeminiConfigured(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: err.message,
        subsystems: {
          auth: "unavailable",
          database: "unavailable",
          backend: "degraded",
          gemini: "unavailable",
          webhooks: "ready",
        },
      },
      { status: 500 }
    );
  }
}
