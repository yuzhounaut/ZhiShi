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
      (typeof precomputedTraits[0] === 'string' ? precomputedTraits[0] : (precomputedTraits[0] as any).trait) === corpus[0] &&
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
        extractor = await pipeline('feature-extraction', 'bge-small-zh-v1.5', {
          quantized: true,
        });
      }
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
  } catch (error: any) {
    console.error("Worker error:", error);
    self.postMessage({ type: 'error', id, error: error.message });
  }
};
