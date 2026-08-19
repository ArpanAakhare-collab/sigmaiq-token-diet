function rankTools(tools, spec, userQuery, personalization) {
  const queryLower = userQuery.toLowerCase();
  const effectiveBudget = personalization?.budgetChip === "free" ? "free" : spec.budget;
  const effectivePriority = personalization?.priorityChip || spec.priority;

  let wTask = 0.40;
  let wFeature = 0.20;
  let wPrice = 0.15;
  let wPlatform = 0.10;
  let wReviews = 0.10;
  let wReliability = 0.05;

  if (effectivePriority === "cheapest") {
    wPrice = 0.40;
    wTask = 0.25;
  } else if (effectivePriority === "highest_rated") {
    wReviews = 0.35;
    wTask = 0.30;
  }

  const ranked = tools.map((t) => {
    let taskMatch = 50;
    const categoryMatch = t.category.some(
      (c) => c.toLowerCase() === spec.category.toLowerCase()
    );
    if (categoryMatch) taskMatch = 85;
    if (t.name.toLowerCase().includes(queryLower)) taskMatch = Math.min(100, taskMatch + 15);

    let featureMatch = 100;
    if (spec.requirements.length > 0) {
      let matchedCount = 0;
      spec.requirements.forEach((req) => {
        const reqLower = req.toLowerCase();
        if (
          t.features.some((f) => f.toLowerCase().includes(reqLower)) ||
          t.description.toLowerCase().includes(reqLower)
        ) {
          matchedCount++;
        }
      });
      featureMatch = (matchedCount / spec.requirements.length) * 100;
    }

    let price = 100;
    if (effectiveBudget === "free") {
      if (t.pricingTier === "free") price = 100;
      else if (t.pricingTier === "freemium") price = 65;
      else price = 20;
    }

    const platformFit = 100;
    const reviews = (t.rating / 5) * 100;
    const reliability = 100;

    const finalRaw =
      taskMatch * wTask +
      featureMatch * wFeature +
      price * wPrice +
      platformFit * wPlatform +
      reviews * wReviews +
      reliability * wReliability;

    const matchPercentage = Math.min(99, Math.max(10, Math.round(finalRaw)));

    return {
      tool: t,
      matchPercentage,
      subScores: {
        taskMatch: Math.round(taskMatch),
        featureMatch: Math.round(featureMatch),
        price: Math.round(price),
        platformFit: Math.round(platformFit),
        reviews: Math.round(reviews),
        reliability: Math.round(reliability),
      },
      whyThisTool: [
        categoryMatch ? `Matches primary category: ${t.category.join(", ")}` : "Recommended tool",
      ],
    };
  });

  return ranked.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

module.exports = {
  rankTools,
};
