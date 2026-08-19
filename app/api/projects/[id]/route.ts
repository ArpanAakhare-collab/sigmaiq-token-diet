import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getDocById, setDoc, deleteDoc } from "@/lib/firestore";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuthToken(req);
    const project = await getDocById("projects", params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.ownerUid && project.ownerUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN: You do not own this project" }, { status: 403 });
    }
    return NextResponse.json({ project });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuthToken(req);
    const existing = await getDocById("projects", params.id);
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (existing.ownerUid && existing.ownerUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN: You do not own this project" }, { status: 403 });
    }

    const body = await req.json();
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await setDoc("projects", params.id, updated);
    return NextResponse.json({ project: updated });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuthToken(req);
    const existing = await getDocById("projects", params.id);
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (existing.ownerUid && existing.ownerUid !== user.uid) {
      return NextResponse.json({ error: "FORBIDDEN: You do not own this project" }, { status: 403 });
    }

    await deleteDoc("projects", params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to delete project" }, { status: 500 });
  }
}
