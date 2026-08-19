import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing required Firebase ID token" }, { status: 400 });
    }

    // Verify Firebase ID token
    const verifiedUser = await verifyFirebaseToken(idToken);

    if (!verifiedUser || !verifiedUser.uid) {
      return NextResponse.json({ error: "Invalid or expired Firebase ID token" }, { status: 401 });
    }

    // Create session cookie payload (valid for 7 days)
    const sessionPayload = {
      uid: verifiedUser.uid,
      email: verifiedUser.email || "",
      displayName: verifiedUser.displayName || "Authenticated User",
      photoURL: verifiedUser.photoURL || "",
      authProvider: verifiedUser.authProvider || "google.com",
      emailVerified: Boolean(verifiedUser.emailVerified),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };

    const sessionCookieValue = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    const response = NextResponse.json({ success: true, user: verifiedUser });

    // Set HTTP-only session cookie
    response.cookies.set("session", sessionCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Session creation API error:", err);
    return NextResponse.json({ error: err.message || "Failed to create authentication session" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  // Explicitly clear session cookie across all path variations
  response.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    sameSite: "lax",
  });

  return response;
}
