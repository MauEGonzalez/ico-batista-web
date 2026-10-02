// /src/collections.js
// Colecciones de Ico Batista, en el orden en que aparecen en el menú.
// slug: la parte de la URL (/colecciones/vestigios). No cambiarlo una vez publicado: rompe los links.
// description y heroImage son opcionales: si están vacíos, la página muestra solo el título.
export const COLLECTIONS = [
  { slug: 'vestigios', title: 'Vestigios', description: '', heroImage: '' },
  { slug: 'altitud', title: 'Altitud', description: '', heroImage: '' },
  { slug: 'flower-power', title: 'Flower Power', description: '', heroImage: '' },
  { slug: 'arenas', title: 'Arenas', description: '', heroImage: '' },
  { slug: 'raices', title: 'Raíces', description: '', heroImage: '' },
  { slug: 'altitud-vol-ii', title: 'Altitud Vol. II', description: '', heroImage: '' },
];

export const getCollection = (slug) => COLLECTIONS.find((collection) => collection.slug === slug);
