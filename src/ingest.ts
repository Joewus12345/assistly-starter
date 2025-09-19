import { initDB } from './vectorDB';
import { generateEmbeddings } from './embeddings';
import fs from 'fs';
import path from 'path'
import { Product } from './scraper';
import { flattenProduct  } from './utils'
import { extractPDFText } from './pdfProcessor';

function importProducts(filePath: string): Product[] {
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const products: Product[] = JSON.parse(rawData);
    return products;
  } catch (error) {
    console.error('Error importing products:', error);
    throw error;
  }
}



async function ingestToDB() {

 const collection = await initDB(); 
  // Process products
  const products = importProducts(path.join(__dirname, '..', 'data', 'documents', 'automationghana_products.json'))
  const productDocs = products.map(p => flattenProduct(p));
  const productMetadatas = products.map(p => ({
    type: "product",
    id: p.sku,
    category: p.category,
    sku: p.sku
  }));

  // Process company profile
  const companyProfile = await extractPDFText(path.join(__dirname, '..', 'data', 'documents', 'pdf.pdf'))
  const profileDoc = [companyProfile];
  const profileMetadata = [{ type: "company_profile" }];

  // Generate embeddings
  const productEmbeddings = await Promise.all(
    productDocs.map(doc => generateEmbeddings(doc))
  );
  const profileEmbedding = await generateEmbeddings(companyProfile);

  // Add to ChromaDB
  await collection.add({
    ids: [
      ...products.map(p =>`product_${p.sku}`),
      "company_profile"
    ],
    embeddings: [
      ...productEmbeddings,
      profileEmbedding
    ],
    metadatas: [
      ...productMetadatas,
      ...profileMetadata
    ],
    documents: [
      ...productDocs,
      companyProfile
    ]
  });
}

ingestToDB().then(() => console.log('Ingestion Successful')).catch((error) => console.log(error))
