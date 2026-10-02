// /src/utils/productCategories.js
// Una prenda puede estar en varias categorías. Los productos de ejemplo viejos usan "category" (una sola).
export const getCategories = (product) =>
  Array.isArray(product?.categories) ? product.categories : product?.category ? [product.category] : [];

// ¿La prenda está en esta categoría (o en una subcategoría)?
// "mujer/formal" incluye "mujer/formal/fiesta/vestidos", pero no "mujer/formalwear".
export const belongsTo = (product, path) =>
  getCategories(product).some((category) => category === path || category.startsWith(`${path}/`));
