// /src/categories.js
// Lista de categorías válidas para las prendas, sacada del menú (menuData.js).
// La usan la web, el panel y el backend: si se agrega una categoría al menú, aparece sola en el panel.
import { menuData } from './menuData.js';

// Recorre el menú y junta las hojas (categorías sin subcategorías) de la tienda y las colecciones.
// value: 'mujer/formal/fiesta/vestidos'   label: 'Mujer › Formal › Fiesta › Vestidos'
const collectLeaves = (items, trail = []) =>
  items.flatMap((item) => {
    const labelTrail = [...trail, item.title.replace(/^Moda /, '')];
    if (item.children) return collectLeaves(item.children, labelTrail);
    if (!item.path) return [];
    const match = item.path.match(/^\/(?:tienda\/)?((?:hombre|mujer|colecciones|desfiles)\/.+)$/);
    return match ? [{ value: match[1], label: labelTrail.join(' › ') }] : [];
  });

export const CATEGORY_OPTIONS = collectLeaves(menuData);

const VALID = new Set(CATEGORY_OPTIONS.map((option) => option.value));
export const isValidCategory = (value) => VALID.has(value);

export const categoryLabel = (value) =>
  CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
