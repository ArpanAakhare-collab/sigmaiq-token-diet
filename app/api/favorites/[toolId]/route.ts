import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { connectToDatabase } from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: { toolId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toolId } = params;
    if (!toolId || !mongoose.Types.ObjectId.isValid(toolId)) {
      return NextResponse.json({ error: "Invalid toolId" }, { status: 400 });
    }

    await connectToDatabase();
    const result = await Favorite.deleteOne({
      uid: user.uid,
      toolId: new mongoose.Types.ObjectId(toolId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Favorite removed" });
  } catch (error) {
    console.error("DELETE /api/favorites/[toolId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
