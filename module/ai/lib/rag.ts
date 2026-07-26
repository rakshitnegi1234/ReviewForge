import { pineconeIndex } from "@/lib/pinecone";
import { embed } from "ai";
import { google } from "@ai-sdk/google";

type CodebaseFile = {
  path: string;
  content: string;
};

const embeddingRequestBatchSize = 12;
const embeddingBatchDelayMs = 50_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateEmbedding(text: string) {
  const { embedding } = await embed({
    model: google.embeddingModel("gemini-embedding-001"),
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 1536,
      },
    },
  });

  return embedding;
}


export async function indexCodebase(
  repoId: string,
  files: CodebaseFile[]
) {
  const vectors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const content = `File: ${file.path}\n\n${file.content}`;

    const truncatedContent = content.slice(0, 8000);

    try {
      const embedding = await generateEmbedding(truncatedContent);

      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "_")}`,
        values: embedding,
        metadata: {
          repoId,
          path: file.path,
          content: truncatedContent,
        },
      });
    } catch (e) {
      console.error(`Failed to embed ${file.path}:`, e);
    }

    if ((i + 1) % embeddingRequestBatchSize === 0 && i < files.length - 1) {
      await sleep(embeddingBatchDelayMs);
    }
  }

  if (vectors.length > 0) {
    const batchSize = 20;

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);

      await pineconeIndex.upsert({ records: batch });
    }
  }

  console.log("indexing complete");
}

export async function retrieveContext(
  query: string,
  repoId: string,
  topK: number = 5
) {
  const embedding = await generateEmbedding(query);

  const results = await pineconeIndex.query({
    vector: embedding,
    filter: { repoId },
    topK,
    includeMetadata: true,
  });

  return results.matches
    .map((match) => match.metadata?.content as string)
    .filter(Boolean);
}
