import { pipeline, cos_sim, Pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use local models only.
env.allowLocalModels = true;
env.allowRemoteModels = false;

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
      // The path must be all lowercase to match the Netlify deployment.
      this.instance = pipeline('feature-extraction', '/models/bge-small-zh-v1.5', { quantized: true });
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

  // Embed the query and the corpus. The `normalize: true` option is important for cosine similarity.
  const query_embedding = await extractor(query, { pooling: 'mean', normalize: true });
  const corpus_embeddings = await extractor(corpus, { pooling: 'mean', normalize: true });

  // Create a tensor from the query embedding data
  const queryTensor = query_embedding.data;

  // Calculate cosine similarity between the query and each corpus item
  const results: SemanticSearchResult[] = [];
  for (let i = 0; i < corpus.length; ++i) {
    const corpusTensor = corpus_embeddings.data.slice(i * query_embedding.dims[1], (i + 1) * query_embedding.dims[1]);
    const score = cos_sim(queryTensor, corpusTensor);
    results.push({ corpus_id: i, score, text: corpus[i] });
  }

  // Sort results by score in descending order
  results.sort((a, b) => b.score - a.score);

  return results;
};
