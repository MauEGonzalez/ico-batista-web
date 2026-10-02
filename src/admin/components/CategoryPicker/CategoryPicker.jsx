// /src/admin/components/CategoryPicker/CategoryPicker.jsx
// Elegir una o varias categorías: las elegidas aparecen como etiquetas (con ✕ para quitarlas)
// y el desplegable de abajo agrega otra.
import React from 'react';
import { CATEGORY_OPTIONS, categoryLabel } from '../../../categories.js';
import styles from './CategoryPicker.module.css';

// Opciones agrupadas por la primera parte ("Hombre", "Mujer", "Colecciones"...)
const GROUPS = CATEGORY_OPTIONS.reduce((groups, option) => {
  const [group] = option.label.split(' › ');
  (groups[group] ||= []).push(option);
  return groups;
}, {});

const CategoryPicker = ({ value = [], onChange, id }) => {
  const add = (category) => {
    if (category && !value.includes(category)) onChange([...value, category]);
  };
  const remove = (category) => onChange(value.filter((c) => c !== category));

  return (
    <div className={styles.picker}>
      {value.length > 0 && (
        <ul className={styles.chips}>
          {value.map((category) => (
            <li key={category} className={styles.chip}>
              <span>{categoryLabel(category)}</span>
              <button type="button" onClick={() => remove(category)} aria-label={`Quitar ${categoryLabel(category)}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <select
        id={id}
        value=""
        onChange={(e) => add(e.target.value)}
        className={styles.select}
        aria-label="Agregar categoría"
      >
        <option value="" disabled>
          {value.length === 0 ? 'Elegí una categoría' : '+ Agregar otra categoría'}
        </option>
        {Object.entries(GROUPS).map(([group, options]) => (
          <optgroup key={group} label={group}>
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={value.includes(option.value)}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

export default CategoryPicker;
