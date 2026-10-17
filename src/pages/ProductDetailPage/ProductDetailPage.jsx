// /src/pages/ProductDetailPage/ProductDetailPage.jsx

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../../context/productsContextValue.js';
import { imageUrl, imageSrcSet, imageAspectRatio } from '../../utils/imageUrl.js';
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx';
import { useCart } from '../../context/cartContextValue.js';
import Price from '../../components/common/Price/Price.jsx';
import CurrencyToggle from '../../components/common/CurrencyToggle/CurrencyToggle.jsx';
import { hasPrice } from '../../utils/formatPrice.js';
import { buildWhatsAppUrl, productInquiryMessage, MADE_TO_MEASURE } from '../../utils/whatsapp.js';
import { ChatIcon } from '../../components/common/Icons/Icons.jsx';
import styles from './ProductDetailPage.module.css';

// Talles en stock por defecto si el producto no define los suyos (product.sizes)
const DEFAULT_SIZES = ['S', 'M', 'L'];

// "Único" no es un talle: marca una pieza irrepetible (existe solo en el talle indicado y no se vuelve a confeccionar)
const isUniqueMark = (size) => size.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() === 'unico';

const sizeHint = (uniquePiece, hasStock, canMadeToMeasure) => {
  if (uniquePiece) {
    return hasStock
      ? 'Pieza única e irrepetible: está disponible solo en este talle.'
      : 'Pieza única e irrepetible.';
  }
  if (!canMadeToMeasure) return 'Talles disponibles en stock.';
  return hasStock
    ? 'Talles disponibles en stock. También podemos confeccionarla en tu talle, a medida.'
    : 'Se confecciona a medida.';
};

const ProductDetail = ({ product }) => {
  const { addToCart } = useCart();
  const rawSizes = product.sizes ?? DEFAULT_SIZES;
  const uniquePiece = rawSizes.some(isUniqueMark);
  const stockSizes = rawSizes.filter((size) => !isUniqueMark(size));
  // Todas las prendas se pueden pedir a medida, salvo las piezas únicas o si el producto dice madeToMeasure: false
  const canMadeToMeasure = product.madeToMeasure !== false && !uniquePiece;
  const sizes = canMadeToMeasure ? [...stockSizes, MADE_TO_MEASURE] : stockSizes;

  const [selectedIndex, setSelectedIndex] = useState(0);
  // Pieza única en un solo talle: ya viene elegido
  const [selectedSize, setSelectedSize] = useState(uniquePiece && stockSizes.length === 1 ? stockSizes[0] : null);
  const [zoomPosition, setZoomPosition] = useState({ x: '50%', y: '50%' });

  const selectedImage = product.images[selectedIndex];
  const whatsappUrl = buildWhatsAppUrl(productInquiryMessage(product, selectedSize));
  // Cuidados: una indicación por línea
  // Look de varias piezas (Camisa "X" - Pantalón "Y", Conjunto "Z"): cada pieza se puede comprar sola
  const isLook = / - /.test(product.name) || /^Conjunto\b/i.test(product.name);
  const careLines = (product.care ?? '').split('\n').map((line) => line.trim()).filter(Boolean);

  const handleAddToSelection = () => {
    addToCart(product, selectedSize);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x: `${x}%`, y: `${y}%` });
  };

  return (
    <main className={styles.pageContainer}>
      <title>{`${product.name} | Ico Batista`}</title>
      <meta name="description" content={product.description} />

      <div className={styles.productDetail}>
        <div className={styles.imageGallery}>
          {/* El marco toma la proporción real de la foto: se ve entera, sin recortes */}
          <div
            className={styles.mainImageContainer}
            onMouseMove={handleMouseMove}
            style={{ aspectRatio: imageAspectRatio(selectedImage) }}
          >
            <img
              src={imageUrl(selectedImage, 1400)}
              srcSet={imageSrcSet(selectedImage)}
              // Pedimos una foto grande en desktop para que el zoom se vea nítido
              sizes="(max-width: 768px) 100vw, 1000px"
              alt={`${product.name} - vista ${selectedIndex + 1}`}
              className={styles.mainImage}
              style={{ transformOrigin: `${zoomPosition.x} ${zoomPosition.y}` }}
              fetchPriority="high"
            />
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbnailContainer}>
              {product.images.map((image, index) => (
                <button
                  type="button"
                  key={typeof image === 'string' ? image : image.url}
                  className={`${styles.thumbnailButton} ${selectedIndex === index ? styles.active : ''}`}
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Ver foto ${index + 1}`}
                  aria-pressed={selectedIndex === index}
                >
                  <img src={imageUrl(image, 200)} alt="" className={styles.thumbnail} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          {product.code && <p className={styles.productCode}>Cód. {product.code}</p>}
          {uniquePiece && <p className={styles.uniqueBadge}>Pieza única</p>}
          <div className={styles.priceRow}>
            <p className={styles.productPrice}><Price value={product.price} /></p>
            {hasPrice(product.price) && <CurrencyToggle />}
          </div>
          <p className={styles.productDescription}>{product.description}</p>

          {sizes.length === 0 && (
            <p className={styles.sizeHint}>{sizeHint(uniquePiece, false, canMadeToMeasure)}</p>
          )}
          {sizes.length > 0 && (
            <div className={styles.selectors}>
              <div className={styles.selectorGroup}>
                <span className={styles.selectorLabel} id="size-label">
                  Talle{selectedSize ? `: ${selectedSize}` : ''}
                </span>
                <p className={styles.sizeHint}>{sizeHint(uniquePiece, stockSizes.length > 0, canMadeToMeasure)}</p>
                <div className={styles.options} role="radiogroup" aria-labelledby="size-label">
                  {sizes.map(size => (
                    <button
                      type="button"
                      key={size}
                      role="radio"
                      aria-checked={selectedSize === size}
                      className={selectedSize === size ? styles.selected : ''}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLook && (
            <p className={styles.lookNote}>
              Las piezas de este look también se venden por separado. Consúltanos por WhatsApp.
            </p>
          )}

          {product.measurements && (
            <p className={styles.measurements}>
              <span>Medidas:</span> {product.measurements}
            </p>
          )}

          {/* La compra se coordina por WhatsApp: el mensaje sale armado con la prenda y el talle */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            <ChatIcon width={20} height={20} />
            Consultar por WhatsApp
          </a>
          <button type="button" onClick={handleAddToSelection} className={styles.addButton}>
            Añadir a mi selección
          </button>
          <p className={styles.helpText}>
            Puedes sumar varias prendas a tu selección y consultarlas todas juntas.
          </p>

          {careLines.length > 0 && (
            <details className={styles.care}>
              <summary>Cuidados de la prenda</summary>
              <ul>
                {careLines.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </details>
          )}
          <Link to="/tienda" className={styles.backLink}>← Volver a la tienda</Link>
        </div>
      </div>
    </main>
  );
};

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { getProduct, loading } = useProducts();
  const product = getProduct(productId);

  if (loading) {
    return <main className={styles.pageContainer} aria-busy="true" />;
  }
  if (!product) {
    return <NotFoundPage />;
  }

  // key={product.id}: al pasar de un producto a otro se reinician foto y talle elegidos
  return <ProductDetail key={product.id} product={product} />;
};

export default ProductDetailPage;
