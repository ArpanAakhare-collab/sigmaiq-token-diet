const MEMORY_SEED_TOOLS = [
  // Coding
  {
    _id: "coding_1",
    name: "Cursor AI",
    category: ["Coding"],
    description: "The AI-first Code Editor built on VS Code with deep code context, inline refactoring, and multi-file editing.",
    features: ["VS Code Fork", "Multi-file Editing", "Terminal AI Commands", "Custom Model Switch", "Figma Integration"],
    pricingTier: "freemium",
    platforms: ["Windows", "macOS", "Linux"],
    officialUrl: "https://cursor.com",
    rating: 4.9,
    reviewSummary: "Widely regarded as the most powerful AI code editor, enabling seamless agentic refactoring.",
  },
  {
    _id: "coding_2",
    name: "GitHub Copilot",
    category: ["Coding"],
    description: "AI pair programmer providing autocomplete suggestions directly in VS Code, JetBrains, and Visual Studio.",
    features: ["IDE Autocomplete", "Chat Assistance", "CLI Support", "Security Vulnerability Scanning"],
    pricingTier: "paid",
    platforms: ["Windows", "macOS", "Web"],
    officialUrl: "https://github.com/features/copilot",
    rating: 4.7,
    reviewSummary: "The industry standard for real-time inline code completion across dozens of programming languages.",
  },
  {
    _id: "coding_3",
    name: "Codeium",
    category: ["Coding"],
    description: "Ultra-fast, free AI code completion and search extension supporting over 70+ languages and 40+ IDEs.",
    features: ["Free for Individuals", "Multi-file Context", "Repository Search", "In-editor Chat"],
    pricingTier: "free",
    platforms: ["Windows", "macOS", "Web"],
    officialUrl: "https://codeium.com",
    rating: 4.8,
    reviewSummary: "Incredible free alternative to Copilot with blistering response speed and low memory usage.",
  },
  // UI/Design
  {
    _id: "design_1",
    name: "v0 by Vercel",
    category: ["UI/Design", "Coding"],
    description: "Generative UI system that produces responsive React Tailwind and shadcn/ui components from prompts.",
    features: ["Shadcn/UI Generation", "Tailwind CSS Styling", "Live Preview", "Code Copy & Export", "Figma Support"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://v0.dev",
    rating: 4.9,
    reviewSummary: "The gold standard for generating modern frontend React components with production-grade markup.",
  },
  {
    _id: "design_2",
    name: "Figma AI",
    category: ["UI/Design"],
    description: "Native AI capabilities integrated directly into Figma for vector layout generation, background removal, and auto-naming.",
    features: ["Prompt to Design", "Auto Layout Helper", "Content Generation", "Vector Asset Generator", "Figma Support"],
    pricingTier: "freemium",
    platforms: ["Windows", "macOS", "Web"],
    officialUrl: "https://figma.com",
    rating: 4.8,
    reviewSummary: "Seamlessly enhances UI designer workflow directly inside Figma without context switching.",
  },
  // Video
  {
    _id: "video_1",
    name: "Runway Gen-3 Alpha",
    category: ["Video"],
    description: "Generative AI model for high-definition video generation, camera motion control, and visual effects.",
    features: ["Text-to-Video", "Image-to-Video", "Motion Brush Controls", "4K Video Upscaling"],
    pricingTier: "freemium",
    platforms: ["Web", "Mobile"],
    officialUrl: "https://runwayml.com",
    rating: 4.8,
    reviewSummary: "Pioneer in cinematic AI video generation with refined physics and camera movement controls.",
  },
  {
    _id: "video_2",
    name: "HeyGen",
    category: ["Video"],
    description: "Next-gen avatar video platform featuring hyper-realistic digital twin creation and video translation with lip sync.",
    features: ["Custom Photo Avatars", "Video Lip Sync Translation", "Text-to-Video Studio", "API Integration"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://heygen.com",
    rating: 4.8,
    reviewSummary: "Astonishing video translation lip-sync capability that converts spoken video into multiple target languages.",
  },
  // Research
  {
    _id: "research_1",
    name: "Perplexity AI",
    category: ["Research"],
    description: "Conversational answer engine delivering grounded, cited answers backed by live web search and academic sources.",
    features: ["Live Citations & Sources", "Pro Search Deep Research", "Academic Filter", "File Upload Analysis"],
    pricingTier: "freemium",
    platforms: ["Web", "Mobile"],
    officialUrl: "https://perplexity.ai",
    rating: 4.9,
    reviewSummary: "The ultimate modern research search engine, replacing traditional search engine links with synthesis.",
  },
  {
    _id: "research_2",
    name: "NotebookLM",
    category: ["Research", "Writing"],
    description: "Google's personalized AI research notebook that grounds answers strictly in your uploaded PDF notes and documents.",
    features: ["Audio Overview Podcast Generator", "Source-grounded Chat", "Document Summarizer", "Notebook Notes Grid"],
    pricingTier: "free",
    platforms: ["Web"],
    officialUrl: "https://notebooklm.google.com",
    rating: 4.9,
    reviewSummary: "Outstanding tool for studying and research notes with zero hallucination outside uploaded materials.",
  },
  // Presentations
  {
    _id: "presentation_1",
    name: "Gamma App",
    category: ["Presentations"],
    description: "AI-powered presentation, document, and webpage generator crafting polished interactive visual decks in seconds.",
    features: ["Prompt-to-Deck Generator", "Interactive Embeds", "Analytics Dashboard", "One-click Theme Styling"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://gamma.app",
    rating: 4.9,
    reviewSummary: "The modern standard for generating gorgeous presentation decks without slide alignment frustration.",
  },
  {
    _id: "presentation_2",
    name: "Tome AI",
    category: ["Presentations"],
    description: "Generative storytelling platform creating immersive visual slide decks, pitch proposals, and mood boards.",
    features: ["Generative Story Decks", "DALL-E Asset Generation", "Figma Frame Embeds", "Mobile Responsive Views"],
    pricingTier: "freemium",
    platforms: ["Web", "Mobile"],
    officialUrl: "https://tome.app",
    rating: 4.7,
    reviewSummary: "Powerful generative presentation builder for startup pitch decks and strategic executive summaries.",
  },
];

async function discoverTools(spec, userQuery) {
  const category = spec.category;
  if (category !== "General") {
    const matched = MEMORY_SEED_TOOLS.filter((t) =>
      t.category.some((c) => c.toLowerCase() === category.toLowerCase())
    );
    if (matched.length > 0) {
      return { tools: matched, stage: 2, fallbackUsed: false };
    }
  }
  return { tools: MEMORY_SEED_TOOLS.slice(0, 5), stage: 4, fallbackUsed: true };
}

module.exports = {
  MEMORY_SEED_TOOLS,
  discoverTools,
};
