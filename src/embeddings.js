"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbeddings = generateEmbeddings;
const ollama_1 = require("ollama");
const ollama = new ollama_1.Ollama({ host: 'http://localhost:11434' });
function generateEmbeddings(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield ollama.embeddings({
                model: 'nomic-embed-text',
                prompt: text
            });
            return response.embedding;
        }
        catch (error) {
            console.error('Embedding generation failed:', error);
            throw error;
        }
    });
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
