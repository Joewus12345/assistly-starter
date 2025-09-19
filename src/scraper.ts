import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs'
import path from 'path'

// export async function scrapeWebsite(url: string, filename: string): Promise<void> {
//     try {
//         // Scrape the website content
//         const { data } = await axios.get(url);
//         const $ = cheerio.load(data);
//         // $('script, style, noscript').remove();
//         const cleanedText = JSON.stringify(data)

//         // Determine paths
//         const currentDir = __dirname; // src directory where this file is located
//         const dataDir = path.join(currentDir, '..', 'data', 'documents'); // goes up one level then into data/documents
        
//         // Create directory if it doesn't exist
//         if (!fs.existsSync(dataDir)) {
//             fs.mkdirSync(dataDir, { recursive: true });
//         }

//         // Create file path
//         const filePath = path.join(dataDir, filename);
        
//         // Write the file
//         fs.writeFileSync(filePath, cleanedText, 'utf-8');
        
//         console.log(`Successfully saved scraped content to ${filePath}`);
//     } catch (error) {
//         console.error('Error scraping or saving file:', error);
//         throw error;
//     }
// }

// Example usage:
// scrapeWebsite('https://automationghana.com', 'automationghana.txt');

export interface Product {
  name: string;
  sku: string;
  price: string;
  link: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
}

interface Category {
  name: string;
  url: string | null;
}

export async function scrapeWooCommerceStore(baseUrl: string, outputFilename: string): Promise<void> {
  try {
    // Step 1: Get all product categories
    const categories = await getCategories(baseUrl);
    console.log(`Found ${categories.length} categories`);

    // Step 2: Scrape products from each category (with pagination)
    const allProducts: Product[] = [];
    
    for (const category of categories) {
      console.log(`Scraping category: ${category.name}`);
      const categoryProducts = await scrapeCategoryWithPagination(category);
      allProducts.push(...categoryProducts);
    }

    // Step 3: Save all products to JSON file
    saveToJsonFile(allProducts, outputFilename);
    console.log(`Successfully saved ${allProducts.length} products to ${outputFilename}`);

  } catch (error) {
    console.error('Error scraping store:', error);
    throw error;
  }
}

async function getCategories(baseUrl: string): Promise<Category[]> {
  const { data } = await axios.get(baseUrl);
  const $ = cheerio.load(data);
  const categories: Category[] = [];

  $('.products.elementor-grid .product-category.product').each((_, element) => {
    const name = $(element).find('.woocommerce-loop-category__title').text().trim();
    const url = $(element).find('a').attr('href') || '';
    if (name && url) {
      categories.push({ name, url });
    }
  });

  return categories;
}

async function scrapeCategoryWithPagination(category: Category): Promise<Product[]> {
  let currentPageUrl = category.url;
  const categoryProducts: Product[] = [];

  while (currentPageUrl) {
    console.log(`Scraping page: ${currentPageUrl}`);
    const { products, nextPageUrl } = await scrapeProductsPage(currentPageUrl, category.name);
    categoryProducts.push(...products);
    currentPageUrl = nextPageUrl;
  }

  return categoryProducts;
}

async function scrapeProductsPage(pageUrl: string, categoryName: string): Promise<{ products: Product[]; nextPageUrl: string | null }> {
  const { data } = await axios.get(pageUrl);
  const $ = cheerio.load(data);
  const products: Product[] = [];

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
        const productDetails = await scrapeProductDetails(product.link);
        product.shortDescription = productDetails.shortDescription;
        product.fullDescription = productDetails.fullDescription;
        product.sku = productDetails.sku;
        // console.log(productDetails)
      } catch (error) {
        console.error(`Error scraping product details for ${product.link}:`, error);
      }
    }
  }

  // Check for next page
  const nextPageUrl = $('.next.page-numbers').attr('href') || null;

  return { products, nextPageUrl };
}

async function scrapeProductDetails(productUrl: string): Promise<{ sku: string; shortDescription: string; fullDescription: string }> {
  const { data } = await axios.get(productUrl);
  const $ = cheerio.load(data);

  const shortDescription = $('.woocommerce-product-details__short-description').text().trim();
  const fullDescription = $('#elementor-tab-content-6491').text().trim().replace(/\n+/g, ' ').replace(/\s+/g,' ').replace(/\.\s*/g, '. ');
  const sku = $('p.elementor-icon-box-description:contains("SKU")').text().trim()

  return { sku, shortDescription, fullDescription };
}

function saveToJsonFile(data: Product[], filename: string): void {
  const currentDir = __dirname;
  const dataDir = path.join(currentDir, '..', 'data', 'documents');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Example usage:
scrapeWooCommerceStore(
  'https://store.automationghana.com/shop',
  'automationghana_products.json'
);