import { pipeline, cos_sim, Pipeline, env } from '@xenova/transformers';

// Configure transformers.js for local-only execution
env.allowLocalModels = true;
env.allowRemoteModels = false;
// Set the path to the local models directory (relative to the public folder)
env.localModelPath = '/models/';
// Set the path to the local WASM files (relative to the public folder)
env.backends.onnx.wasm.wasmPaths = '/wasm/';

// Cache for corpus embeddings to improve performance on subsequent searches
let cachedCorpus: string[] | null = null;
let cachedCorpusEmbeddings: any = null;

/**
 * A singleton class to manage and provide a single instance of the feature-extraction pipeline.
 * This prevents the model from being reloaded every time it's used, which is crucial for performance.
 */
class PipelineSingleton {
  private static instance: Promise<Pipeline> | null = null;

  /**
   * Gets the singleton instance of the feature-extraction pipeline.
   * If the instance doesn't exist, it creates one.
   * @returns A promise that resolves to the feature-extraction pipeline.
   */
  static getInstance(): Promise<Pipeline> {
    if (this.instance === null) {
      // Use the model's short name. The library will combine this with `localModelPath`.
      // The name must be all lowercase to avoid case-sensitivity issues on Netlify.
      this.instance = pipeline('feature-extraction', 'bge-small-zh-v1.5', { quantized: true });
    }
    return this.instance;
  }
}

export interface SemanticSearchResult {
  corpus_id: number;
  score: number;
  text: string;
}

/**
 * Performs semantic search by comparing a query string against a corpus of text.
 * @param query The user's search query.
 * @param corpus An array of strings to search against (e.g., plant traits).
 * @returns A promise that resolves to an array of objects, each containing the text, its index, and similarity score, sorted by score.
 */
export const semanticSearch = async (query: string, corpus: string[]): Promise<SemanticSearchResult[]> => {
  if (!query || corpus.length === 0) {
    return [];
  }

  const extractor = await PipelineSingleton.getInstance();

  // Embed the query. The `normalize: true` option is important for cosine similarity.
  const query_embedding = await extractor(query, { pooling: 'mean', normalize: true });

  // Check if we can use cached corpus embeddings
  let corpus_embeddings;
  const corpusChanged = !cachedCorpus ||
                        cachedCorpus.length !== corpus.length ||
                        cachedCorpus[0] !== corpus[0] ||
                        cachedCorpus[cachedCorpus.length - 1] !== corpus[corpus.length - 1];

  if (corpusChanged) {
    // Embed the corpus. This is a heavy operation.
    corpus_embeddings = await extractor(corpus, { pooling: 'mean', normalize: true });
    cachedCorpus = [...corpus];
    cachedCorpusEmbeddings = corpus_embeddings;
  } else {
    corpus_embeddings = cachedCorpusEmbeddings;
  }

  // Create a tensor from the query embedding data
  const queryTensor = query_embedding.data;

  // Calculate cosine similarity between the query and each corpus item
  const results: SemanticSearchResult[] = [];
  for (let i = 0; i < corpus.length; ++i) {
    const corpusTensor = corpus_embeddings.data.subarray(i * query_embedding.dims[1], (i + 1) * query_embedding.dims[1]);
    const score = cos_sim(queryTensor, corpusTensor);
    results.push({ corpus_id: i, score, text: corpus[i] });
  }

  // Sort results by score in descending order
  results.sort((a, b) => b.score - a.score);

  return results;
};

/**
 * Performs batch semantic search by comparing multiple query strings against a corpus of text.
 * @param queries An array of user search queries.
 * @param corpus An array of strings to search against.
 * @returns A promise that resolves to an array of arrays, where each inner array contains the search results for one query.
 */
export const semanticSearchBatch = async (queries: string[], corpus: string[]): Promise<SemanticSearchResult[][]> => {
  if (!queries || queries.length === 0 || !corpus || corpus.length === 0) {
    return [];
  }

  const extractor = await PipelineSingleton.getInstance();

  // Embed all queries in one batch for better performance
  const query_embeddings = await extractor(queries, { pooling: 'mean', normalize: true });
  const dims = query_embeddings.dims[1];

  // Check if we can use cached corpus embeddings
  let corpus_embeddings;
  const corpusChanged = !cachedCorpus ||
                        cachedCorpus.length !== corpus.length ||
                        cachedCorpus[0] !== corpus[0] ||
                        cachedCorpus[cachedCorpus.length - 1] !== corpus[corpus.length - 1];

  if (corpusChanged) {
    corpus_embeddings = await extractor(corpus, { pooling: 'mean', normalize: true });
    cachedCorpus = [...corpus];
    cachedCorpusEmbeddings = corpus_embeddings;
  } else {
    corpus_embeddings = cachedCorpusEmbeddings;
  }

  const allResults: SemanticSearchResult[][] = [];

  for (let q = 0; q < queries.length; q++) {
    const queryTensor = query_embeddings.data.subarray(q * dims, (q + 1) * dims);
    const results: SemanticSearchResult[] = [];

    for (let i = 0; i < corpus.length; ++i) {
      const corpusTensor = corpus_embeddings.data.subarray(i * dims, (i + 1) * dims);
      const score = cos_sim(queryTensor, corpusTensor);
      results.push({ corpus_id: i, score, text: corpus[i] });
    }

    // Sort results by score in descending order for this query
    results.sort((a, b) => b.score - a.score);
    allResults.push(results);
  }

  return allResults;
};
