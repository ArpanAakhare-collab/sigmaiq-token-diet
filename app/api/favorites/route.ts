import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { connectToDatabase } from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import Tool from "@/models/Tool";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const _ = Tool;

    const favorites = await Favorite.find({ uid: user.uid })
      .populate("toolId")
      .sort({ savedAt: -1 })
      .lean();

    const tools = favorites
      .filter((f) => f.toolId != null)
      .map((f) => ({
        ...(f.toolId as any),
        savedAt: f.savedAt,
      }));

    return NextResponse.json({ favorites: tools });
  } catch (error) {
    console.error("GET /api/favorites error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { toolId } = body;

    if (!toolId || !mongoose.Types.ObjectId.isValid(toolId)) {
      return NextResponse.json({ error: "Valid toolId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const toolExists = await Tool.findById(toolId);
    if (!toolExists) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    try {
      const fav = await Favorite.create({
        uid: user.uid,
        toolId: new mongoose.Types.ObjectId(toolId),
      });
      return NextResponse.json({ success: true, favorite: fav }, { status: 201 });
    } catch (dbErr: any) {
      if (dbErr.code === 11000) {
        return NextResponse.json(
          { message: "Tool is already favorited", success: true },
          { status: 200 }
        );
      }
      throw dbErr;
    }
  } catch (error) {
    console.error("POST /api/favorites error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
