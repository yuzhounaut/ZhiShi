import { pipeline, cos_sim, env, Pipeline } from '@xenova/transformers';

// Configure transformers.js for local-only execution
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = '/models/';
env.backends.onnx.wasm.wasmPaths = '/wasm/';
env.useBrowserCache = true;

let extractor: Pipeline | null = null;
let precomputedTraits: string[] | null = null;
let precomputedEmbeddings: Float32Array | null = null;
let precomputedDims: number = 512;

/**
 * Internal helper to get corpus embeddings, utilizing precomputed data if possible.
 */
const getCorpusEmbeddings = async (corpus: string[]) => {
  if (precomputedEmbeddings &&
      precomputedTraits &&
      precomputedTraits.length === corpus.length &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (typeof precomputedTraits[0] === 'string' ? precomputedTraits[0] : (precomputedTraits[0] as any).trait) === corpus[0] &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (typeof precomputedTraits[corpus.length - 1] === 'string' ? precomputedTraits[corpus.length - 1] : (precomputedTraits[corpus.length - 1] as any).trait) === corpus[corpus.length - 1]) {

    return {
      data: precomputedEmbeddings,
      dims: [corpus.length, precomputedDims]
    };
  }

  if (!extractor) {
      throw new Error("Extractor not initialized");
  }

  console.log('Corpus not precomputed, embedding now in worker...');
  const embeddings = await extractor(corpus, { pooling: 'mean', normalize: true });
  return embeddings;
};

self.onmessage = async (event) => {
  const { type, id, payload } = event.data;

  try {
    if (type === 'init') {
      const { traits, embeddingsBuffer, dims } = payload;

      if (traits) precomputedTraits = traits;
      if (embeddingsBuffer) precomputedEmbeddings = new Float32Array(embeddingsBuffer);
      if (dims) precomputedDims = dims;

      if (!extractor) {
        let retries = 3;
        let lastError = null;

        while (retries > 0) {
          try {
            extractor = await pipeline('feature-extraction', 'bge-small-zh-v1.5', {
              quantized: true,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              progress_callback: (data: any) => {
                if (data.status === 'progress') {
                  // Map 0-100 progress of model loading to 20-85 range
                  const modelProgress = 20 + (data.progress * 0.65);
                  self.postMessage({
                    type: 'progress',
                    progress: modelProgress,
                    message: `阶段 2/3: 正在下载 AI 模型文件... (${Math.round(data.progress)}%)`
                  });
                } else if (data.status === 'initiate') {
                  self.postMessage({
                    type: 'progress',
                    progress: 20,
                    message: `阶段 2/3: 开始准备 AI 模型文件...`
                  });
                } else if (data.status === 'done') {
                    self.postMessage({
                      type: 'progress',
                      progress: 85,
                      message: `阶段 2/3: 模型文件加载完成`
                    });
                }
              }
            });
            break; // Success!
          } catch (e) {
            lastError = e;
            retries--;
            if (retries > 0) {
              self.postMessage({
                type: 'progress',
                progress: 20,
                message: `模型加载失败，正在重试... (剩余 ${retries} 次)`
              });
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }

        if (!extractor && lastError) {
          throw lastError;
        }
      }

      self.postMessage({
        type: 'progress',
        progress: 95,
        message: `阶段 3/3: 正在初始化 AI 引擎...`
      });

      self.postMessage({ type: 'init_complete', id });
    }
    else if (type === 'search') {
      const { query, corpus } = payload;
      if (!extractor) throw new Error("AI not initialized");

      const query_embedding = await extractor(query, { pooling: 'mean', normalize: true });
      const queryTensor = query_embedding.data;
      const dims = query_embedding.dims[1];
      const corpus_embeddings = await getCorpusEmbeddings(corpus);

      const results = [];
      for (let i = 0; i < corpus.length; ++i) {
        const corpusTensor = corpus_embeddings.data.subarray(i * dims, (i + 1) * dims);
        const score = cos_sim(queryTensor, corpusTensor);
        results.push({ corpus_id: i, score, text: corpus[i] });
      }

      results.sort((a, b) => b.score - a.score);
      self.postMessage({ type: 'search_result', id, payload: results });
    }
    else if (type === 'searchBatch') {
      const { queries, corpus } = payload;
      if (!extractor) throw new Error("AI not initialized");

      const query_embeddings = await extractor(queries, { pooling: 'mean', normalize: true });
      const dims = query_embeddings.dims[1];
      const corpus_embeddings = await getCorpusEmbeddings(corpus);

      const allResults = [];
      for (let q = 0; q < queries.length; q++) {
        const queryTensor = query_embeddings.data.subarray(q * dims, (q + 1) * dims);
        const results = [];

        for (let i = 0; i < corpus.length; ++i) {
          const corpusTensor = corpus_embeddings.data.subarray(i * dims, (i + 1) * dims);
          const score = cos_sim(queryTensor, corpusTensor);
          results.push({ corpus_id: i, score, text: corpus[i] });
        }

        results.sort((a, b) => b.score - a.score);
        allResults.push(results);
      }
      self.postMessage({ type: 'searchBatch_result', id, payload: allResults });
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Worker error:", error);
    self.postMessage({ type: 'error', id, error: error.message });
  }
};
