import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getCollectionDocs, getDocById, setDoc } from "@/lib/firestore";
import { runTokenDietOptimizer } from "@/lib/token-diet-engine";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const benchmarks = await getCollectionDocs("benchmarks", user.uid);
    return NextResponse.json({ benchmarks });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to fetch benchmarks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const body = await req.json();
    const { datasetId, mode = "Token-Diet", ablationVariant, qualityFloor = 0.90, projectId } = body;

    let dataset = await getDocById("datasets", datasetId);
    if (!dataset && datasetId === "demo-rag-dataset") {
      dataset = {
        id: "demo-rag-dataset",
        name: "Standard RAG Benchmark Suite (Built-in)",
        items: [
          {
            id: "bm_1",
            question: "What is the refund period and what exceptions apply to enterprise customers?",
            context: "Standard customer refund period is 30 days. Enterprise customer refunds are governed by Master Services Agreement section 4.2 with 60 days exception window upon written notice.",
            ground_truth: "30 days for standard customers, 60 days for enterprise per MSA 4.2",
          },
          {
            id: "bm_2",
            question: "Compare the 2024 and 2025 security policies and identify key compliance changes.",
            context: "2024 Security Policy required quarterly audit reviews and 8-character passwords. 2025 Security Policy enforces mandatory hardware MFA, zero-trust network boundary, continuous SOC2 monitoring, and 16-character passphrases.",
            ground_truth: "2025 policy requires zero-trust, hardware MFA, 16-char passphrases, SOC2 monitoring",
          },
        ],
      };
    }

    if (!dataset || !dataset.items || dataset.items.length === 0) {
      return NextResponse.json({ error: "Invalid dataset or dataset is empty" }, { status: 400 });
    }

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = new Date().toISOString();

    const runRecord: any = {
      id: runId,
      runId,
      datasetId: dataset.id,
      datasetName: dataset.name,
      mode: ablationVariant ? `Ablation: ${ablationVariant}` : mode,
      ablationVariant: ablationVariant || null,
      status: "QUEUED",
      progress: 0,
      currentQuery: 0,
      totalQueries: dataset.items.length,
      qualityFloor: Number(qualityFloor),
      startedAt,
      finishedAt: null,
      error: null,
      results: [],
      avgQuality: 0,
      totalTokensSaved: 0,
      avgTokenReduction: 0,
      totalCost: 0,
      costPerCorrectAnswer: "N/A — correctness unavailable",
      ownerUid: user.uid,
      projectId,
    };

    await setDoc("runs", runId, runRecord);

    setTimeout(async () => {
      try {
        runRecord.status = "RUNNING";
        await setDoc("runs", runId, runRecord);

        const results: any[] = [];
        let totalOriginal = 0;
        let totalFinal = 0;
        let qualitySum = 0;
        let costSum = 0;
        let correctCount = 0;
        let groundTruthCount = 0;

        for (let i = 0; i < dataset.items.length; i++) {
          const item = dataset.items[i];
          runRecord.currentQuery = i + 1;
          runRecord.progress = Math.round(((i + 1) / dataset.items.length) * 100);

          if (mode === "Existing Compression Baseline") {
            results.push({
              queryId: item.id,
              question: item.question,
              status: "NOT AVAILABLE",
              note: "Existing Compression Baseline is not available for this target schema.",
            });
          } else {
            const optRes = await runTokenDietOptimizer({
              question: item.question,
              contextText: item.context,
              qualityFloor: ablationVariant === "Without Quality Guard" ? 0.0 : Number(qualityFloor),
              expectedAnswer: item.ground_truth || item.expectedAnswer,
              ownerUid: user.uid,
              projectId,
            });

            totalOriginal += optRes.originalTokenCount;
            totalFinal += optRes.finalTokenCount;
            qualitySum += optRes.qualityScore;
            costSum += optRes.totalCost;

            if (item.ground_truth) {
              groundTruthCount++;
              if (optRes.costPerCorrectAnswer.startsWith("$")) correctCount++;
            }

            results.push(optRes);
          }

          await setDoc("runs", runId, runRecord);
        }

        const count = Math.max(1, results.length);
        const avgQuality = Number((qualitySum / count).toFixed(2));
        const totalTokensSaved = Math.max(0, totalOriginal - totalFinal);
        const avgTokenReduction = totalOriginal > 0 ? Number(((totalTokensSaved / totalOriginal) * 100).toFixed(1)) : 0;
        const totalCost = Number(costSum.toFixed(6));

        let costPerCorrectAnswer = "N/A — correctness unavailable";
        if (groundTruthCount > 0 && correctCount > 0) {
          costPerCorrectAnswer = `$${(totalCost / correctCount).toFixed(6)}`;
        }

        runRecord.status = "COMPLETED";
        runRecord.finishedAt = new Date().toISOString();
        runRecord.results = results;
        runRecord.avgQuality = avgQuality;
        runRecord.totalTokensSaved = totalTokensSaved;
        runRecord.avgTokenReduction = avgTokenReduction;
        runRecord.totalCost = totalCost;
        runRecord.costPerCorrectAnswer = costPerCorrectAnswer;

        await setDoc("runs", runId, runRecord);
      } catch (err: any) {
        runRecord.status = "FAILED";
        runRecord.error = err.message || "Benchmark processing failed";
        runRecord.finishedAt = new Date().toISOString();
        await setDoc("runs", runId, runRecord);
      }
    }, 100);

    return NextResponse.json({ run: runRecord, message: "Benchmark job queued successfully" }, { status: 202 });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to start benchmark" }, { status: 500 });
  }
}
