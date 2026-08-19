import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getCollectionDocs, setDoc } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const projects = await getCollectionDocs("projects", user.uid);
    return NextResponse.json({ projects });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const body = await req.json();
    const { name, description, qualityFloor = 0.90 } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProject = {
      id: projectId,
      name: name.trim(),
      description: description || "SigmaIQ Token-Diet & Alert Intelligence workspace project.",
      qualityFloor: Number(qualityFloor),
      ownerUid: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc("projects", projectId, newProject);
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}
