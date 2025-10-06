// Esta es nuestra base de datos de productos de ejemplo.
// Los 'id' son únicos para cada producto.
// Las rutas de las imágenes son placeholders, deberás reemplazarlas con tus fotos.

export const productsData = [
  // ===========================================
  // MODA HOMBRE
  // ===========================================

  // --- HOMBRE / FORMAL ---
  {
    id: "hft001",
    name: "Traje 'Eclipse' de Lana Merino",
    category: "hombre/formal/trajes",
    images: ["/assets/images/products/h-traje-eclipse-1.jpg", "/assets/images/products/h-traje-eclipse-2.jpg"],
    description: "Corte slim fit en lana merino extrafina. Un clásico atemporal con un toque de modernidad, perfecto para cualquier evento formal.",
    price: 950.00,
  },
  {
    id: "hfc001",
    name: "Camisa 'Structure' de Algodón Egipcio",
    category: "hombre/formal/camisas",
    images: ["/assets/images/products/h-camisa-structure-1.jpg", "/assets/images/products/h-camisa-structure-2.jpg"],
    description: "Tejido de popelín de algodón egipcio que ofrece una suavidad y estructura inigualables. Cuello italiano y puños dobles.",
    price: 220.00,
  },
  {
    id: "hfp001",
    name: "Pantalón de Pinzas 'Architect'",
    category: "hombre/formal/pantalones",
    images: ["/assets/images/products/h-pantalon-architect-1.jpg"],
    description: "Pantalón de vestir con doble pinza frontal, elaborado en una sarga de lana fría que asegura una caída impecable.",
    price: 280.00,
  },
  {
    id: "hftap001",
    name: "Tapado 'Metropolis' de Paño",
    category: "hombre/formal/tapados",
    images: ["/assets/images/products/h-tapado-metropolis-1.jpg", "/assets/images/products/h-tapado-metropolis-2.jpg"],
    description: "Abrigo de corte recto y solapas amplias, confeccionado en paño de lana y cachemira. La pieza exterior definitiva.",
    price: 1100.00,
  },
  {
    id: "hfcap001",
    name: "Capa 'Nomad' Asimétrica",
    category: "hombre/formal/capas",
    images: ["/assets/images/products/h-capa-nomad-1.jpg"],
    description: "Una declaración de estilo. Capa de corte asimétrico en tejido técnico repelente al agua con detalles en cuero.",
    price: 890.00,
  },

  // --- HOMBRE / CASUAL ---
  {
    id: "hcc001",
    name: "Conjunto 'Urban Leisure' de Felpa",
    category: "hombre/casual/conjuntos",
    images: ["/assets/images/products/h-conjunto-urban-1.jpg"],
    description: "Buzo y pantalón jogger a juego, confeccionados en felpa perchada para una comodidad superior sin sacrificar el estilo.",
    price: 410.00,
  },
  {
    id: "hccam001",
    name: "Campera Bomber 'Aviator'",
    category: "hombre/casual/camperas",
    images: ["/assets/images/products/h-campera-aviator-1.jpg", "/assets/images/products/h-campera-aviator-2.jpg"],
    description: "Clásica campera bomber reversionada con tejido de nylon satinado y forro interior en contraste. Versatilidad para el día a día.",
    price: 520.00,
  },
  {
    id: "hcb001",
    name: "Buzo con Capucha 'Graphite'",
    category: "hombre/casual/buzos",
    images: ["/assets/images/products/h-buzo-graphite-1.jpg"],
    description: "Un esencial elevado. Buzo de algodón grueso con capucha, corte oversized y un sutil logo bordado en el pecho.",
    price: 250.00,
  },
  {
    id: "hcbr001",
    name: "Remera 'Essential' de Algodón Pima",
    category: "hombre/casual/basicos/remeras",
    images: ["/assets/images/products/h-remera-essential-1.jpg"],
    description: "La base de cualquier armario. Remera de cuello redondo y corte regular, confeccionada en el más suave algodón Pima.",
    price: 95.00,
  },
  {
    id: "hcbp001",
    name: "Pantalón Chino 'Everyday'",
    category: "hombre/casual/basicos/pantalones",
    images: ["/assets/images/products/h-pantalon-chino-1.jpg", "/assets/images/products/h-pantalon-chino-2.jpg"],
    description: "Pantalón chino de gabardina elastizada que ofrece comodidad y un look pulido para cualquier ocasión casual.",
    price: 180.00,
  },

  // ===========================================
  // MODA MUJER
  // ===========================================

  // --- MUJER / FORMAL ---
  {
    id: "mffv001",
    name: "Vestido 'Aurora' de Satén",
    category: "mujer/formal/fiesta/vestidos",
    images: ["/assets/images/products/m-vestido-aurora-1.jpg", "/assets/images/products/m-vestido-aurora-2.jpg"],
    description: "Vestido largo con escote drapeado y espalda descubierta, confeccionado en satén de seda que fluye con cada movimiento.",
    price: 820.00,
  },
  {
    id: "mffb001",
    name: "Blusa 'Poet' con Lazo",
    category: "mujer/formal/fiesta/blusas",
    images: ["/assets/images/products/m-blusa-poet-1.jpg"],
    description: "Blusa de organza semitransparente con mangas abullonadas y un elegante lazo en el cuello. Pura sofisticación.",
    price: 310.00,
  },
  {
    id: "mfft001",
    name: "Traje 'Blazer & Pant' en Crepe",
    category: "mujer/formal/fiesta/trajes",
    images: ["/assets/images/products/m-traje-crepe-1.jpg", "/assets/images/products/m-traje-crepe-2.jpg"],
    description: "Conjunto de blazer entallado y pantalón palazzo en crepe de alta densidad. Un look poderoso y femenino.",
    price: 980.00,
  },
  {
    id: "mfcv001",
    name: "Vestido 'Midi' Estructurado",
    category: "mujer/formal/coctel/vestidos",
    images: ["/assets/images/products/m-vestido-midi-1.jpg"],
    description: "Vestido de largo midi con escote asimétrico y un drapeado lateral que estiliza la figura. Ideal para un evento de cóctel.",
    price: 650.00,
  },
  {
    id: "mfct001",
    name: "Traje 'Tuxedo' Femenino",
    category: "mujer/formal/coctel/trajes",
    images: ["/assets/images/products/m-traje-tuxedo-1.jpg"],
    description: "Reinterpretación del esmoquin clásico. Blazer con solapa de satén y pantalón de corte recto para un look andrógino chic.",
    price: 1050.00,
  },
  {
    id: "mfgv001",
    name: "Vestido 'Empire' de Gala Bordado",
    category: "mujer/formal/gala/vestidos",
    images: ["/assets/images/products/m-vestido-gala-1.jpg", "/assets/images/products/m-vestido-gala-2.jpg", "/assets/images/products/m-vestido-gala-3.jpg"],
    description: "Espectacular vestido de corte imperio con cuerpo íntegramente bordado en pedrería y falda de tul multicapa.",
    price: 2500.00,
  },
  {
    id: "mffp001",
    name: "Pantalón 'Palazzo' de Seda",
    category: "mujer/formal/fiesta/pantalones",
    images: ["/assets/images/products/m-pantalon-palazzo-1.jpg"],
    description: "Pantalón de tiro alto y pierna extra ancha, confeccionado en seda natural que aporta un movimiento y caída únicos.",
    price: 420.00,
  },
  {
    id: "mffm001",
    name: "Mono 'Jumpsuit' Escultural",
    category: "mujer/formal/fiesta/monos",
    images: ["/assets/images/products/m-mono-escultural-1.jpg", "/assets/images/products/m-mono-escultural-2.jpg"],
    description: "Jumpsuit de una sola pieza con cuerpo estructurado, escote palabra de honor y pantalón recto. La alternativa moderna al vestido.",
    price: 750.00,
  },

  // --- MUJER / CASUAL ---
  {
    id: "mcsc001",
    name: "Conjunto 'Athleisure' Técnico",
    category: "mujer/casual/sport/conjuntos",
    images: ["/assets/images/products/m-conjunto-athleisure-1.jpg"],
    description: "Top y calzas a juego en tejido técnico transpirable con detalles reflectantes. Del gimnasio a la calle sin escalas.",
    price: 350.00,
  },
  {
    id: "mcst001",
    name: "Top Deportivo 'Second Skin'",
    category: "mujer/casual/sport/tops",
    images: ["/assets/images/products/m-top-secondskin-1.jpg"],
    description: "Top de alta sujeción con diseño de espalda cruzada, fabricado en un tejido suave y elástico que se siente como una segunda piel.",
    price: 110.00,
  },
  {
    id: "mcssc001",
    name: "Campera 'Windbreaker' Ligera",
    category: "mujer/casual/sport/camperas",
    images: ["/assets/images/products/m-campera-wind-1.jpg"],
    description: "Campera rompevientos ultraligera con diseño color-block y capucha ajustable. Plegable en su propio bolsillo.",
    price: 280.00,
  },
  {
    id: "mcbr001",
    name: "Remera 'Linen' de Lino",
    category: "mujer/casual/basicos/remeras",
    images: ["/assets/images/products/m-remera-linen-1.jpg", "/assets/images/products/m-remera-linen-2.jpg"],
    description: "Remera de corte relajado y cuello en V, confeccionada en una mezcla de lino y algodón para una sensación fresca y natural.",
    price: 100.00,
  },
  {
    id: "mcbp001",
    name: "Pantalón 'Cargo' de Satén",
    category: "mujer/casual/basicos/pantalones",
    images: ["/assets/images/products/m-pantalon-cargo-1.jpg"],
    description: "El clásico pantalón cargo, elevado con un tejido de satén de algodón que le da un brillo sutil y una caída sofisticada.",
    price: 260.00,
  },
  {
    id: "mcbc001",
    name: "Campera de Jean 'Oversized'",
    category: "mujer/casual/basicos/camperas",
    images: ["/assets/images/products/m-campera-jean-1.jpg"],
    description: "Un ícono atemporal. Campera de denim rígido con corte oversized, hombros caídos y un lavado de estilo vintage.",
    price: 390.00,
  },
  {
    id: "mcbf001",
    name: "Falda 'Slip' de Seda",
    category: "mujer/casual/basicos/faldas",
    images: ["/assets/images/products/m-falda-slip-1.jpg", "/assets/images/products/m-falda-slip-2.jpg"],
    description: "Falda de largo midi cortada al bies, confeccionada en seda lavada para una caída perfecta. Versátil para looks de día y de noche.",
    price: 290.00,
  },

  // ===========================================
  // COLECCIONES Y DESFILES (Ejemplos genéricos)
  // ===========================================
  {
    id: "col001",
    name: "Look #1 - Colección 'Amanecer'",
    category: "colecciones/1",
    images: ["/assets/images/products/coleccion-1-look-1.jpg"],
    description: "Top de seda y falda pantalón de la Colección 'Amanecer'.",
    price: 680.00,
  },
  {
    id: "col002",
    name: "Look #2 - Colección 'Amanecer'",
    category: "colecciones/1",
    images: ["/assets/images/products/coleccion-1-look-2.jpg"],
    description: "Vestido estructurado de la Colección 'Amanecer'.",
    price: 950.00,
  },
  {
    id: "col003",
    name: "Look #1 - Colección 'Nocturna'",
    category: "colecciones/2",
    images: ["/assets/images/products/coleccion-2-look-1.jpg"],
    description: "Abrigo de paño y pantalón de cuero de la Colección 'Nocturna'.",
    price: 1500.00,
  },
  {
    id: "des001",
    name: "Look de Apertura - Desfile SS25",
    category: "desfiles/1",
    images: ["/assets/images/products/desfile-1-look-1.jpg"],
    description: "El primer look que pisó la pasarela en el desfile Primavera/Verano 2025.",
    price: 2100.00,
  },
  {
    id: "des002",
    name: "Look de Cierre - Desfile SS25",
    category: "desfiles/1",
    images: ["/assets/images/products/desfile-1-look-2.jpg"],
    description: "El espectacular vestido de novia que cerró el desfile Primavera/Verano 2025.",
    price: 5500.00,
  },
];