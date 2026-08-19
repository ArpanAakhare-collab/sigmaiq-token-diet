import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { connectToDatabase } from "@/lib/mongodb";
import Favorite from "@/models/Favorite";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    await connectToDatabase();
    const count = await Favorite.countDocuments({ uid: user.uid });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/favorites/count error:", error);
    return NextResponse.json({ count: 0 });
  }
}
