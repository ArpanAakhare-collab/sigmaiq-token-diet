import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";

export const QuerySpecSchema = z.object({
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

export type QuerySpec = z.infer<typeof QuerySpecSchema>;

const SYSTEM_PROMPT = `You are the Query Agent for AI Tool Navigator. Your task is to analyze user queries for AI tools and return a structured JSON object.

Output MUST be a valid JSON object matching this schema:
{
  "category": "Coding" | "UI/Design" | "Writing" | "Video" | "Research" | "Presentations" | "General",
  "requirements": string[], // max 10 extracted specific features or keywords requested (e.g. "Figma support", "VS Code", "PDF summarizer")
  "budget": "free" | "freemium" | "paid" | "any",
  "priority": "best_overall" | "cheapest" | "highest_rated" | "best_match",
  "platforms": string[], // e.g. ["Windows", "macOS", "Web", "Mobile"]
  "ambiguity_flags": string[]
}

Do NOT wrap the JSON in markdown codeblocks like \`\`\`json. Return raw JSON text only.`;

function ruleBasedFallbackParser(queryText: string): QuerySpec {
  const lower = queryText.toLowerCase();
  let category: QuerySpec["category"] = "General";

  if (lower.includes("ui") || lower.includes("design") || lower.includes("figma") || lower.includes("wireframe") || lower.includes("sketch") || lower.includes("layout")) {
    category = "UI/Design";
  } else if (lower.includes("code") || lower.includes("coding") || lower.includes("vs code") || lower.includes("developer") || lower.includes("script") || lower.includes("github")) {
    category = "Coding";
  } else if (lower.includes("video") || lower.includes("movie") || lower.includes("film") || lower.includes("avatar") || lower.includes("edit video") || lower.includes("short")) {
    category = "Video";
  } else if (lower.includes("write") || lower.includes("writing") || lower.includes("article") || lower.includes("blog") || lower.includes("copy") || lower.includes("essay")) {
    category = "Writing";
  } else if (lower.includes("research") || lower.includes("paper") || lower.includes("academic") || lower.includes("citation") || lower.includes("pdf") || lower.includes("journal")) {
    category = "Research";
  } else if (lower.includes("presentation") || lower.includes("slide") || lower.includes("deck") || lower.includes("powerpoint") || lower.includes("pitch")) {
    category = "Presentations";
  }

  let budget: QuerySpec["budget"] = "any";
  if (lower.includes("free")) {
    budget = "free";
  } else if (lower.includes("paid") || lower.includes("premium")) {
    budget = "paid";
  }

  const reqs: string[] = [];
  if (lower.includes("figma")) reqs.push("Figma support");
  if (lower.includes("vs code") || lower.includes("vscode")) reqs.push("VS Code");
  if (lower.includes("pdf")) reqs.push("PDF analysis");
  if (lower.includes("avatar")) reqs.push("AI Avatar");
  if (lower.includes("slides") || lower.includes("deck")) reqs.push("Slide generation");
  if (lower.includes("autocomplete")) reqs.push("Code autocomplete");

  const platforms: string[] = [];
  if (lower.includes("windows")) platforms.push("Windows");
  if (lower.includes("mac") || lower.includes("macos")) platforms.push("macOS");
  if (lower.includes("web") || lower.includes("browser")) platforms.push("Web");
  if (lower.includes("mobile") || lower.includes("ios") || lower.includes("android")) platforms.push("Mobile");

  return {
    category,
    requirements: reqs.slice(0, 10),
    budget,
    priority: lower.includes("cheap") ? "cheapest" : lower.includes("highest") ? "highest_rated" : "best_overall",
    platforms,
    ambiguity_flags: [],
  };
}

export async function parseQueryWithGemini(userQuery: string): Promise<QuerySpec> {
  const sanitizedQuery = userQuery.trim().slice(0, 500);

  if (!config.geminiApiKey) {
    console.log("No GEMINI_API_KEY found, using rule-based query parser fallback.");
    return ruleBasedFallbackParser(sanitizedQuery);
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `${SYSTEM_PROMPT}\n\nUser Query: "${sanitizedQuery}"`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(
        attempt === 2 ? `${prompt}\nCRITICAL: Ensure strict JSON syntax.` : prompt
      );
      const text = result.response.text().trim().replace(/^```json\s*/, "").replace(/```$/, "").trim();
      const rawObj = JSON.parse(text);
      const parsed = QuerySpecSchema.safeParse(rawObj);
      if (parsed.success) {
        return parsed.data;
      } else {
        console.warn(`Attempt ${attempt} Gemini Zod validation failed:`, parsed.error.format());
      }
    } catch (err) {
      console.warn(`Attempt ${attempt} Gemini API call / JSON parse error:`, err);
    }
  }

  console.log("Gemini retries exhausted, falling back to rule-based QuerySpec parser.");
  return ruleBasedFallbackParser(sanitizedQuery);
}
