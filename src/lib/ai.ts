export interface SemanticSearchResult {
  corpus_id: number;
  score: number;
  text: string;
}

/**
 * Manager for the AI Web Worker to keep heavy computations off the main thread.
 */
class AIWorkerManager {
  private worker: Worker | null = null;
  private idCounter = 0;
  private callbacks = new Map<number, { resolve: Function, reject: Function }>();
  private preloadingPromise: Promise<void> | null = null;

  private getWorker() {
    if (!this.worker) {
      // Create a new worker using Vite's worker support
      this.worker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { type, id, payload, error } = event.data;

        if (type === 'init_complete') {
            const callback = this.callbacks.get(id);
            callback?.resolve();
            this.callbacks.delete(id);
            return;
        }

        const callback = this.callbacks.get(id);
        if (!callback) return;

        if (error) {
          callback.reject(new Error(error));
        } else {
          callback.resolve(payload);
        }
        this.callbacks.delete(id);
      };

      this.worker.onerror = (error) => {
          console.error("Worker error:", error);
      };
    }
    return this.worker;
  }

  private send(type: string, payload: any, transferables?: Transferable[]): Promise<any> {
    const id = this.idCounter++;
    const worker = this.getWorker();
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      worker.postMessage({ type, id, payload }, transferables ? { transfer: transferables } : undefined);
    });
  }

  async preload(): Promise<void> {
    if (this.preloadingPromise) return this.preloadingPromise;

    this.preloadingPromise = (async () => {
      console.log('Starting AI preloading via Worker...');

      try {
        // 1. Fetch precomputed data
        const [traitsRes, embeddingsRes] = await Promise.all([
          fetch('/data/precomputedTraits.json'),
          fetch('/data/precomputedEmbeddings.bin')
        ]);

        if (!traitsRes.ok || !embeddingsRes.ok) {
          throw new Error('Failed to load precomputed AI data');
        }

        const traitsData = await traitsRes.json();
        const embeddingsBuffer = await embeddingsRes.arrayBuffer();

        // 2. Initialize worker with data and load model
        await this.send('init', {
          traits: traitsData.traits,
          embeddingsBuffer: embeddingsBuffer,
          dims: traitsData.dims
        }, [embeddingsBuffer]);

        console.log('AI System fully preloaded in Worker');
      } catch (error) {
        console.error('AI Preloading failed:', error);
        this.preloadingPromise = null; // Allow retrying
        throw error;
      }
    })();

    return this.preloadingPromise;
  }

  async semanticSearch(query: string, corpus: string[]): Promise<SemanticSearchResult[]> {
    await this.preload();
    return this.send('search', { query, corpus });
  }

  async semanticSearchBatch(queries: string[], corpus: string[]): Promise<SemanticSearchResult[][]> {
    await this.preload();
    return this.send('searchBatch', { queries, corpus });
  }
}

const aiManager = new AIWorkerManager();

export const preloadAI = () => aiManager.preload();

export const semanticSearch = (query: string, corpus: string[]) =>
  aiManager.semanticSearch(query, corpus);

export const semanticSearchBatch = (queries: string[], corpus: string[]) =>
  aiManager.semanticSearchBatch(queries, corpus);
