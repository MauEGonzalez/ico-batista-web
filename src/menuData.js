export const menuData = [
  {
    title: "Moda Hombre",
    children: [
      {
        title: "Formal",
        path: "/tienda/hombre/formal",
        children: [
          { title: "Trajes", path: "/tienda/hombre/formal/trajes" },
          { title: "Camisas", path: "/tienda/hombre/formal/camisas" },
          { title: "Pantalones", path: "/tienda/hombre/formal/pantalones" },
          { title: "Tapados", path: "/tienda/hombre/formal/tapados" },
          { title: "Capas", path: "/tienda/hombre/formal/capas" },
        ],
      },
      {
        title: "Casual",
        path: "/tienda/hombre/casual",
        children: [
          { title: "Conjuntos", path: "/tienda/hombre/casual/conjuntos" },
          { title: "Camperas", path: "/tienda/hombre/casual/camperas" },
          { title: "Buzos", path: "/tienda/hombre/casual/buzos" },
          {
            title: "Basicos",
            path: "/tienda/hombre/casual/basicos",
            children: [
              { title: "Remeras", path: "/tienda/hombre/casual/basicos/remeras" },
              { title: "Pantalones", path: "/tienda/hombre/casual/basicos/pantalones" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Moda Mujer",
    children: [
      {
        title: "Formal",
        path: "/tienda/mujer/formal",
        children: [
          {
            title: "Fiesta",
            path: "/tienda/mujer/formal/fiesta",
            children: [
              { title: "Camisas", path: "/tienda/mujer/formal/fiesta/camisas" },
              { title: "Blusas", path: "/tienda/mujer/formal/fiesta/blusas" },
              { title: "Tops", path: "/tienda/mujer/formal/fiesta/tops" },
              { title: "Faldas", path: "/tienda/mujer/formal/fiesta/faldas" },
              { title: "Shorts", path: "/tienda/mujer/formal/fiesta/shorts" },
              { title: "Pantalones", path: "/tienda/mujer/formal/fiesta/pantalones" },
              { title: "Vestidos", path: "/tienda/mujer/formal/fiesta/vestidos" },
              { title: "Monos", path: "/tienda/mujer/formal/fiesta/monos" },
              { title: "Trajes", path: "/tienda/mujer/formal/fiesta/trajes" },
            ],
          },
          {
            title: "Coctel",
            path: "/tienda/mujer/formal/coctel",
            children: [
              { title: "Vestidos", path: "/tienda/mujer/formal/coctel/vestidos" },
              { title: "Faldas", path: "/tienda/mujer/formal/coctel/faldas" },
              { title: "Trajes", path: "/tienda/mujer/formal/coctel/trajes" },
              { title: "Camisas", path: "/tienda/mujer/formal/coctel/camisas" },
              { title: "Pantalones", path: "/tienda/mujer/formal/coctel/pantalones" },
            ],
          },
          {
            title: "Gala",
            path: "/tienda/mujer/formal/gala",
            children: [
              { title: "Vestidos", path: "/tienda/mujer/formal/gala/vestidos" },
            ],
          },
        ],
      },
      {
        title: "Casual",
        path: "/tienda/mujer/casual",
        children: [
          {
            title: "Sport",
            path: "/tienda/mujer/casual/sport",
            children: [
              { title: "Calzas", path: "/tienda/mujer/casual/sport/calzas" },
              { title: "Tops", path: "/tienda/mujer/casual/sport/tops" },
              { title: "Remeras", path: "/tienda/mujer/casual/sport/remeras" },
              { title: "Camperas", path: "/tienda/mujer/casual/sport/camperas" },
              { title: "Buzos", path: "/tienda/mujer/casual/sport/buzos" },
              { title: "Conjuntos", path: "/tienda/mujer/casual/sport/conjuntos" },
            ],
          },
          {
            title: "Basicos",
            path: "/tienda/mujer/casual/basicos",
            children: [
              { title: "Remeras", path: "/tienda/mujer/casual/basicos/remeras" },
              { title: "Conjuntos", path: "/tienda/mujer/casual/basicos/conjuntos" },
              { title: "Pantalones", path: "/tienda/mujer/casual/basicos/pantalones" },
              { title: "Camperas", path: "/tienda/mujer/casual/basicos/camperas" },
              { title: "Buzos", path: "/tienda/mujer/casual/basicos/buzos" },
              { title: "Faldas", path: "/tienda/mujer/casual/basicos/faldas" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Colecciones",
    children: [
      { title: "Coleccion 1", path: "/colecciones/1" },
      { title: "Coleccion 2", path: "/colecciones/2" },
    ],
  },
  {
    title: "Desfiles",
    children: [
      { title: "Desfile 1", path: "/desfiles/1" },
      { title: "Desfile 2", path: "/desfiles/2" },
    ],
  },
  
  // 👇👇👇 NUEVO ENLACE A "CONTACTO" AÑADIDO AQUÍ 👇👇👇
  {
    title: "Contacto",
    path: "/contacto",
  },
  
  {
    title: "Carrito de Compras",
    path: "/carrito",
  },
];