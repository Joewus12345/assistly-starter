"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenProduct = flattenProduct;
function flattenProduct(product) {
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
