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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vectorDB_1 = require("./vectorDB");
const embeddings_1 = require("./embeddings");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const pdfProcessor_1 = require("./pdfProcessor");
function importProducts(filePath) {
    try {
        const rawData = fs_1.default.readFileSync(filePath, 'utf-8');
        const products = JSON.parse(rawData);
        return products;
    }
    catch (error) {
        console.error('Error importing products:', error);
        throw error;
    }
}
function ingestToDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const collection = yield (0, vectorDB_1.initDB)();
        // Process products
        const products = importProducts(path_1.default.join(__dirname, '..', 'data', 'documents', 'automationghana_products.json'));
        const productDocs = products.map(p => (0, utils_1.flattenProduct)(p));
        const productMetadatas = products.map(p => ({
            type: "product",
            id: p.sku,
            category: p.category,
            sku: p.sku
        }));
        // Process company profile
        const companyProfile = yield (0, pdfProcessor_1.extractPDFText)(path_1.default.join(__dirname, '..', 'data', 'documents', 'pdf.pdf'));
        const profileDoc = [companyProfile];
        const profileMetadata = [{ type: "company_profile" }];
        // Generate embeddings
        const productEmbeddings = yield Promise.all(productDocs.map(doc => (0, embeddings_1.generateEmbeddings)(doc)));
        const profileEmbedding = yield (0, embeddings_1.generateEmbeddings)(companyProfile);
        // Add to ChromaDB
        yield collection.add({
            ids: [
                ...products.map(p => `product_${p.sku}`),
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
    });
}
ingestToDB().then(() => console.log('Ingestion Successful')).catch((error) => console.log(error));
