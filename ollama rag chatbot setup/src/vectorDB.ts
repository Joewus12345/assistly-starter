import { ChromaClient, Collection } from 'chromadb';
import { generateEmbeddings } from './embeddings'



export async function initDB(): Promise<Collection> {
    const client = new ChromaClient();

    return  await client.createCollection({
        name: "knowledge-base",
        embeddingFunction: {
            generate: async (texts: string[]) => {
            return Promise.all(texts.map(generateEmbeddings));
            }
        }
    });
}
