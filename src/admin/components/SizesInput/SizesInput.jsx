// /src/admin/components/SizesInput/SizesInput.jsx
// Talles en stock: botones rápidos para los comunes + campo para agregar otros (ej. "38", "Único").
import React, { useState } from 'react';
import styles from './SizesInput.module.css';

const PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

const SizesInput = ({ value = [], onChange }) => {
  const [custom, setCustom] = useState('');

  const toggle = (size) =>
    onChange(value.includes(size) ? value.filter((s) => s !== size) : [...value, size]);

  const addCustom = () => {
    const size = custom.trim();
    if (size && !value.includes(size)) onChange([...value, size]);
    setCustom('');
  };

  const extras = value.filter((size) => !PRESETS.includes(size));

  return (
    <div>
      <div className={styles.chips}>
        {PRESETS.map((size) => (
          <button
            key={size}
            type="button"
            className={`${styles.chip} ${value.includes(size) ? styles.selected : ''}`}
            aria-pressed={value.includes(size)}
            onClick={() => toggle(size)}
          >
            {size}
          </button>
        ))}
        {extras.map((size) => (
          <button
            key={size}
            type="button"
            className={`${styles.chip} ${styles.selected}`}
            onClick={() => toggle(size)}
            title="Quitar"
          >
            {size} ✕
          </button>
        ))}
      </div>
      <div className={styles.customRow}>
        <input
          type="text"
          value={custom}
          placeholder="Otro talle (ej. 38)"
          maxLength={20}
          onChange={(e) => setCustom(e.target.value)}
          onBlur={addCustom} // Si se escribe un talle y no se toca "Agregar", se agrega igual
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" onClick={addCustom} disabled={!custom.trim()}>Agregar</button>
      </div>
    </div>
  );
};

export default SizesInput;
