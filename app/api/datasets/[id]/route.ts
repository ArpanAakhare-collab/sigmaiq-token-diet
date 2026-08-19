import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getDocById, deleteDoc } from "@/lib/firestore";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuthToken(req);
    const dataset = await getDocById("datasets", params.id);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }
    if (dataset.ownerUid && dataset.ownerUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN: You do not own this dataset" }, { status: 403 });
    }
    return NextResponse.json({ dataset });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to fetch dataset" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuthToken(req);
    const existing = await getDocById("datasets", params.id);
    if (!existing) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }
    if (existing.ownerUid && existing.ownerUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN: You do not own this dataset" }, { status: 403 });
    }

    await deleteDoc("datasets", params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to delete dataset" }, { status: 500 });
  }
}
