const path = require("path");
const fs = require("fs");

// Load .env.local if exists
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const { parseQueryWithGemini } = require("./ts_helpers/queryAgent");
const { discoverTools } = require("./ts_helpers/discoveryAgent");
const { rankTools } = require("./ts_helpers/rankingAgent");

const TEST_QUERIES = [
  "best free AI for UI design with Figma support",
  "best AI video editing tool",
  "AI for academic research and paper summaries",
  "AI for creating slides and presentations",
  "free AI coding assistant for VS Code",
];

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING QA SEARCH PIPELINE VERIFICATION TESTS");
  console.log("==================================================\n");

  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const q = TEST_QUERIES[i];
    console.log(`Test ${i + 1}: "${q}"`);

    const parsed = await parseQueryWithGemini(q);
    console.log(`- Extracted Category: "${parsed.category}"`);
    console.log(`- Extracted Requirements: [${parsed.requirements.join(", ")}]`);
    console.log(`- Extracted Budget: "${parsed.budget}"`);

    const discovery = await discoverTools(parsed, q);
    console.log(`- Discovery Stage: ${discovery.stage} (Fallback Used: ${discovery.fallbackUsed})`);
    console.log(`- Candidate Tools Found: ${discovery.tools.length}`);

    const ranked = rankTools(discovery.tools, parsed, q);
    console.log(`- Top 3 Results:`);
    ranked.slice(0, 3).forEach((r, idx) => {
      console.log(
        `   ${idx + 1}. ${r.tool.name} | Match: ${r.matchPercentage}% | Sub-Scores: Task=${r.subScores.taskMatch}, Feat=${r.subScores.featureMatch}, Price=${r.subScores.price}, Plat=${r.subScores.platformFit}, Rev=${r.subScores.reviews}, Rel=${r.subScores.reliability}`
      );
      console.log(`      Why: ${r.whyThisTool[0]}`);
    });
    console.log("--------------------------------------------------\n");
  }
}

runTests().catch(console.error);
