import { pipeline, cos_sim, Pipeline, env, Tensor } from '@xenova/transformers';

// Configure transformers.js for local-only execution
env.allowLocalModels = true;
env.allowRemoteModels = false;
// Set the path to the local models directory (relative to the public folder)
env.localModelPath = '/models/';
// Set the path to the local WASM files (relative to the public folder)
env.backends.onnx.wasm.wasmPaths = '/wasm/';
// Explicitly enable browser cache
env.useBrowserCache = true;

// Cache for corpus embeddings to improve performance on subsequent searches
let cachedCorpus: string[] | null = null;
let cachedCorpusEmbeddings: any = null;

// Storage for precomputed data
let precomputedTraits: string[] | null = null;
let precomputedEmbeddings: Float32Array | null = null;
let precomputedDims: number = 512;

/**
 * A singleton class to manage and provide a single instance of the feature-extraction pipeline.
 */
class PipelineSingleton {
  private static instance: Promise<Pipeline> | null = null;

  static getInstance(): Promise<Pipeline> {
    if (this.instance === null) {
      this.instance = pipeline('feature-extraction', 'bge-small-zh-v1.5', {
        quantized: true,
      });
    }
    return this.instance;
  }
}

/**
 * Preloads the AI model and precomputed embeddings.
 * This should be called as early as possible in the app lifecycle.
 */
export const preloadAI = async () => {
  console.log('Starting AI preloading...');

  // 1. Start loading the model pipeline
  const pipelinePromise = PipelineSingleton.getInstance();

  // 2. Start loading precomputed embeddings
  const precomputedPromise = fetch('/data/precomputedEmbeddings.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      precomputedTraits = data.traits.map((t: any) => t.trait);
      precomputedEmbeddings = new Float32Array(data.embeddings);
      precomputedDims = data.dims;
      console.log('Precomputed embeddings loaded and parsed');
    })
    .catch(err => {
      console.error('Failed to load precomputed embeddings:', err);
    });

  // Wait for both to complete
  await Promise.all([pipelinePromise, precomputedPromise]);
  console.log('AI System fully preloaded');
};

export interface SemanticSearchResult {
  corpus_id: number;
  score: number;
  text: string;
}

/**
 * Internal helper to get corpus embeddings, utilizing precomputed data if possible.
 */
const getCorpusEmbeddings = async (extractor: Pipeline, corpus: string[]) => {
  // Check if we can use precomputed data
  // We do a quick check on the first and last items to see if they match
  if (precomputedEmbeddings &&
      precomputedTraits &&
      precomputedTraits.length === corpus.length &&
      precomputedTraits[0] === corpus[0] &&
      precomputedTraits[corpus.length - 1] === corpus[corpus.length - 1]) {

    return {
      data: precomputedEmbeddings,
      dims: [corpus.length, precomputedDims]
    };
  }

  // Check if we can use cached corpus embeddings
  const corpusChanged = !cachedCorpus ||
                        cachedCorpus.length !== corpus.length ||
                        cachedCorpus[0] !== corpus[0] ||
                        cachedCorpus[cachedCorpus.length - 1] !== corpus[corpus.length - 1];

  if (corpusChanged) {
    // Embed the corpus. This is a heavy operation.
    console.log('Corpus changed or not precomputed, embedding now...');
    const embeddings = await extractor(corpus, { pooling: 'mean', normalize: true });
    cachedCorpus = [...corpus];
    cachedCorpusEmbeddings = embeddings;
    return embeddings;
  }

  return cachedCorpusEmbeddings;
};

/**
 * Performs semantic search by comparing a query string against a corpus of text.
 */
export const semanticSearch = async (query: string, corpus: string[]): Promise<SemanticSearchResult[]> => {
  if (!query || corpus.length === 0) {
    return [];
  }

  const extractor = await PipelineSingleton.getInstance();

  // Embed the query.
  const query_embedding = await extractor(query, { pooling: 'mean', normalize: true });
  const queryTensor = query_embedding.data;
  const dims = query_embedding.dims[1];

  const corpus_embeddings = await getCorpusEmbeddings(extractor, corpus);

  // Calculate cosine similarity
  const results: SemanticSearchResult[] = [];
  for (let i = 0; i < corpus.length; ++i) {
    const corpusTensor = corpus_embeddings.data.subarray(i * dims, (i + 1) * dims);
    const score = cos_sim(queryTensor, corpusTensor);
    results.push({ corpus_id: i, score, text: corpus[i] });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
};

/**
 * Performs batch semantic search by comparing multiple query strings against a corpus of text.
 */
export const semanticSearchBatch = async (queries: string[], corpus: string[]): Promise<SemanticSearchResult[][]> => {
  if (!queries || queries.length === 0 || !corpus || corpus.length === 0) {
    return [];
  }

  const extractor = await PipelineSingleton.getInstance();

  // Embed all queries in one batch
  const query_embeddings = await extractor(queries, { pooling: 'mean', normalize: true });
  const dims = query_embeddings.dims[1];

  const corpus_embeddings = await getCorpusEmbeddings(extractor, corpus);

  const allResults: SemanticSearchResult[][] = [];

  for (let q = 0; q < queries.length; q++) {
    const queryTensor = query_embeddings.data.subarray(q * dims, (q + 1) * dims);
    const results: SemanticSearchResult[] = [];

    for (let i = 0; i < corpus.length; ++i) {
      const corpusTensor = corpus_embeddings.data.subarray(i * dims, (i + 1) * dims);
      const score = cos_sim(queryTensor, corpusTensor);
      results.push({ corpus_id: i, score, text: corpus[i] });
    }

    results.sort((a, b) => b.score - a.score);
    allResults.push(results);
  }

  return allResults;
};
