import { NextRequest, NextResponse } from "next/server";
import { getDocById, setDoc } from "@/lib/firestore";
import { getAuthenticatedUser } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));

    const uid = authUser?.uid || body.uid;
    if (!uid) {
      return NextResponse.json({ error: "Missing required user identity" }, { status: 401 });
    }

    const timestamp = new Date().toISOString();
    const existingUser = await getDocById("users", uid);

    const userProfile = {
      uid,
      displayName: body.displayName || authUser?.displayName || "Authenticated User",
      email: body.email || authUser?.email || "",
      photoURL: body.photoURL || authUser?.photoURL || "",
      authProvider: body.authProvider || existingUser?.authProvider || "google.com",
      emailVerified: body.emailVerified !== undefined ? body.emailVerified : existingUser?.emailVerified || false,
      createdAt: existingUser?.createdAt || timestamp,
      lastLoginAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc("users", uid, userProfile);

    return NextResponse.json({ success: true, user: userProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to synchronize user profile" }, { status: 500 });
  }
}
