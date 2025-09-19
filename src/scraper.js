"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.scrapeWooCommerceStore = scrapeWooCommerceStore;
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function scrapeWooCommerceStore(baseUrl, outputFilename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Step 1: Get all product categories
            const categories = yield getCategories(baseUrl);
            console.log(`Found ${categories.length} categories`);
            // Step 2: Scrape products from each category (with pagination)
            const allProducts = [];
            for (const category of categories) {
                console.log(`Scraping category: ${category.name}`);
                const categoryProducts = yield scrapeCategoryWithPagination(category);
                allProducts.push(...categoryProducts);
            }
            // Step 3: Save all products to JSON file
            saveToJsonFile(allProducts, outputFilename);
            console.log(`Successfully saved ${allProducts.length} products to ${outputFilename}`);
        }
        catch (error) {
            console.error('Error scraping store:', error);
            throw error;
        }
    });
}
function getCategories(baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get(baseUrl);
        const $ = cheerio.load(data);
        const categories = [];
        $('.products.elementor-grid .product-category.product').each((_, element) => {
            const name = $(element).find('.woocommerce-loop-category__title').text().trim();
            const url = $(element).find('a').attr('href') || '';
            if (name && url) {
                categories.push({ name, url });
            }
        });
        return categories;
    });
}
function scrapeCategoryWithPagination(category) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentPageUrl = category.url;
        const categoryProducts = [];
        while (currentPageUrl) {
            console.log(`Scraping page: ${currentPageUrl}`);
            const { products, nextPageUrl } = yield scrapeProductsPage(currentPageUrl, category.name);
            categoryProducts.push(...products);
            currentPageUrl = nextPageUrl;
        }
        return categoryProducts;
    });
}
function scrapeProductsPage(pageUrl, categoryName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get(pageUrl);
        const $ = cheerio.load(data);
        const products = [];
        // Scrape products from current page
        $('.products.elementor-grid .product.type-product').each((_, element) => {
            const name = $(element).find('.woocommerce-loop-product__title').text().trim();
            const price = $(element).find('.price').text().trim();
            const link = $(element).find('a').attr('href') || '';
            const image = $(element).find('img').attr('src') || '';
            products.push({
                name,
                sku: '',
                price,
                link,
                image,
                shortDescription: '',
                fullDescription: '',
                category: categoryName
            });
        });
        // Get detailed product information
        for (const product of products) {
            if (product.link) {
                try {
                    const productDetails = yield scrapeProductDetails(product.link);
                    product.shortDescription = productDetails.shortDescription;
                    product.fullDescription = productDetails.fullDescription;
                    product.sku = productDetails.sku;
                    // console.log(productDetails)
                }
                catch (error) {
                    console.error(`Error scraping product details for ${product.link}:`, error);
                }
            }
        }
        // Check for next page
        const nextPageUrl = $('.next.page-numbers').attr('href') || null;
        return { products, nextPageUrl };
    });
}
function scrapeProductDetails(productUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get(productUrl);
        const $ = cheerio.load(data);
        const shortDescription = $('.woocommerce-product-details__short-description').text().trim();
        const fullDescription = $('#elementor-tab-content-6491').text().trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ').replace(/\.\s*/g, '. ');
        const sku = $('p.elementor-icon-box-description:contains("SKU")').text().trim();
        return { sku, shortDescription, fullDescription };
    });
}
function saveToJsonFile(data, filename) {
    const currentDir = __dirname;
    const dataDir = path_1.default.join(currentDir, '..', 'data', 'documents');
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path_1.default.join(dataDir, filename);
    fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
// Example usage:
scrapeWooCommerceStore('https://store.automationghana.com/shop', 'automationghana_products.json');
