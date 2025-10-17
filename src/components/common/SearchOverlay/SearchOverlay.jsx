import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsData } from '../../../productsData';
import styles from './SearchOverlay.module.css';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // useEffect se ejecuta cada vez que 'searchTerm' cambia
  useEffect(() => {
    if (searchTerm.trim().length > 1) { // Empezamos a buscar después de 2 caracteres
      const results = productsData.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]); // Limpiamos los resultados si el término es muy corto
    }
  }, [searchTerm]);

  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  // Función para cerrar el overlay y limpiar la búsqueda
  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.searchContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchHeader}>
          <input
            type="text"
            placeholder="Buscar productos..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus // Pone el cursor en el input automáticamente
          />
          <button onClick={handleClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.resultsContainer}>
          {searchTerm.length > 1 && searchResults.length === 0 && (
            <p className={styles.noResults}>No se encontraron resultados para "{searchTerm}"</p>
          )}
          
          <ul className={styles.resultsList}>
            {searchResults.map(product => (
              <li key={product.id}>
                <Link to={`/producto/${product.id}`} className={styles.resultItem} onClick={handleClose}>
                  <img src={product.images[0]} alt={product.name} className={styles.resultImage} />
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