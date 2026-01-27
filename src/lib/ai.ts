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
  private progressCallback: ((progress: number, message: string) => void) | null = null;

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (retries <= 0) throw error;
      console.warn(`Fetch failed for ${url}, retrying in ${backoff}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
  }

  private getWorker() {
    if (!this.worker) {
      // Create a new worker using Vite's worker support
      this.worker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { type, id, payload, error, message, progress } = event.data;

        if (type === 'progress') {
          if (this.progressCallback) {
            this.progressCallback(progress, message);
          }
          return;
        }

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

  async preload(onProgress?: (progress: number, message: string) => void): Promise<void> {
    if (onProgress) {
      this.progressCallback = onProgress;
    }

    if (this.preloadingPromise) {
      // If already preloading or preloaded, ensure the callback gets a completion message if it's already done
      this.preloadingPromise.then(() => {
        if (this.progressCallback === onProgress) {
          onProgress?.(100, 'AI 系统准备就绪');
        }
      });
      return this.preloadingPromise;
    }

    this.preloadingPromise = (async () => {
      console.log('Starting AI preloading via Worker...');
      if (this.progressCallback) this.progressCallback(5, '正在准备鉴定资源...');

      try {
        // 1. Fetch precomputed data with retries
        const [traitsRes, embeddingsRes] = await Promise.all([
          this.fetchWithRetry('/data/precomputedTraits.json'),
          this.fetchWithRetry('/data/precomputedEmbeddings.bin')
        ]);

        if (this.progressCallback) this.progressCallback(15, '正在加载预计算特征库...');

        const traitsData = await traitsRes.json();
        const embeddingsBuffer = await embeddingsRes.arrayBuffer();

        if (this.progressCallback) this.progressCallback(30, '正在初始化 AI 引擎...');

        // 2. Initialize worker with data and load model
        // The worker 'init' will also handle model loading which we'll add progress for
        await this.send('init', {
          traits: traitsData.traits,
          embeddingsBuffer: embeddingsBuffer,
          dims: traitsData.dims
        }, [embeddingsBuffer]);

        if (this.progressCallback) this.progressCallback(100, 'AI 系统准备就绪');
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

export const preloadAI = (onProgress?: (progress: number, message: string) => void) =>
  aiManager.preload(onProgress);

export const semanticSearch = (query: string, corpus: string[]) =>
  aiManager.semanticSearch(query, corpus);

export const semanticSearchBatch = (queries: string[], corpus: string[]) =>
  aiManager.semanticSearchBatch(queries, corpus);
