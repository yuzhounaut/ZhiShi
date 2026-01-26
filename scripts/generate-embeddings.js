import { pipeline, env } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

// Configure for local execution
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = './public/models/';

async function generate() {
  console.log('Reading plantFamilies.json...');
  const families = JSON.parse(fs.readFileSync('./src/data/plantFamilies.json', 'utf8'));

  const traitCorpus = families.flatMap(family => {
    const idSegments = family.identificationModule.split(/[。；,，]/).map(s => s.trim()).filter(Boolean);
    const memSegments = family.memoryModule.split(/[。；,，]/).map(s => s.trim()).filter(Boolean);
    const allSegments = [...new Set([...idSegments, ...memSegments])];
    return allSegments.map(trait => ({
      familyId: family.id,
      trait: trait,
    }));
  });

  console.log(`Generating embeddings for ${traitCorpus.length} traits...`);

  const extractor = await pipeline('feature-extraction', 'bge-small-zh-v1.5', {
    quantized: true,
  });

  const texts = traitCorpus.map(item => item.trait);

  const batchSize = 100;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}...`);
    const output = await extractor(batch, { pooling: 'mean', normalize: true });

    // Using a loop to avoid stack overflow with large batches
    for (let j = 0; j < output.data.length; j++) {
      allEmbeddings.push(output.data[j]);
    }
  }

  const result = {
    traits: traitCorpus,
    embeddings: allEmbeddings,
    dims: 512,
  };

  const outputDir = './public/data';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'precomputedEmbeddings.json');
  fs.writeFileSync(outputPath, JSON.stringify(result));
  console.log(`Successfully saved embeddings to ${outputPath}`);
}

generate().catch(error => {
  console.error('Failed to generate embeddings:', error);
  process.exit(1);
});
