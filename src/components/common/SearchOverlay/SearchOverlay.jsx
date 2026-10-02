// /src/components/common/SearchOverlay/SearchOverlay.jsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../../context/productsContextValue.js';
import { imageUrl } from '../../../utils/imageUrl.js';
import { getCategories } from '../../../utils/productCategories.js';
import { CloseIcon } from '../Icons/Icons.jsx';
import styles from './SearchOverlay.module.css';

// Normaliza para que "camperá", "CAMPERA" y "campera" coincidan
const normalize = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { products } = useProducts();

  // Los resultados se calculan directo del término (no hace falta un estado + useEffect)
  const searchResults = useMemo(() => {
    const term = normalize(searchTerm.trim());
    if (term.length < 2) return [];
    return products.filter(product =>
      normalize(`${product.name} ${product.code ?? ''} ${getCategories(product).join(' ')}`).includes(term)
    );
  }, [searchTerm, products]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.searchContainer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar productos"
      >
        <div className={styles.searchHeader}>
          <input
            type="search"
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button type="button" onClick={handleClose} className={styles.closeButton} aria-label="Cerrar búsqueda">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.resultsContainer}>
          {searchTerm.trim().length > 1 && searchResults.length === 0 && (
            <p className={styles.noResults}>No se encontraron resultados para "{searchTerm}"</p>
          )}

          <ul className={styles.resultsList}>
            {searchResults.map(product => (
              <li key={product.id}>
                <Link to={`/producto/${product.id}`} className={styles.resultItem} onClick={handleClose}>
                  <img
                    src={imageUrl(product.images[0], 160)}
                    alt={product.name}
                    className={styles.resultImage}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.resultName}>{product.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
