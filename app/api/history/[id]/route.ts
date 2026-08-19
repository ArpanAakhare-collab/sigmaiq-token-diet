import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { connectToDatabase } from "@/lib/mongodb";
import Search from "@/models/Search";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid history item id" }, { status: 400 });
    }

    await connectToDatabase();
    const result = await Search.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      uid: user.uid,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "History item not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "History item deleted" });
  } catch (error) {
    console.error("DELETE /api/history/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
