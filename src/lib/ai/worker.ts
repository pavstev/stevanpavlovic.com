import { env, pipeline } from '@xenova/transformers';

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
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  generationModel: 'Xenova/LaMini-Flan-T5-783M',
  // generationModel: 'Xenova/flan-t5-small', // Fallback for very low-end devices if needed
};

// 2. Types
type WorkerStatus = 'idle' | 'loading' | 'ready' | 'generating' | 'error';

interface WorkerMessage {
  type: 'init' | 'query';
  text?: string;
}

interface WorkerResponse {
  status: WorkerStatus;
  message?: string;
  progress?: number; // For loading bars
  response?: string;
  sources?: DocumentChunk[];
}

interface DocumentChunk {
  id: string;
  content: string;
  title: string;
  score?: number;
}

// 3. State Management (Singleton)
class RAGPipeline {
  private static instance: RAGPipeline;
  private embedder: any = null;
  private generator: any = null;
  private context: DocumentChunk[] = [];
  private embeddings: number[][] = [];

  private constructor() {}

  public static getInstance(): RAGPipeline {
    if (!RAGPipeline.instance) {
      RAGPipeline.instance = new RAGPipeline();
    }
    return RAGPipeline.instance;
  }

  // Calculate Cosine Similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Initialize the pipeline (Load models & data)
  public async initialize(postMessage: (msg: WorkerResponse) => void) {
    if (this.embedder && this.generator) return;

    try {
      // Step A: Load Portfolio Context
      postMessage({ status: 'loading', message: 'Fetching portfolio data...', progress: 10 });
      const res = await fetch('/api/portfolio-context.json');
      if (!res.ok) throw new Error('Failed to load context');
      this.context = await res.json();

      // Step B: Load Embedding Model
      postMessage({ status: 'loading', message: 'Loading embedding engine...', progress: 30 });
      this.embedder = await pipeline('feature-extraction', CONFIG.embeddingModel, {
        progress_callback: (p: any) => {
           if (p.status === 'progress') {
             // Map model loading 0-100 to overall 30-60 range
             postMessage({ status: 'loading', message: 'Loading embedding engine...', progress: 30 + (p.progress || 0) * 0.3 });
           }
        }
      });

      // Step C: Index Content (Vectorization)
      postMessage({ status: 'loading', message: 'Indexing knowledge base...', progress: 65 });
      const output = await this.embedder(this.context.map(d => d.content), { pooling: 'mean', normalize: true });
      this.embeddings = output.tolist();

      // Step D: Load LLM
      postMessage({ status: 'loading', message: 'Loading generative model...', progress: 80 });
      this.generator = await pipeline('text2text-generation', CONFIG.generationModel, {
        progress_callback: (p: any) => {
           if (p.status === 'progress') {
             // Map model loading 0-100 to overall 80-100 range
             postMessage({ status: 'loading', message: 'Loading generative model...', progress: 80 + (p.progress || 0) * 0.2 });
           }
        }
      });

      postMessage({ status: 'ready', message: 'AI Online', progress: 100 });
    } catch (err: any) {
      console.error(err);
      postMessage({ status: 'error', message: `Initialization failed: ${err.message}` });
    }
  }

  // Handle User Query
  public async query(text: string, postMessage: (msg: WorkerResponse) => void) {
    if (!this.embedder || !this.generator) {
      postMessage({ status: 'error', message: 'Pipeline not initialized' });
      return;
    }

    try {
      postMessage({ status: 'generating', message: 'Thinking...' });

      // 1. Embed Query
      const qOutput = await this.embedder(text, { pooling: 'mean', normalize: true });
      const qVec = Array.from(qOutput.data) as number[];

      // 2. Semantic Search
      const scores = this.embeddings.map((vec, i) => ({
        index: i,
        score: this.cosineSimilarity(qVec, vec)
      }));

      // Top 3 chunks
      const topChunks = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(s => ({ ...this.context[s.index], score: s.score }));

      // 3. Prompt Engineering
      // Note: LaMini models perform best with simple instruction-following formats
      const contextBlock = topChunks.map(c => `- ${c.content}`).join('\n');
      const prompt = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.\n\nContext:\n${contextBlock}\n\nQuestion: ${text}\nHelpful Answer:`;

      // 4. Generation
      const output = await this.generator(prompt, {
        max_new_tokens: 150,
        temperature: 0.1, // Deterministic
        top_k: 10,
        do_sample: false // Greedy search for factual accuracy
      });

      postMessage({
        status: 'ready', // Return to ready state
        response: output[0].generated_text,
        sources: topChunks
      });

    } catch (err: any) {
      postMessage({ status: 'error', message: `Generation failed: ${err.message}` });
    }
  }
}

// 4. Worker Event Listener
const rag = RAGPipeline.getInstance();

self.addEventListener('message', async (e: MessageEvent<WorkerMessage>) => {
  const { type, text } = e.data;

  if (type === 'init') {
    await rag.initialize(msg => self.postMessage(msg));
  } else if (type === 'query' && text) {
    await rag.query(text, msg => self.postMessage(msg));
  }
});
