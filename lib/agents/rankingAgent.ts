import { ITool } from "@/models/Tool";
import { QuerySpec } from "./queryAgent";

export interface SubScores {
  taskMatch: number;
  featureMatch: number;
  price: number;
  platformFit: number;
  reviews: number;
  reliability: number;
}

export interface RankedTool {
  tool: ITool;
  matchPercentage: number;
  subScores: SubScores;
  whyThisTool: string[];
}

export interface PersonalizationOptions {
  budgetChip?: "free" | "low_cost" | "any";
  priorityChip?: "best_overall" | "cheapest" | "highest_rated" | "best_match";
  platformsChip?: string[];
}

export function rankTools(
  tools: ITool[],
  spec: QuerySpec,
  userQuery: string,
  personalization?: PersonalizationOptions
): RankedTool[] {
  const queryLower = userQuery.toLowerCase();
  const effectiveBudget = personalization?.budgetChip === "free" ? "free" : spec.budget;
  const effectivePriority = personalization?.priorityChip || spec.priority;
  const effectivePlatforms = personalization?.platformsChip?.length
    ? personalization.platformsChip
    : spec.platforms;

  // Determine dynamic weights based on priority chip
  let wTask = 0.40;
  let wFeature = 0.20;
  let wPrice = 0.15;
  let wPlatform = 0.10;
  let wReviews = 0.10;
  let wReliability = 0.05;

  if (effectivePriority === "cheapest") {
    wPrice = 0.40;
    wTask = 0.25;
    wFeature = 0.15;
    wReviews = 0.10;
    wPlatform = 0.05;
    wReliability = 0.05;
  } else if (effectivePriority === "highest_rated") {
    wReviews = 0.35;
    wTask = 0.30;
    wFeature = 0.15;
    wPrice = 0.10;
    wPlatform = 0.05;
    wReliability = 0.05;
  } else if (effectivePriority === "best_match") {
    wFeature = 0.40;
    wTask = 0.30;
    wPrice = 0.15;
    wPlatform = 0.05;
    wReviews = 0.05;
    wReliability = 0.05;
  }

  const ranked = tools.map((t) => {
    // 1. Task Match (0-100)
    let taskMatch = 50;
    const categoryMatch = t.category.some(
      (c) => c.toLowerCase() === spec.category.toLowerCase()
    );
    if (categoryMatch) {
      taskMatch = 85;
    }
    if (t.name.toLowerCase().includes(queryLower) || queryLower.includes(t.name.toLowerCase())) {
      taskMatch = Math.min(100, taskMatch + 15);
    }
    if (t.description.toLowerCase().includes(queryLower)) {
      taskMatch = Math.min(100, taskMatch + 10);
    }

    // 2. Feature Match (0-100)
    let featureMatch = 100;
    if (spec.requirements.length > 0) {
      let matchedCount = 0;
      spec.requirements.forEach((req) => {
        const reqLower = req.toLowerCase();
        const found =
          t.features.some((f) => f.toLowerCase().includes(reqLower)) ||
          t.description.toLowerCase().includes(reqLower) ||
          t.name.toLowerCase().includes(reqLower);
        if (found) matchedCount++;
      });
      featureMatch = (matchedCount / spec.requirements.length) * 100;
    }

    // 3. Price Compatibility (0-100)
    let price = 100;
    if (effectiveBudget === "free") {
      if (t.pricingTier === "free") price = 100;
      else if (t.pricingTier === "freemium") price = 65;
      else if (t.pricingTier === "paid") price = 20;
    } else if (effectiveBudget === "paid") {
      if (t.pricingTier === "paid") price = 100;
      else if (t.pricingTier === "freemium") price = 85;
      else if (t.pricingTier === "free") price = 70;
    } else {
      if (t.pricingTier === "free") price = 100;
      else if (t.pricingTier === "freemium") price = 90;
      else price = 75;
    }

    // 4. Platform Fit (0-100)
    let platformFit = 100;
    if (effectivePlatforms.length > 0) {
      let matchedP = 0;
      effectivePlatforms.forEach((p) => {
        if (t.platforms.some((tp) => tp.toLowerCase().includes(p.toLowerCase()))) {
          matchedP++;
        }
      });
      platformFit = (matchedP / effectivePlatforms.length) * 100;
    }

    // 5. Reviews (0-100)
    const reviews = (Math.min(5, Math.max(0, t.rating)) / 5) * 100;

    // 6. Reliability (0-100)
    let reliability = 70;
    if (t.officialUrl && t.officialUrl.startsWith("http")) reliability += 15;
    if (t.reviewSummary && t.reviewSummary.length > 10) reliability += 15;

    const subScores: SubScores = {
      taskMatch: Math.round(taskMatch),
      featureMatch: Math.round(featureMatch),
      price: Math.round(price),
      platformFit: Math.round(platformFit),
      reviews: Math.round(reviews),
      reliability: Math.round(reliability),
    };

    const finalRaw =
      taskMatch * wTask +
      featureMatch * wFeature +
      price * wPrice +
      platformFit * wPlatform +
      reviews * wReviews +
      reliability * wReliability;

    const matchPercentage = Math.min(99, Math.max(10, Math.round(finalRaw)));

    // Dynamic "Why this tool?" reasoning builder based on highest scoring sub-scores
    const whyThisTool: string[] = [];
    if (categoryMatch) {
      whyThisTool.push(`Matches primary requested category: ${t.category.join(", ")}`);
    }
    if (featureMatch >= 70 && spec.requirements.length > 0) {
      whyThisTool.push(`Supports key requested features (${spec.requirements.slice(0, 2).join(", ")})`);
    }
    if (t.pricingTier === "free" || (effectiveBudget === "free" && t.pricingTier === "freemium")) {
      whyThisTool.push(`Offers generous free access tier (${t.pricingTier})`);
    }
    if (t.rating >= 4.7) {
      whyThisTool.push(`Highly rated by users (${t.rating}/5.0 based on expert reviews)`);
    }
    if (whyThisTool.length === 0) {
      whyThisTool.push(`Provides strong performance for ${t.name}`);
    }

    return {
      tool: t,
      matchPercentage,
      subScores,
      whyThisTool,
    };
  });

  return ranked.sort((a, b) => b.matchPercentage - a.matchPercentage);
}
