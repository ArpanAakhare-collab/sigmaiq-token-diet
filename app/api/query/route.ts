import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { runTokenDietOptimizer } from "@/lib/token-diet-engine";
import { setDoc } from "@/lib/firestore";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const body = await req.json();
    const { question, context, retrievedContext, qualityFloor = 0.90, projectId } = body;

    const contextText = context || retrievedContext;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question parameter is required" }, { status: 400 });
    }

    if (!contextText || typeof contextText !== "string" || contextText.trim().length === 0) {
      return NextResponse.json({ error: "Retrieved context parameter is required" }, { status: 400 });
    }

    // Run real backend Token-Diet optimization pipeline
    const result = await runTokenDietOptimizer({
      question: question.trim(),
      contextText: contextText.trim(),
      qualityFloor: Number(qualityFloor),
      ownerUid: user.uid,
      projectId,
    });

    // Save optimization result to Firestore query_results collection
    await setDoc("query_results", result.runId, result);

    return NextResponse.json({ result });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Token-Diet optimization failed" }, { status: 500 });
  }
}
