import { env, pipeline } from "@xenova/transformers";

/**
 * World-Class AI Worker
 * * Implements a robust Retrieval-Augmented Generation (RAG) pipeline entirely in the browser.
 * Uses a quantized FLAN-T5 model for generation and MiniLM for semantic search.
 */

// 1. Configuration
env.allowLocalModels = false;
env.useBrowserCache = true;

// Models optimized for web execution
const CONFIG = {
  embeddingModel: "Xenova/all-MiniLM-L6-v2",
  generationModel: "Xenova/LaMini-Flan-T5-783M",
  // generationModel: 'Xenova/flan-t5-small', // Fallback for very low-end devices if needed
};

interface DocumentChunk {
  content: string;
  id: string;
  score?: number;
  title: string;
}

type GenerationFunction = (prompt: string, options?: Record<string, unknown>) => Promise<GenerationOutput[]>;

interface GenerationOutput {
  generated_text: string;
}

type PipelineFunction = (inputs: string | string[], options?: PipelineOptions) => Promise<PipelineOutput>;

// Pipeline types from @xenova/transformers
interface PipelineOptions {
  normalize?: boolean;
  pooling?: "cls" | "mean" | "none";
}

interface PipelineOutput {
  data: number[][];
}

interface WorkerMessage {
  text?: string;
  type: "init" | "query";
}
interface WorkerResponse {
  message?: string;
  progress?: number; // For loading bars
  response?: string;
  sources?: DocumentChunk[];
  status: WorkerStatus;
}

// 2. Types
type WorkerStatus = "error" | "generating" | "idle" | "loading" | "ready";

// 3. State Management (Singleton)
class RAGPipeline {
  private static instance: RAGPipeline;
  private context: DocumentChunk[] = [];
  private embedder: PipelineFunction | null = null;
  private embeddings: number[][] = [];
  private generator: GenerationFunction | null = null;

  private constructor() {}

  public static getInstance(): RAGPipeline {
    if (!RAGPipeline.instance) {
      RAGPipeline.instance = new RAGPipeline();
    }
    return RAGPipeline.instance;
  }

  // Initialize the pipeline (Load models & data)
  public async initialize(postMessage: (msg: WorkerResponse) => void): Promise<void> {
    if (this.embedder && this.generator) return;

    try {
      // Step A: Load Portfolio Context
      postMessage({ message: "Fetching portfolio data...", progress: 10, status: "loading" });
      const res = await fetch("/api/portfolio-context.json");
      if (!res.ok) throw new Error("Failed to load context");
      this.context = await res.json();

      // Step B: Load Embedding Model
      postMessage({ message: "Loading embedding engine...", progress: 30, status: "loading" });
      this.embedder = (await pipeline("feature-extraction", CONFIG.embeddingModel, {
        progress_callback: (p: { progress?: number; status: string }) => {
          if (p.status === "progress") {
            // Map model loading 0-100 to overall 30-60 range
            postMessage({
              message: "Loading embedding engine...",
              progress: 30 + (p.progress || 0) * 0.3,
              status: "loading",
            });
          }
        },
      })) as PipelineFunction;

      // Step C: Index Content (Vectorization)
      postMessage({ message: "Indexing knowledge base...", progress: 65, status: "loading" });
      const output = (await this.embedder(
        this.context.map((d) => d.content),
        { normalize: true, pooling: "mean" },
      )) as { data: number[][] };
      this.embeddings = output.data.map((vec) => vec.map(Number));

      // Step D: Load LLM
      postMessage({ message: "Loading generative model...", progress: 80, status: "loading" });
      this.generator = (await pipeline("text2text-generation", CONFIG.generationModel, {
        progress_callback: (p: { progress?: number; status: string }) => {
          if (p.status === "progress") {
            // Map model loading 0-100 to overall 80-100 range
            postMessage({
              message: "Loading generative model...",
              progress: 80 + (p.progress || 0) * 0.2,
              status: "loading",
            });
          }
        },
      })) as GenerationFunction;

      postMessage({ message: "AI Online", progress: 100, status: "ready" });
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      postMessage({ message: `Initialization failed: ${errorMessage}`, status: "error" });
    }
  }

  // Handle User Query
  public async query(text: string, postMessage: (msg: WorkerResponse) => void): Promise<void> {
    if (!this.embedder || !this.generator) {
      postMessage({ message: "Pipeline not initialized", status: "error" });
      return;
    }

    try {
      postMessage({ message: "Thinking...", status: "generating" });

      // 1. Embed Query
      const qOutput = (await this.embedder(text, { normalize: true, pooling: "mean" })) as { data: number[][] };
      const qVec = Array.from(qOutput.data[0]).map(Number);

      // 2. Semantic Search
      const scores = this.embeddings.map((vec, i) => ({
        index: i,
        score: this.cosineSimilarity(qVec, vec),
      }));

      // Top 3 chunks
      const topChunks = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((s) => ({ ...this.context[s.index], score: s.score }));

      // 3. Prompt Engineering
      // Note: LaMini models perform best with simple instruction-following formats
      const contextBlock = topChunks.map((c) => `- ${c.content}`).join("\n");
      const prompt = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.\n\nContext:\n${contextBlock}\n\nQuestion: ${text}\nHelpful Answer:`;

      // 4. Generation
      const output = (await this.generator(prompt, {
        do_sample: false, // Greedy search for factual accuracy
        max_new_tokens: 150,
        temperature: 0.1, // Deterministic
        top_k: 10,
      })) as { generated_text: string }[];

      postMessage({
        response: output[0].generated_text,
        sources: topChunks,
        status: "ready", // Return to ready state
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      postMessage({ message: `Generation failed: ${errorMessage}`, status: "error" });
    }
  }

  // Calculate Cosine Similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// 4. Worker Event Listener
const rag = RAGPipeline.getInstance();

self.addEventListener("message", async (e: MessageEvent<WorkerMessage>): Promise<void> => {
  const { text, type } = e.data;

  if (type === "init") {
    await rag.initialize((msg) => {
      self.postMessage(msg);
    });
    return;
  }

  if (type === "query" && text) {
    await rag.query(text, (msg) => {
      self.postMessage(msg);
    });
    return;
  }
});
