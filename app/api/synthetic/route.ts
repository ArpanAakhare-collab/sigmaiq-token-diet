import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { setDoc } from "@/lib/firestore";
import { runTokenDietOptimizer } from "@/lib/token-diet-engine";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);

    // 1. Generate RAG Demo Dataset & Run Token-Diet Processing
    const datasetId = `ds_synthetic_${Date.now()}`;
    const syntheticItems = [
      {
        id: "syn_1",
        question: "What is the refund period and what exceptions apply to enterprise customers?",
        context: `Standard customer refund policy permits returns within 30 days of purchase. Refunds must be submitted via customer portal.\n\nFor enterprise customers, refund conditions are governed by Master Services Agreement section 4.2. Enterprise clients receive a 60-day refund exception window upon written notice to executive management.\n\nAll standard items are subject to a 5% restocking fee unless defective.`,
        ground_truth: "Enterprise customers have a 60-day exception window per MSA section 4.2.",
      },
      {
        id: "syn_2",
        question: "Compare 2024 and 2025 security policies and identify key compliance changes.",
        context: `2024 Security Policy: Required quarterly password rotation (minimum 8 characters), semi-annual vulnerability scans, and standard TLS 1.2 encryption.\n\n2025 Security Policy: Enforces zero-trust architecture, hardware MFA security keys for all engineers, 16-character passphrases, continuous SOC2 automated monitoring, and TLS 1.3 protocol. Password rotations are deprecated in favor of FIDO2 tokens.`,
        ground_truth: "2025 policy requires zero-trust, hardware MFA, 16-char passphrases, SOC2 monitoring, TLS 1.3.",
      },
      {
        id: "syn_3",
        question: "What microservice dependencies cause database connection timeouts during peak traffic?",
        context: `Payment service handles checkout transactions and queries postgres-db. When auth-service experiences token validation latency, payment service connection pool fills up in 30 seconds.\n\nRedis cache absorbs 85% of read traffic. However, during cache eviction spikes, auth-service falls back to postgres-db, causing connection pool exhaustion across payment-service and order-service.`,
        ground_truth: "Auth-service cache eviction fallback to postgres-db causes connection pool exhaustion.",
      },
    ];

    const datasetRecord = {
      id: datasetId,
      name: "Synthetic Engineering RAG Suite (Demo)",
      description: "Synthetic multi-document technical context dataset.",
      category: "Multi-document",
      itemCount: syntheticItems.length,
      items: syntheticItems,
      totalRecords: syntheticItems.length,
      validRecords: syntheticItems.length,
      invalidRecords: 0,
      validationErrors: [],
      isSynthetic: true,
      ownerUid: user.uid,
      createdAt: new Date().toISOString(),
    };

    await setDoc("datasets", datasetId, datasetRecord);

    // Process dataset through Token-Diet optimizer pipeline
    const results: any[] = [];
    let totalOriginal = 0;
    let totalFinal = 0;
    let qualitySum = 0;
    let costSum = 0;

    for (const item of syntheticItems) {
      const res = await runTokenDietOptimizer({
        question: item.question,
        contextText: item.context,
        qualityFloor: 0.90,
        expectedAnswer: item.ground_truth,
        ownerUid: user.uid,
      });

      totalOriginal += res.originalTokenCount;
      totalFinal += res.finalTokenCount;
      qualitySum += res.qualityScore;
      costSum += res.totalCost;

      results.push(res);
    }

    const count = syntheticItems.length;
    const avgQuality = Number((qualitySum / count).toFixed(2));
    const totalTokensSaved = Math.max(0, totalOriginal - totalFinal);
    const avgTokenReduction = totalOriginal > 0 ? Number(((totalTokensSaved / totalOriginal) * 100).toFixed(1)) : 0;
    const totalCost = Number(costSum.toFixed(6));

    const runId = `run_synthetic_${Date.now()}`;
    const runRecord = {
      id: runId,
      runId,
      datasetId,
      datasetName: datasetRecord.name,
      mode: "Token-Diet",
      status: "COMPLETED",
      progress: 100,
      currentQuery: syntheticItems.length,
      totalQueries: syntheticItems.length,
      qualityFloor: 0.90,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      results,
      avgQuality,
      totalTokensSaved,
      avgTokenReduction,
      totalCost,
      costPerCorrectAnswer: `$${(totalCost / count).toFixed(6)}`,
      isSynthetic: true,
      ownerUid: user.uid,
    };

    await setDoc("runs", runId, runRecord);

    return NextResponse.json({
      message: "Synthetic RAG Demo dataset generated and processed through Token-Diet engine",
      dataset: datasetRecord,
      run: runRecord,
    });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Synthetic demo generation failed" }, { status: 500 });
  }
}
