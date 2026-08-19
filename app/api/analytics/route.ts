import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getCollectionDocs } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);

    const runs = await getCollectionDocs("runs", user.uid);
    const queryResults = await getCollectionDocs("query_results", user.uid);

    let totalQueries = queryResults.length;
    let totalOriginalTokens = 0;
    let totalFinalTokens = 0;
    let qualitySum = 0;
    let totalCost = 0;
    let totalOptimizerCost = 0;
    let totalLatencyMs = 0;
    let relaxationCount = 0;
    let correctCount = 0;
    let groundTruthCount = 0;

    queryResults.forEach((q) => {
      totalOriginalTokens += q.originalTokenCount || 0;
      totalFinalTokens += q.finalTokenCount || 0;
      qualitySum += q.qualityScore || 0;
      totalCost += q.totalCost || 0;
      totalOptimizerCost += q.optimizerCost || 0;
      totalLatencyMs += q.totalLatencyMs || 0;
      if (q.relaxationUsed) relaxationCount++;
      if (q.groundTruthAgreement && !q.groundTruthAgreement.startsWith("N/A")) {
        groundTruthCount++;
        if (q.costPerCorrectAnswer && q.costPerCorrectAnswer.startsWith("$")) correctCount++;
      }
    });

    runs.forEach((r) => {
      if (r.results && Array.isArray(r.results)) {
        r.results.forEach((q: any) => {
          if (q.originalTokenCount) {
            totalQueries++;
            totalOriginalTokens += q.originalTokenCount || 0;
            totalFinalTokens += q.finalTokenCount || 0;
            qualitySum += q.qualityScore || 0;
            totalCost += q.totalCost || 0;
            totalOptimizerCost += q.optimizerCost || 0;
            totalLatencyMs += q.totalLatencyMs || 0;
            if (q.relaxationUsed) relaxationCount++;
            if (q.groundTruthAgreement && !q.groundTruthAgreement.startsWith("N/A")) {
              groundTruthCount++;
              if (q.costPerCorrectAnswer && q.costPerCorrectAnswer.startsWith("$")) correctCount++;
            }
          }
        });
      }
    });

    const totalSavedTokens = Math.max(0, totalOriginalTokens - totalFinalTokens);
    const tokenReductionPercentage = totalOriginalTokens > 0 ? Number(((totalSavedTokens / totalOriginalTokens) * 100).toFixed(1)) : 0;
    const avgQualityScore = totalQueries > 0 ? Number((qualitySum / totalQueries).toFixed(2)) : 0;
    const avgLatencyMs = totalQueries > 0 ? Math.round(totalLatencyMs / totalQueries) : 0;
    const relaxationRate = totalQueries > 0 ? Number(((relaxationCount / totalQueries) * 100).toFixed(1)) : 0;

    const financialSavings = Number(((totalSavedTokens / 1000000) * 0.15).toFixed(4));

    let costPerCorrectAnswer: string | number = "N/A — correctness unavailable";
    if (groundTruthCount > 0 && correctCount > 0) {
      costPerCorrectAnswer = Number((totalCost / correctCount).toFixed(6));
    }

    return NextResponse.json({
      analytics: {
        totalQueriesProcessed: totalQueries,
        benchmarkRunsCount: runs.length,
        totalOriginalTokens,
        totalFinalTokens,
        totalSavedTokens,
        tokenReductionPercentage,
        avgQualityScore,
        financialSavings,
        totalCost: Number(totalCost.toFixed(6)),
        totalOptimizerCost: Number(totalOptimizerCost.toFixed(6)),
        avgLatencyMs,
        relaxationRate,
        costPerCorrectAnswer,
      },
    });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to compute analytics" }, { status: 500 });
  }
}
