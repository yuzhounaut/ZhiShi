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

  private dataLoadingPromise: Promise<void> | null = null;
  private modelInitializationPromise: Promise<void> | null = null;

  private isDataLoaded = false;
  private isModelInitialized = false;

  private traitsData: any = null;
  private embeddingsBuffer: ArrayBuffer | null = null;

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

  async preloadData(): Promise<void> {
    if (this.isDataLoaded) return;
    if (this.dataLoadingPromise) return this.dataLoadingPromise;

    this.dataLoadingPromise = (async () => {
      console.log('Starting AI data preloading...');
      try {
        const [traitsRes, embeddingsRes] = await Promise.all([
          this.fetchWithRetry('/data/precomputedTraits.json'),
          this.fetchWithRetry('/data/precomputedEmbeddings.bin')
        ]);
        this.traitsData = await traitsRes.json();
        this.embeddingsBuffer = await embeddingsRes.arrayBuffer();
        this.isDataLoaded = true;
        console.log('AI Data preloaded');
      } catch (error) {
        console.error('AI Data preloading failed:', error);
        this.dataLoadingPromise = null;
        throw error;
      }
    })();
    return this.dataLoadingPromise;
  }

  async initializeModel(onProgress?: (progress: number, message: string) => void): Promise<void> {
    if (onProgress) {
      this.progressCallback = onProgress;
    }

    if (this.isModelInitialized) {
      if (this.progressCallback) this.progressCallback(100, 'AI 系统准备就绪');
      return;
    }

    if (this.modelInitializationPromise) {
      // If already initializing, ensure the callback gets a completion message if it's already done
      this.modelInitializationPromise.then(() => {
        if (this.progressCallback === onProgress) {
          onProgress?.(100, 'AI 系统准备就绪');
        }
      });
      return this.modelInitializationPromise;
    }

    this.modelInitializationPromise = (async () => {
      console.log('Initializing AI model...');
      try {
        // Step 1: Data Loading (if not already done)
        if (!this.isDataLoaded) {
          if (this.progressCallback) this.progressCallback(5, '阶段 1/3: 正在加载基础数据...');
          await this.preloadData();
        }

        if (this.progressCallback) this.progressCallback(15, '阶段 1/3: 基础数据加载完成');

        // Step 2 & 3: Model loading and worker initialization
        // We send data to worker; worker will report progress for model loading (Stage 2)
        const bufferToTransfer = this.embeddingsBuffer!;
        this.embeddingsBuffer = null; // Mark as transferred to avoid double transfer attempts

        await this.send('init', {
          traits: this.traitsData.traits,
          embeddingsBuffer: bufferToTransfer,
          dims: this.traitsData.dims
        }, [bufferToTransfer]);

        this.isModelInitialized = true;
        if (this.progressCallback) this.progressCallback(100, 'AI 系统准备就绪');
        console.log('AI System fully initialized');
      } catch (error) {
        console.error('AI Initialization failed:', error);
        this.modelInitializationPromise = null; // Allow retrying

        // If it failed and buffer is gone, we must reload data
        if (!this.embeddingsBuffer) {
          this.isDataLoaded = false;
          this.dataLoadingPromise = null;
        }
        throw error;
      }
    })();

    return this.modelInitializationPromise;
  }

  async semanticSearch(query: string, corpus: string[]): Promise<SemanticSearchResult[]> {
    await this.initializeModel();
    return this.send('search', { query, corpus });
  }

  async semanticSearchBatch(queries: string[], corpus: string[]): Promise<SemanticSearchResult[][]> {
    await this.initializeModel();
    return this.send('searchBatch', { queries, corpus });
  }
}

const aiManager = new AIWorkerManager();

export const preloadAIData = () => aiManager.preloadData();

export const initializeAIModel = (onProgress?: (progress: number, message: string) => void) =>
  aiManager.initializeModel(onProgress);

// Backward compatibility
export const preloadAI = (onProgress?: (progress: number, message: string) => void) =>
  aiManager.initializeModel(onProgress);

export const semanticSearch = (query: string, corpus: string[]) =>
  aiManager.semanticSearch(query, corpus);

export const semanticSearchBatch = (queries: string[], corpus: string[]) =>
  aiManager.semanticSearchBatch(queries, corpus);
