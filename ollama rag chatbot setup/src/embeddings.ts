import { Ollama } from 'ollama';
import fs from 'fs';
import path from 'path';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: text
    });
    return response.embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
}

// Batch process all scraped data
// export async function processAllEmbeddings() {
//   const dataDir = path.join(__dirname, '..', 'data', 'documents');
//   const outputDir = path.join(__dirname, '..', 'data', 'chroma-db');
  
//   // Ensure output directory exists
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//   }

//   // Read all JSON files from documents
//   const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
  
//   for (const file of files) {
//     const filePath = path.join(dataDir, file);
//     const products: Array<{ 
//       name: string; 
//       description: string;
//       [key: string]: any 
//     }> = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

//     // Generate embeddings for each product
//     const productsWithEmbeddings = await Promise.all(
//       products.map(async product => ({
//         ...product,
//         embedding: await generateEmbeddings(`${product.name}: ${product.description}`)
//       }))
//     );

//     // Save with embeddings
//     const outputPath = path.join(outputDir, `embedded_${file}`);
//     fs.writeFileSync(outputPath, JSON.stringify(productsWithEmbeddings, null, 2));
//   }
// }