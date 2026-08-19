const { z } = require("zod");

const QuerySpecSchema = z.object({
  category: z.enum([
    "Coding",
    "UI/Design",
    "Writing",
    "Video",
    "Research",
    "Presentations",
    "General",
  ]),
  requirements: z.array(z.string()).max(10).default([]),
  budget: z.enum(["free", "freemium", "paid", "any"]).default("any"),
  priority: z.enum(["best_overall", "cheapest", "highest_rated", "best_match"]).default("best_overall"),
  platforms: z.array(z.string()).default([]),
  ambiguity_flags: z.array(z.string()).default([]),
});

function ruleBasedFallbackParser(queryText) {
  const lower = queryText.toLowerCase();
  let category = "General";

  if (lower.includes("ui") || lower.includes("design") || lower.includes("figma") || lower.includes("wireframe")) {
    category = "UI/Design";
  } else if (lower.includes("code") || lower.includes("coding") || lower.includes("vs code") || lower.includes("developer")) {
    category = "Coding";
  } else if (lower.includes("video") || lower.includes("movie") || lower.includes("edit video") || lower.includes("avatar")) {
    category = "Video";
  } else if (lower.includes("write") || lower.includes("writing") || lower.includes("article") || lower.includes("blog")) {
    category = "Writing";
  } else if (lower.includes("research") || lower.includes("paper") || lower.includes("academic") || lower.includes("citation")) {
    category = "Research";
  } else if (lower.includes("presentation") || lower.includes("slide") || lower.includes("deck") || lower.includes("powerpoint")) {
    category = "Presentations";
  }

  let budget = "any";
  if (lower.includes("free")) {
    budget = "free";
  } else if (lower.includes("paid")) {
    budget = "paid";
  }

  const reqs = [];
  if (lower.includes("figma")) reqs.push("Figma support");
  if (lower.includes("vs code") || lower.includes("vscode")) reqs.push("VS Code");
  if (lower.includes("pdf")) reqs.push("PDF analysis");
  if (lower.includes("avatar")) reqs.push("AI Avatar");
  if (lower.includes("slides") || lower.includes("deck")) reqs.push("Slide generation");

  return {
    category,
    requirements: reqs,
    budget,
    priority: "best_overall",
    platforms: [],
    ambiguity_flags: [],
  };
}

async function parseQueryWithGemini(userQuery) {
  const sanitizedQuery = userQuery.trim().slice(0, 500);
  return ruleBasedFallbackParser(sanitizedQuery);
}

module.exports = {
  QuerySpecSchema,
  parseQueryWithGemini,
};
