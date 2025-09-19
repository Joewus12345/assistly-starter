import { Product } from "../scraper";

export function flattenProduct(product: Product): string {
  return `
    Product: ${product.name}
    SKU: ${product.sku}
    Price: $${product.price}
    Link: ${product.link}
    Image: ${product.image}
    ProductDetails: ${product.fullDescription}
    ShortDetails: ${product.shortDescription}
    Category: ${product.category}
  `.replace(/\s+/g, ' ').trim();
}