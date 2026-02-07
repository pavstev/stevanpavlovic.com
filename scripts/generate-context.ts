import { generateAiContext } from "../src/lib/generate-ai-context";

void (async (): Promise<void> => {
  try {
    await generateAiContext();
  } catch (error) {
    console.error("Failed to generate AI context:", error);
    process.exit(1);
  }
})();
