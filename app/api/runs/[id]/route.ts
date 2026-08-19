import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getDocById } from "@/lib/firestore";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuthToken(req);
    const run = await getDocById("runs", params.id);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }
    if (run.ownerUid && run.ownerUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN: You do not own this run" }, { status: 403 });
    }
    return NextResponse.json({ run });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to fetch run details" }, { status: 500 });
  }
}
