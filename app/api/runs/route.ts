import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getCollectionDocs } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const runs = await getCollectionDocs("runs", user.uid);
    // Sort runs descending by startedAt
    runs.sort((a, b) => new Date(b.startedAt || b.createdAt).getTime() - new Date(a.startedAt || a.createdAt).getTime());
    return NextResponse.json({ runs });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to fetch runs" }, { status: 500 });
  }
}
