import { GoogleGenerativeAI } from "@google/generative-ai";
import { config, isGeminiConfigured } from "@/lib/config";

export interface EvidenceChunk {
  id: string;
  text: string;
  score: number;
  isRedundant: boolean;
  rationale: string;
}

export interface RelaxationEvent {
  iteration: number;
  previousBudget: number;
  newBudget: number;
  qualityBefore: number;
  qualityAfter: number;
  restoredEvidence: string[];
  reason: string;
}

export interface TokenDietResult {
  runId: string;
  queryId: string;
  question: string;
  complexity: "Simple" | "Medium" | "Complex";
  originalTokenCount: number;
  initialBudget: number;
  finalTokenCount: number;
  evidenceCoverage: number; // Ratio of retained top evidence
  qualityScore: number; // Heuristic Evidence Coverage Score
  qualityFloor: number;
  groundTruthAgreement: string; // "N/A — ground truth unavailable" or percentage
  relaxationUsed: boolean;
  optimizerLatencyMs: number;
  llmLatencyMs: number;
  totalLatencyMs: number;
  llmCost: number;
  optimizerCost: number;
  totalCost: number;
  costPerCorrectAnswer: string; // "N/A — correctness unavailable" or "$0.00034"
  retainedEvidence: { id: string; text: string; score: number; rationale: string }[];
  removedEvidence: { id: string; text: string; score: number; rationale: string }[];
  relaxationEvents: RelaxationEvent[];
  finalAnswer: string;
  executionMode: "Gemini 1.5 Flash" | "Optimization Engine Only";
  createdAt: string;
  ownerUid?: string | null;
  projectId?: string | null;
}

function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.trim().length / 4);
}

export function assessComplexity(question: string, contextText: string): "Simple" | "Medium" | "Complex" {
  const q = question.toLowerCase();
  const complexKeywords = ["compare", "difference", "security policy", "2024 and 2025", "identify changes", "analyze", "impact", "architecture"];
  const mediumKeywords = ["how to", "steps", "explain", "features", "requirements", "dependencies", "timeout"];

  if (complexKeywords.some((kw) => q.includes(kw)) || contextText.length > 2500 || (q.match(/\b(and|vs|between|changes)\b/g) || []).length >= 2) {
    return "Complex";
  }
  if (mediumKeywords.some((kw) => q.includes(kw)) || contextText.length > 1000) {
    return "Medium";
  }
  return "Simple";
}

export function splitContextIntoChunks(contextText: string, question: string): EvidenceChunk[] {
  const rawParagraphs = contextText
    .split(/\n\s*\n|\n- |\n\* |\n\d+\. /)
    .map((p) => p.trim())
    .filter((p) => p.length > 10);

  if (rawParagraphs.length === 0) {
    rawParagraphs.push(contextText.trim());
  }

  const queryTerms = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 3);

  const seenPhrases = new Set<string>();

  return rawParagraphs.map((text, idx) => {
    const textLower = text.toLowerCase();
    let termMatches = 0;
    queryTerms.forEach((term) => {
      if (textLower.includes(term)) termMatches++;
    });

    const baseScore = Math.min(0.99, 0.4 + (termMatches / Math.max(1, queryTerms.length)) * 0.55);
    const normalizedSnippet = textLower.slice(0, 50);
    const isRedundant = seenPhrases.has(normalizedSnippet);
    seenPhrases.add(normalizedSnippet);

    let rationale = "";
    if (isRedundant) {
      rationale = "Duplicate or redundant statement pruned.";
    } else if (baseScore > 0.75) {
      rationale = "High semantic relevance to query terms.";
    } else if (baseScore > 0.5) {
      rationale = "Provides supporting context detail.";
    } else {
      rationale = "Low relevance score relative to query intent.";
    }

    return {
      id: `chk_${idx + 1}`,
      text,
      score: Number(baseScore.toFixed(2)),
      isRedundant,
      rationale,
    };
  });
}

export async function runTokenDietOptimizer(params: {
  question: string;
  contextText: string;
  qualityFloor?: number;
  expectedAnswer?: string;
  ownerUid?: string;
  projectId?: string;
}): Promise<TokenDietResult> {
  const requestStart = Date.now();
  const qualityFloor = params.qualityFloor ?? 0.90;
  const question = params.question.trim();
  const contextText = params.contextText.trim();
  const expectedAnswer = params.expectedAnswer?.trim();

  // 1. Complexity
  const complexity = assessComplexity(question, contextText);

  // 2. Budgeting
  const originalTokenCount = estimateTokens(question) + estimateTokens(contextText);
  let targetRatio = 0.40;
  if (complexity === "Simple") targetRatio = 0.30;
  if (complexity === "Medium") targetRatio = 0.45;
  if (complexity === "Complex") targetRatio = 0.60;

  const initialBudget = Math.ceil(originalTokenCount * targetRatio);

  // 3. Relevance & Redundancy
  const chunks = splitContextIntoChunks(contextText, question);
  let candidateChunks = chunks.filter((c) => !c.isRedundant);
  if (candidateChunks.length === 0) candidateChunks = chunks;
  candidateChunks.sort((a, b) => b.score - a.score);

  // 4. Candidate Context Selection
  let currentBudget = initialBudget;
  let selectedChunks: EvidenceChunk[] = [];
  let currentTokenSum = estimateTokens(question);

  for (const chunk of candidateChunks) {
    const chunkTokens = estimateTokens(chunk.text);
    if (currentTokenSum + chunkTokens <= currentBudget || selectedChunks.length === 0) {
      selectedChunks.push(chunk);
      currentTokenSum += chunkTokens;
    }
  }

  // 5. Quality Evaluation (Heuristic Evidence Coverage)
  const calculateCoverage = (retained: EvidenceChunk[]): number => {
    if (chunks.length === 0) return 1.0;
    const topChunks = chunks.filter((c) => !c.isRedundant && c.score >= 0.5);
    if (topChunks.length === 0) return 0.95;

    const retainedIds = new Set(retained.map((r) => r.id));
    const retainedWeight = topChunks.filter((c) => retainedIds.has(c.id)).reduce((sum, c) => sum + c.score, 0);
    const totalWeight = topChunks.reduce((sum, c) => sum + c.score, 0);

    const score = totalWeight > 0 ? retainedWeight / totalWeight : 1.0;
    return Number(Math.min(0.99, Math.max(0.40, score)).toFixed(2));
  };

  let qualityScore = calculateCoverage(selectedChunks);
  const evidenceCoverage = qualityScore;
  const relaxationEvents: RelaxationEvent[] = [];
  let relaxationUsed = false;
  let iteration = 0;

  // 6. Dynamic Relaxation Loop
  while (qualityScore < qualityFloor && selectedChunks.length < candidateChunks.length) {
    relaxationUsed = true;
    iteration++;

    const prevBudget = currentBudget;
    const prevQuality = qualityScore;

    const unselected = candidateChunks.filter((c) => !selectedChunks.some((s) => s.id === c.id));
    if (unselected.length === 0) break;

    const restoredChunk = unselected[0];
    selectedChunks.push(restoredChunk);
    currentBudget += estimateTokens(restoredChunk.text) + 50;
    currentTokenSum += estimateTokens(restoredChunk.text);

    qualityScore = calculateCoverage(selectedChunks);

    relaxationEvents.push({
      iteration,
      previousBudget: prevBudget,
      newBudget: currentBudget,
      qualityBefore: prevQuality,
      qualityAfter: qualityScore,
      restoredEvidence: [restoredChunk.id],
      reason: `Quality score ${prevQuality} below quality floor ${qualityFloor}. Restored evidence chunk ${restoredChunk.id}.`,
    });
  }

  const optimizerEndTime = Date.now();
  const optimizerLatencyMs = optimizerEndTime - requestStart;

  // Retained & Removed Evidence
  const selectedIds = new Set(selectedChunks.map((s) => s.id));
  const retainedEvidence = chunks
    .filter((c) => selectedIds.has(c.id))
    .map((c) => ({ id: c.id, text: c.text, score: c.score, rationale: c.rationale }));

  const removedEvidence = chunks
    .filter((c) => !selectedIds.has(c.id))
    .map((c) => ({
      id: c.id,
      text: c.text,
      score: c.score,
      rationale: c.isRedundant ? "Pruned due to duplicate information overlap." : `Pruned to meet target context budget (${currentBudget} tokens).`,
    }));

  const finalContext = selectedChunks.map((c) => c.text).join("\n\n");
  const finalTokenCount = estimateTokens(question) + estimateTokens(finalContext);

  // 7. Gemini API Answer Generation
  let finalAnswer = "";
  let executionMode: "Gemini 1.5 Flash" | "Optimization Engine Only" = "Optimization Engine Only";
  let llmLatencyMs = 0;

  if (isGeminiConfigured()) {
    const llmStartTime = Date.now();
    try {
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are an AI engineering assistant. Answer the question using ONLY the provided evidence context concisely and accurately.\n\nContext:\n${finalContext}\n\nQuestion:\n${question}`;
      const res = await model.generateContent(prompt);
      finalAnswer = res.response.text();
      executionMode = "Gemini 1.5 Flash";
    } catch (err: any) {
      finalAnswer = `[Optimization Engine Only] (Gemini API unavailable: ${err.message}). Synthesized evidence summary:\n${finalContext.slice(0, 450)}`;
      executionMode = "Optimization Engine Only";
    }
    llmLatencyMs = Date.now() - llmStartTime;
  } else {
    finalAnswer = `[Optimization Engine Only] (GEMINI_API_KEY unconfigured). Synthesized context evidence (${selectedChunks.length} chunks retained):\n\n${selectedChunks.map((c) => `• ${c.text}`).join("\n")}`;
    executionMode = "Optimization Engine Only";
  }

  const totalLatencyMs = Date.now() - requestStart;

  // 8. Cost & Correctness Math
  const inputCost = (finalTokenCount / 1000000) * config.pricing.inputCostPer1M;
  const outputTokens = estimateTokens(finalAnswer);
  const outputCost = (outputTokens / 1000000) * config.pricing.outputCostPer1M;
  const llmCost = Number((inputCost + outputCost).toFixed(6));
  const optimizerCost = Number(config.pricing.optimizerCostPerQuery.toFixed(6));
  const totalCost = Number((llmCost + optimizerCost).toFixed(6));

  let groundTruthAgreement = "N/A — ground truth unavailable";
  let costPerCorrectAnswer = "N/A — correctness unavailable";

  if (expectedAnswer && expectedAnswer.length > 0) {
    const answerLower = finalAnswer.toLowerCase();
    const expectedLower = expectedAnswer.toLowerCase();
    const keywords = expectedLower.split(/\s+/).filter((w) => w.length > 3);
    const matches = keywords.filter((w) => answerLower.includes(w)).length;
    const matchRatio = keywords.length > 0 ? matches / keywords.length : 1.0;

    groundTruthAgreement = `${(matchRatio * 100).toFixed(0)}% Agreement`;

    if (matchRatio >= 0.5) {
      costPerCorrectAnswer = `$${totalCost.toFixed(6)}`;
    } else {
      costPerCorrectAnswer = "Incorrect (Cost N/A)";
    }
  }

  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const queryId = `qry_${Date.now()}`;

  return {
    runId,
    queryId,
    question,
    complexity,
    originalTokenCount,
    initialBudget,
    finalTokenCount,
    evidenceCoverage,
    qualityScore,
    qualityFloor,
    groundTruthAgreement,
    relaxationUsed,
    optimizerLatencyMs,
    llmLatencyMs,
    totalLatencyMs,
    llmCost,
    optimizerCost,
    totalCost,
    costPerCorrectAnswer,
    retainedEvidence,
    removedEvidence,
    relaxationEvents,
    finalAnswer,
    executionMode,
    createdAt: new Date().toISOString(),
    ownerUid: params.ownerUid || null,
    projectId: params.projectId || null,
  };
}
