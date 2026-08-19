import Tool, { ITool } from "@/models/Tool";
import { QuerySpec } from "./queryAgent";
import { connectToDatabase } from "@/lib/mongodb";

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export interface DiscoveryResult {
  tools: any[];
  stage: number;
  fallbackUsed: boolean;
  message?: string;
}

// 36 Genuine Seed Tools Dataset for immediate fallback when DB connection is pending/offline
export const MEMORY_SEED_TOOLS: any[] = [
  // --- CODING (6) ---
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
  {
    _id: "coding_4",
    name: "Replit Agent",
    category: ["Coding"],
    description: "Autonomous software development agent that plans, builds, and deploys full-stack web applications from text prompts.",
    features: ["Full-stack Generation", "One-click Cloud Hosting", "Browser Preview", "PostgreSQL Integration"],
    pricingTier: "freemium",
    platforms: ["Web", "Mobile"],
    officialUrl: "https://replit.com",
    rating: 4.6,
    reviewSummary: "Game-changer for rapid prototyping, handling dependencies and server configuration automatically.",
  },
  {
    _id: "coding_5",
    name: "Tabnine",
    category: ["Coding"],
    description: "Privacy-focused AI assistant with customizable local models for enterprise developer privacy.",
    features: ["Zero Code Retention", "Self-Hosted Deployment", "Contextual Completion", "Team Code Style Adaptation"],
    pricingTier: "freemium",
    platforms: ["Windows", "macOS", "Linux"],
    officialUrl: "https://tabnine.com",
    rating: 4.5,
    reviewSummary: "Best choice for enterprise teams requiring strict data privacy and on-premise model execution.",
  },
  {
    _id: "coding_6",
    name: "Amazon Q Developer",
    category: ["Coding"],
    description: "AWS-optimized AI coding assistant for code generation, security patching, and cloud infrastructure.",
    features: ["AWS Service Guidance", "Security Vulnerability Remediation", "Java Code Transformation", "Free Individual Tier"],
    pricingTier: "freemium",
    platforms: ["Windows", "macOS", "Web"],
    officialUrl: "https://aws.amazon.com/q/developer",
    rating: 4.4,
    reviewSummary: "Essential assistant for developers working heavily within the Amazon Web Services ecosystem.",
  },

  // --- UI/DESIGN (6) ---
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
  {
    _id: "design_3",
    name: "Midjourney",
    category: ["UI/Design"],
    description: "Industry-leading generative AI art tool creating photorealistic illustrations, UI mockups, and visual assets.",
    features: ["Photorealistic Image Generation", "Style Consistency Controls", "Web Editor Interface", "High Resolution Upscaling"],
    pricingTier: "paid",
    platforms: ["Web"],
    officialUrl: "https://midjourney.com",
    rating: 4.9,
    reviewSummary: "Unmatched aesthetic quality for visual assets, concept art, and high-fidelity UI moodboards.",
  },
  {
    _id: "design_4",
    name: "Uizard",
    category: ["UI/Design"],
    description: "AI-powered wireframing and prototyping platform that turns hand-drawn sketches into editable UI designs.",
    features: ["Sketch to UI Screen", "Text-to-Prototype", "UX Theme Generator", "Collaborative Editing"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://uizard.io",
    rating: 4.6,
    reviewSummary: "Ideal for product managers and non-designers seeking rapid wireframe creation from low-fi sketches.",
  },
  {
    _id: "design_5",
    name: "Galileo AI",
    category: ["UI/Design"],
    description: "AI copilot for interface design that generates editable multi-screen mobile and web UI designs.",
    features: ["Text-to-Figma Export", "Design System Adherence", "Micro-copy Generation", "Figma Support"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://usegalileo.ai",
    rating: 4.7,
    reviewSummary: "Generates beautiful, cohesive Figma vector screens from natural language UI descriptions.",
  },
  {
    _id: "design_6",
    name: "Relume AI",
    category: ["UI/Design"],
    description: "AI sitemap and wireframe builder for web designers using Webflow and Figma.",
    features: ["AI Sitemap Builder", "Wireframe Component Library", "Webflow Export", "Figma Export"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://relume.io",
    rating: 4.7,
    reviewSummary: "Accelerates website planning by building complete sitemaps and wireframe layouts in minutes.",
  },

  // --- WRITING (6) ---
  {
    _id: "writing_1",
    name: "Claude 3.5 Sonnet",
    category: ["Writing", "Coding", "Research"],
    description: "State-of-the-art AI assistant featuring unmatched reasoning, nuanced writing tone, and Artifacts visual workplace.",
    features: ["Artifacts Dynamic Canvas", "200k Context Window", "Nuanced Prose Writing", "Advanced Technical Analysis"],
    pricingTier: "freemium",
    platforms: ["Web", "macOS", "Mobile"],
    officialUrl: "https://claude.ai",
    rating: 4.9,
    reviewSummary: "The top choice for writers and developers seeking natural human-like prose and precise context comprehension.",
  },
  {
    _id: "writing_2",
    name: "ChatGPT Plus",
    category: ["Writing", "Research"],
    description: "Versatile conversational AI powered by GPT-4o with web search, data analysis, custom GPTs, and voice mode.",
    features: ["GPT-4o Multimodal Model", "Advanced Data Analysis", "Web Browsing", "Custom GPT Creator"],
    pricingTier: "freemium",
    platforms: ["Web", "Windows", "macOS", "Mobile"],
    officialUrl: "https://chatgpt.com",
    rating: 4.8,
    reviewSummary: "The default daily assistant with comprehensive web access and custom GPT ecosystem.",
  },
  {
    _id: "writing_3",
    name: "Jasper AI",
    category: ["Writing"],
    description: "Enterprise marketing AI copilot tailored for brand voice consistency, blog content, and social media campaigns.",
    features: ["Brand Voice Engine", "SEO Content Optimizer", "Multi-channel Campaigns", "Plagiarism Checker"],
    pricingTier: "paid",
    platforms: ["Web"],
    officialUrl: "https://jasper.ai",
    rating: 4.5,
    reviewSummary: "Built specifically for marketing departments requiring enterprise governance and brand style guides.",
  },
  {
    _id: "writing_4",
    name: "Copy.ai",
    category: ["Writing"],
    description: "GTM AI platform for marketing and sales copy, automated workflow sequences, and content scaling.",
    features: ["GTM Workflow Builder", "Automated Email Sequences", "Brand Voice Integration", "Free Tier Available"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://copy.ai",
    rating: 4.6,
    reviewSummary: "Excellent for automating sales emails, product descriptions, and ad copy variants.",
  },
  {
    _id: "writing_5",
    name: "Writesonic",
    category: ["Writing"],
    description: "AI article generator trained on real-time web data with built-in SEO scoring and factual grounding.",
    features: ["Real-time Google Search Integration", "SEO Article Writer 5.0", "Brand Voice", "Grammar Checker"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://writesonic.com",
    rating: 4.5,
    reviewSummary: "Great tool for long-form SEO articles that require up-to-date online search sources.",
  },
  {
    _id: "writing_6",
    name: "Grammarly GO",
    category: ["Writing"],
    description: "Contextual writing assistant integrated across browser and desktop to rewrite, compose, and refine text.",
    features: ["Tone Adjustments", "Inline One-click Rewrites", "Universal Browser Extension", "Plagiarism Detection"],
    pricingTier: "freemium",
    platforms: ["Windows", "macOS", "Web", "Mobile"],
    officialUrl: "https://grammarly.com",
    rating: 4.7,
    reviewSummary: "Indispensable companion for maintaining clear professional grammar and tone everywhere you write.",
  },

  // --- VIDEO (6) ---
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
    name: "Synthesia",
    category: ["Video"],
    description: "AI video generation platform creating studio-quality videos with realistic digital avatars in 140+ languages.",
    features: ["140+ AI Avatars", "Voice Cloning", "Script-to-Video Studio", "SCORM LMS Export"],
    pricingTier: "paid",
    platforms: ["Web"],
    officialUrl: "https://synthesia.io",
    rating: 4.7,
    reviewSummary: "The enterprise market leader for corporate training, onboarding, and multi-lingual video production.",
  },
  {
    _id: "video_3",
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
  {
    _id: "video_4",
    name: "Descript",
    category: ["Video", "Writing"],
    description: "All-in-one text-based video and podcast editor allowing edits by simply editing text transcripts.",
    features: ["Edit Video via Transcript", "Overdub AI Voice Generation", "Filler Word Removal", "Studio Sound Audio Polish"],
    pricingTier: "freemium",
    platforms: ["Windows", "macOS", "Web"],
    officialUrl: "https://descript.com",
    rating: 4.8,
    reviewSummary: "Revolutionary editor that makes video editing as simple as editing a Word document.",
  },
  {
    _id: "video_5",
    name: "Pika Labs",
    category: ["Video"],
    description: "AI video generator specializing in stylized animations, visual effects additions, and aspect ratio conversion.",
    features: ["Text & Image to Video", "Modify Region / Inpainting", "Sound Effects Generator", "Lip Sync"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://pika.art",
    rating: 4.6,
    reviewSummary: "Popular choice for creative short animations, meme videos, and localized visual object modifications.",
  },
  {
    _id: "video_6",
    name: "InVideo AI",
    category: ["Video"],
    description: "Turn prompts into ready-to-publish videos with commentary scripts, voiceovers, background footage, and subtitles.",
    features: ["Script to Video Workflow", "Humanlike Voiceovers", "Stock Media Integration", "Text Prompt Editing"],
    pricingTier: "freemium",
    platforms: ["Web", "Mobile"],
    officialUrl: "https://invideo.io",
    rating: 4.5,
    reviewSummary: "Great for YouTube Shorts, TikToks, and marketing videos created entirely from text prompts.",
  },

  // --- RESEARCH (6) ---
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
    name: "Elicit",
    category: ["Research"],
    description: "AI research assistant analyzing academic papers, synthesizing findings across studies, and building literature matrices.",
    features: ["200M Paper Database Search", "Table Matrix Extraction", "Methodology Summaries", "Export to BibTeX"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://elicit.com",
    rating: 4.8,
    reviewSummary: "Essential tool for literature reviews, instantly extracting sample sizes and outcomes from scientific papers.",
  },
  {
    _id: "research_3",
    name: "Consensus",
    category: ["Research"],
    description: "Academic AI search engine querying Peer-reviewed scientific research papers to provide consensus meters.",
    features: ["Consensus Meter Index", "Peer-reviewed Paper Filter", "Copilot Synthesis", "Key Claims Summary"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://consensus.app",
    rating: 4.8,
    reviewSummary: "Superb for fact-checking scientific claims directly against published peer-reviewed medical and scientific literature.",
  },
  {
    _id: "research_4",
    name: "SciSpace",
    category: ["Research"],
    description: "Copilot for reading and decoding complex scientific PDFs, equations, charts, and journal citations.",
    features: ["PDF Explainer Copilot", "Mathematical Equation Simplifier", "Multilingual Translation", "Literature Mapping"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://typeset.io",
    rating: 4.7,
    reviewSummary: "Drastically reduces reading time for complex research PDFs by explaining figures and math inline.",
  },
  {
    _id: "research_5",
    name: "Semantic Scholar",
    category: ["Research"],
    description: "AI-driven scientific research tool by Allen Institute for AI mapping citation graphs and paper influence.",
    features: ["TLDR Short Summaries", "Citation Impact Graph", "Author Collaboration Network", "Free Academic Access"],
    pricingTier: "free",
    platforms: ["Web"],
    officialUrl: "https://semanticscholar.org",
    rating: 4.7,
    reviewSummary: "Free academic standard for navigating citation networks and finding key foundational papers.",
  },
  {
    _id: "research_6",
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

  // --- PRESENTATIONS (6) ---
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
  {
    _id: "presentation_3",
    name: "Beautiful.ai",
    category: ["Presentations"],
    description: "Smart presentation software with adaptive layout rules that keep slides looking professionally designed automatically.",
    features: ["Smart Layout Engine", "Corporate Brand Templates", "Stock Media Library", "PowerPoint Export"],
    pricingTier: "paid",
    platforms: ["Web"],
    officialUrl: "https://beautiful.ai",
    rating: 4.6,
    reviewSummary: "Perfect for corporate design teams ensuring strict adherence to branding and slide layout alignment.",
  },
  {
    _id: "presentation_4",
    name: "Pitch AI",
    category: ["Presentations"],
    description: "Collaborative presentation tool for modern teams with AI generator, real-time editing, and viewer analytics.",
    features: ["Real-time Co-editing", "AI Slide Generator", "Engagement Analytics", "Integration with Notion & Slack"],
    pricingTier: "freemium",
    platforms: ["Windows", "macOS", "Web"],
    officialUrl: "https://pitch.com",
    rating: 4.7,
    reviewSummary: "Sleek presentation software tailored for high-stakes business proposals and team collaboration.",
  },
  {
    _id: "presentation_5",
    name: "SlidesAI",
    category: ["Presentations"],
    description: "Google Slides extension that turns long text documents and articles into formatted presentation slides instantly.",
    features: ["Google Slides Native Integration", "Text to Slides Conversion", "Multi-lingual Support", "Free Tier"],
    pricingTier: "freemium",
    platforms: ["Web"],
    officialUrl: "https://slidesai.io",
    rating: 4.5,
    reviewSummary: "Convenient add-on for educators and students who work directly inside Google Slides.",
  },
  {
    _id: "presentation_6",
    name: "Canva Magic Studio",
    category: ["Presentations", "UI/Design"],
    description: "Comprehensive AI creative suite inside Canva for generating slide presentations, image edits, and design assets.",
    features: ["Magic Design for Presentations", "Brand Kit Sync", "Massive Asset Ecosystem", "Video Export"],
    pricingTier: "freemium",
    platforms: ["Windows", "macOS", "Web", "Mobile"],
    officialUrl: "https://canva.com",
    rating: 4.8,
    reviewSummary: "The ultimate graphic design and presentation ecosystem accessible to everyone.",
  },
];

export async function discoverTools(spec: QuerySpec, userQuery: string): Promise<DiscoveryResult> {
  const db = await connectToDatabase();
  const category = spec.category;
  const keywords = spec.requirements.map((r) => escapeRegex(r));
  const sanitizedQuery = escapeRegex(userQuery.trim());

  if (db) {
    try {
      // Stage 1: Exact Category + Requirement Keyword Match in MongoDB
      if (category !== "General" && keywords.length > 0) {
        const stage1Tools = await Tool.find({
          category: category,
          $or: keywords.map((kw) => ({
            $or: [
              { name: { $regex: kw, $options: "i" } },
              { description: { $regex: kw, $options: "i" } },
              { features: { $regex: kw, $options: "i" } },
            ],
          })),
        }).lean();

        if (stage1Tools.length > 0) {
          return { tools: stage1Tools, stage: 1, fallbackUsed: false };
        }
      }

      // Stage 2: Exact Category Match in MongoDB
      if (category !== "General") {
        const stage2Tools = await Tool.find({ category: category }).lean();
        if (stage2Tools.length > 0) {
          return { tools: stage2Tools, stage: 2, fallbackUsed: false };
        }
      }

      // Stage 3: Text Search across ALL categories in MongoDB
      if (sanitizedQuery.length > 0) {
        const terms = sanitizedQuery.split(/\s+/).filter((t) => t.length > 2).map((t) => escapeRegex(t));
        if (terms.length > 0) {
          const stage3Tools = await Tool.find({
            $or: terms.map((t) => ({
              $or: [
                { name: { $regex: t, $options: "i" } },
                { description: { $regex: t, $options: "i" } },
                { features: { $regex: t, $options: "i" } },
              ],
            })),
          }).lean();

          if (stage3Tools.length > 0) {
            return {
              tools: stage3Tools,
              stage: 3,
              fallbackUsed: true,
              message: "No exact category match found. Showing related tools.",
            };
          }
        }
      }

      // Stage 4: Top rated MongoDB tools
      const dbFallback = await Tool.find({}).sort({ rating: -1 }).limit(10).lean();
      if (dbFallback.length > 0) {
        return {
          tools: dbFallback,
          stage: 4,
          fallbackUsed: true,
          message: "No exact matches found. Here are the closest matches.",
        };
      }
    } catch (err) {
      console.warn("MongoDB discovery query error, falling back to memory store:", err);
    }
  }

  // --- In-Memory Fallback Discovery Agent ---
  if (category !== "General") {
    const memCatTools = MEMORY_SEED_TOOLS.filter((t) =>
      t.category.some((c: string) => c.toLowerCase() === category.toLowerCase())
    );
    if (memCatTools.length > 0) {
      return { tools: memCatTools, stage: 2, fallbackUsed: false };
    }
  }

  const memMatched = MEMORY_SEED_TOOLS.filter((t) => {
    const qLower = userQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(qLower) ||
      t.description.toLowerCase().includes(qLower) ||
      t.category.some((c: string) => qLower.includes(c.toLowerCase()))
    );
  });

  if (memMatched.length > 0) {
    return {
      tools: memMatched,
      stage: 3,
      fallbackUsed: true,
      message: "Showing related tools from dataset.",
    };
  }

  return {
    tools: MEMORY_SEED_TOOLS.slice(0, 8),
    stage: 4,
    fallbackUsed: true,
    message: "No exact matches found. Here are the closest matches.",
  };
}
