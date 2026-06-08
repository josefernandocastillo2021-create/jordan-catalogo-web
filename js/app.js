/* === app.js — Lógica principal del catálogo === */

const CACHE_KEY = 'jordan_productos';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos en ms
const SHEETS_ID = '1KGS32zQnZTcs9lCVFqqocRm1QbOoyZdeNAz66JLn4nA';

let todosLosProductos = [];
let categoriaActiva = 'Todos';
let terminoBusqueda = '';

/* Paginación */
const POR_PAGINA = 20;
let paginaActual = 1;

/* === Inicialización === */
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  cargarBanners();
  iniciarBusqueda();
  iniciarSucursales();
});

/* === Sucursales === */
const SUCURSALES = [
  {
    nombre: 'El Progreso',
    ciudad: 'El Progreso, Yoro',
    principal: true,
    mapa: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d492358.3339975457!2d-87.8093142!3d15.4008664!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f663f7fbaec5ecf%3A0x8116865eecc85fb5!2sAlmacen%20El%20Jordan!5e0!3m2!1ses!2shn!4v1780740742800!5m2!1ses!2shn',
  },
  {
    nombre: 'SPS Centro',
    ciudad: 'San Pedro Sula',
    principal: false,
    mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d492120.41561476374!2d-88.63610811093753!3d15.501058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f665b984ce4848d%3A0x662b5c5c94a7432f!2sAlmacen%20El%20Jordan!5e0!3m2!1ses!2shn!4v1780741012193!5m2!1ses!2shn',
  },
  {
    nombre: 'SPS Barrio La Guardia',
    ciudad: 'San Pedro Sula',
    principal: false,
    mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d492120.41561476374!2d-88.63610811093753!3d15.501058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f665da9b1cdf57f%3A0xaaecaa80f3d5d96!2sAlmacen%20El%20Jordan!5e0!3m2!1ses!2shn!4v1780741091703!5m2!1ses!2shn',
  },
  {
    nombre: 'Comayagua',
    ciudad: 'Comayagua',
    principal: false,
    mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7727.67833450933!2d-87.63814561458582!3d14.436430645072146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6585bd5409b7e1%3A0xc9c397e1a0d67d3d!2zQWxtYWPDqW4gRWwgSm9yZMOhbiDigKIgQ29tYXlhZ3Vh!5e0!3m2!1ses!2shn!4v1780741273203!5m2!1ses!2shn',
  },
  {
    nombre: 'Santa Cruz de Yojoa',
    ciudad: 'Cortés',
    principal: false,
    mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d492120.41561476374!2d-88.63610811093753!3d15.501058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f65df2343cd1fcd%3A0xf08f9bdcd0901181!2sAlmacen%20El%20Jordan!5e0!3m2!1ses!2shn!4v1780741136346!5m2!1ses!2shn',
  },
  {
    nombre: 'Tela',
    ciudad: 'Atlántida',
    principal: false,
    mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d492120.41561476374!2d-88.63610811093753!3d15.501058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f687db6262b9e09%3A0xdd2da9c242dadbd8!2sAlmacen%20El%20Jord%C3%A1n%20%7C%20Tela!5e0!3m2!1ses!2shn!4v1780741190312!5m2!1ses!2shn',
  },
];

function iniciarSucursales() {
  const lista = document.getElementById('sucursales-lista');
  const mapa = document.getElementById('mapa-sucursal');
  if (!lista || !mapa) return;

  lista.innerHTML = SUCURSALES.map((s, i) => `
    <button class="sucursal-item ${i === 0 ? 'activa' : ''}" data-indice="${i}">
      <span class="sucursal-item__icono">📍</span>
      <span class="sucursal-item__texto">
        <span class="sucursal-item__nombre">
          ${s.nombre}
          ${s.principal ? '<span class="sucursal-item__badge">Principal</span>' : ''}
        </span>
        <span class="sucursal-item__ciudad">${s.ciudad}</span>
      </span>
    </button>
  `).join('');

  // Cargar el primer mapa
  mapa.src = SUCURSALES[0].mapa;

  lista.querySelectorAll('.sucursal-item').forEach(btn => {
    btn.addEventListener('click', () => seleccionarSucursal(parseInt(btn.dataset.indice)));
  });
}

function seleccionarSucursal(indice) {
  const mapa = document.getElementById('mapa-sucursal');
  if (mapa) mapa.src = SUCURSALES[indice].mapa;

  document.querySelectorAll('.sucursal-item').forEach((btn, i) => {
    btn.classList.toggle('activa', i === indice);
  });
}

/* === Carga de productos (estrategia stale-while-revalidate) ===
   1. Si hay caché, muestra los datos al instante (carga rápida)
   2. Siempre consulta Sheets en segundo plano y, si algo cambió
      (precios, productos, etc.), actualiza la página en 1-2 segundos */
async function cargarProductos() {
  const cache = leerCache();

  if (cache) {
    todosLosProductos = cache;
    construirCategorias();
    renderizarTodo();
    revalidarProductos(); // refresca en segundo plano sin bloquear
    return;
  }

  // Primera visita o caché vencido: mostrar spinner y esperar datos
  mostrarCargando();
  try {
    const datos = await obtenerProductosFrescos();
    todosLosProductos = datos;
    guardarCache(datos);
    construirCategorias();
    renderizarTodo();
  } catch (error) {
    console.error('Error cargando productos:', error);
    mostrarError();
  }
}

/* Obtiene y filtra los productos desde Sheets (o JSON local) */
async function obtenerProductosFrescos() {
  const datos = SHEETS_ID ? await cargarDesdeSheets() : await cargarDesdeJSON();
  return datos.filter(p => p.activo === true || p.activo === 'TRUE');
}

/* Revalida en segundo plano: si los datos cambiaron, actualiza la vista */
async function revalidarProductos() {
  try {
    const frescos = await obtenerProductosFrescos();
    if (JSON.stringify(frescos) !== JSON.stringify(todosLosProductos)) {
      todosLosProductos = frescos;
      guardarCache(frescos);
      construirCategorias();
      renderizarTodo();
    }
  } catch (error) {
    // Silencioso: ya se mostró el caché, no molestar al usuario
    console.warn('No se pudo revalidar productos:', error);
  }
}

async function cargarDesdeSheets() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:json&sheet=productos_jordan`;
  const res = await fetch(url);
  const text = await res.text();
  // Google devuelve /*O_o*/\ngoogle.visualization.Query.setResponse({...})
  const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1]);
  const filas = json.table.rows;
  return filas.map(fila => {
    const c = fila.c;
    const val = (i) => (c[i] && c[i].v !== null && c[i].v !== undefined) ? c[i].v : '';
    return {
      id:              val(0),
      nombre:          val(1),
      precio:          parseFloat(val(2)) || 0,
      precio_anterior: val(3) !== '' ? parseFloat(val(3)) : null,
      categoria:       val(4),
      descripcion:     val(5),
      foto1:           val(6),
      foto2:           val(7),
      foto3:           val(8),
      foto4:           val(9),
      activo:          val(10) === true || val(10) === 'TRUE',
      destacado:       val(11) === true || val(11) === 'TRUE',
    };
  });
}

async function cargarDesdeJSON() {
  const res = await fetch('data/productos.json');
  return res.json();
}

/* Convierte fila de Sheets a objeto producto */
function filaAProducto(fila) {
  return {
    id: fila[0] || '',
    nombre: fila[1] || '',
    precio: parseFloat(fila[2]) || 0,
    precio_anterior: fila[3] ? parseFloat(fila[3]) : null,
    categoria: fila[4] || '',
    descripcion: fila[5] || '',
    foto1: fila[6] || '',
    foto2: fila[7] || '',
    foto3: fila[8] || '',
    foto4: fila[9] || '',
    activo: fila[10] === 'TRUE',
    destacado: fila[11] === 'TRUE',
  };
}

/* === Banners desde Sheets === */
async function cargarBanners() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:json&sheet=BANNERS`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1]);
    const filas = json.table.rows;

    const banners = filas
      .map(fila => ({
        orden: fila.c[0] ? fila.c[0].v : null,
        link:  fila.c[1] && fila.c[1].v ? fila.c[1].v.trim() : '',
        activo: fila.c[2] ? fila.c[2].v : false,
      }))
      .filter(b => (b.activo === true || b.activo === 'TRUE') && b.link !== '')
      .sort((a, b) => a.orden - b.orden);

    const seccion = document.querySelector('.carrusel');
    const track = document.getElementById('carrusel-track');
    if (!track) return;

    // Sin banners activos: ocultar el carrusel por completo
    if (banners.length === 0) {
      if (seccion) seccion.style.display = 'none';
      return;
    }

    if (seccion) seccion.style.display = '';
    track.innerHTML = banners.map(b => {
      const fotoURL = convertirLinkDriveBanner(b.link);
      return `<div class="carrusel__slide">
        <img src="${fotoURL}" alt="Banner promocional" loading="lazy">
      </div>`;
    }).join('');

    // Armar el carrusel ya con los banners reales (dots, flechas, auto-avance)
    iniciarCarrusel();

  } catch (e) {
    console.error('Error cargando banners:', e);
    const seccion = document.querySelector('.carrusel');
    if (seccion) seccion.style.display = 'none';
  }
}

/* === Caché localStorage === */
function guardarCache(datos) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), datos }));
}

function leerCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, datos } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return datos;
  } catch {
    return null;
  }
}

/* === Filtrado === */
// Normaliza texto: minúsculas y sin acentos para búsqueda flexible
function normalizar(texto) {
  return (texto || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function filtrarProductos() {
  const termino = normalizar(terminoBusqueda);
  return todosLosProductos.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva;
    const coincideBusqueda = termino === '' ||
      normalizar(p.nombre).includes(termino) ||
      normalizar(p.id).includes(termino) ||
      normalizar(p.categoria).includes(termino) ||
      normalizar(p.descripcion).includes(termino);
    return coincideCategoria && coincideBusqueda;
  });
}

/* === Renderizado === */
function renderizarTodo() {
  const productos = filtrarProductos();
  renderizarDestacados();
  renderizarGrid(productos);
  actualizarContador(productos.length);
  actualizarTitulo();
}

function renderizarDestacados() {
  const seccion = document.getElementById('seccion-destacados');
  if (!seccion) return;

  // Solo mostrar Destacados en la vista "Todos" sin búsqueda activa
  const enVistaGeneral = categoriaActiva === 'Todos' && terminoBusqueda === '';
  const destacados = todosLosProductos.filter(p => p.destacado === true || p.destacado === 'TRUE');

  if (!enVistaGeneral || destacados.length === 0) {
    seccion.style.display = 'none';
    return;
  }

  seccion.style.display = 'block';
  const grid = document.getElementById('destacados-grid');
  grid.innerHTML = destacados.map(p => crearCardHTML(p)).join('');
}

function actualizarTitulo() {
  const titulo = document.getElementById('titulo-catalogo');
  if (!titulo) return;
  titulo.textContent = categoriaActiva === 'Todos' ? 'Todos los Productos' : categoriaActiva;
}

function renderizarGrid(productos) {
  const grid = document.getElementById('productos-grid');

  if (productos.length === 0) {
    grid.innerHTML = htmlSinResultados();
    renderizarPaginacion(0);
    return;
  }

  const totalPaginas = Math.ceil(productos.length / POR_PAGINA);
  if (paginaActual > totalPaginas) paginaActual = 1;

  const inicio = (paginaActual - 1) * POR_PAGINA;
  const pagina = productos.slice(inicio, inicio + POR_PAGINA);

  grid.innerHTML = pagina.map(p => crearCardHTML(p)).join('');
  renderizarPaginacion(totalPaginas);
}

/* === Paginación === */
function renderizarPaginacion(totalPaginas) {
  const cont = document.getElementById('paginacion');
  if (!cont) return;

  if (totalPaginas <= 1) { cont.innerHTML = ''; return; }

  let botones = '';

  // Flecha anterior
  botones += `<button class="pagina-btn pagina-nav" ${paginaActual === 1 ? 'disabled' : ''} onclick="irAPagina(${paginaActual - 1})" aria-label="Anterior">‹</button>`;

  // Números con elipsis cuando hay muchas páginas
  const paginas = calcularPaginasVisibles(paginaActual, totalPaginas);
  paginas.forEach(p => {
    if (p === '...') {
      botones += `<span class="pagina-ellipsis">…</span>`;
    } else {
      botones += `<button class="pagina-btn ${p === paginaActual ? 'activa' : ''}" onclick="irAPagina(${p})">${p}</button>`;
    }
  });

  // Flecha siguiente
  botones += `<button class="pagina-btn pagina-nav" ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="irAPagina(${paginaActual + 1})" aria-label="Siguiente">›</button>`;

  cont.innerHTML = botones;
}

function calcularPaginasVisibles(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (actual >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', actual - 1, actual, actual + 1, '...', total];
}

function irAPagina(n) {
  paginaActual = n;
  renderizarGrid(filtrarProductos());
  const titulo = document.getElementById('titulo-catalogo');
  if (titulo) titulo.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function actualizarContador(total) {
  const el = document.getElementById('contador-productos');
  if (el) el.textContent = total;
}

/* === Card HTML === */
function crearCardHTML(producto) {
  const tieneOferta = producto.precio_anterior && producto.precio_anterior > producto.precio;
  const descuento = tieneOferta
    ? Math.round((1 - producto.precio / producto.precio_anterior) * 100)
    : 0;

  const fotoID = extraerIdDrive(producto.foto1);
  const fotoURL = producto.foto1 ? convertirLinkDrive(producto.foto1) : null;

  const fotoHTML = fotoURL
    ? `<img src="${fotoURL}" alt="${producto.nombre}" loading="lazy" onerror="manejarErrorFoto(this, '${fotoID || ''}')">`
    : iconoSinFoto();

  const badgeOferta = tieneOferta
    ? `<span class="producto-card__badge">-${descuento}%</span>`
    : '';

  const badgeDestacado = (producto.destacado === true || producto.destacado === 'TRUE')
    ? `<span class="producto-card__badge producto-card__badge--destacado">⭐ Destacado</span>`
    : '';

  const precioAnterior = tieneOferta
    ? `<span class="producto-card__precio-anterior">L ${producto.precio_anterior.toLocaleString('es-HN')}</span>`
    : '';

  const linkWA = generarLinkWhatsApp(producto.nombre, producto.precio);
  const nombreEsc = (producto.nombre || '').replace(/'/g, "\\'");

  return `
    <div class="producto-card" onclick="window.location='producto.html?id=${producto.id}'">
      ${badgeOferta}
      ${badgeDestacado}
      <div class="producto-card__foto">${fotoHTML}</div>
      <div class="producto-card__info">
        <span class="producto-card__categoria">${producto.categoria} · <span style="font-weight:600;color:#1B3A6B;">${producto.id}</span></span>
        <h3 class="producto-card__nombre">${producto.nombre}</h3>
        <div class="producto-card__precios">
          <span class="producto-card__precio">L ${producto.precio.toLocaleString('es-HN')}</span>
          ${precioAnterior}
        </div>
        <div class="producto-card__acciones">
          <button class="producto-card__add" onclick="event.stopPropagation(); agregarAlCarrito('${producto.id}', '${nombreEsc}', ${producto.precio}, 1)" aria-label="Agregar a cotización" title="Agregar a cotización">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </button>
          <a href="${linkWA}" target="_blank" class="producto-card__btn" onclick="event.stopPropagation()">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Consultar por WhatsApp
        </a>
        </div>
      </div>
    </div>
  `;
}

/* === Utilidades === */
// Extrae el ID de un link de Google Drive
function extraerIdDrive(url) {
  const match = (url || '').match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// URL principal: CDN de Google (lh3), más rápido y sin throttle
function convertirLinkDrive(url) {
  const id = extraerIdDrive(url);
  return id ? `https://lh3.googleusercontent.com/d/${id}=w800` : url;
}

function convertirLinkDriveBanner(url) {
  const id = extraerIdDrive(url);
  return id ? `https://lh3.googleusercontent.com/d/${id}=w1600` : url;
}

// Manejo de error con respaldo: si falla lh3, intenta thumbnail; si falla, "Sin foto"
function manejarErrorFoto(img, id) {
  if (img.dataset.intento === '1' || !id) {
    img.parentElement.innerHTML = iconoSinFoto();
    return;
  }
  img.dataset.intento = '1';
  img.src = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
}

function iconoSinFoto() {
  return `<div class="foto-placeholder">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
    <span>Sin foto</span>
  </div>`;
}

function htmlSinResultados() {
  return `<div class="sin-resultados">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <h3>Sin resultados</h3>
    <p>No encontramos productos para tu búsqueda.</p>
  </div>`;
}

function mostrarCargando() {
  const grid = document.getElementById('productos-grid');
  if (grid) grid.innerHTML = `<div class="loading"><div class="spinner"></div><span>Cargando productos...</span></div>`;
}

function mostrarError() {
  const grid = document.getElementById('productos-grid');
  if (grid) grid.innerHTML = `<div class="sin-resultados"><h3>Error al cargar</h3><p>Intenta recargar la página.</p></div>`;
}

/* === Categorías (generadas automáticamente desde el Sheet) === */
function construirCategorias() {
  // 'Todos' + categorías únicas según los productos activos (en orden de aparición)
  const unicas = [...new Set(
    todosLosProductos
      .map(p => (p.categoria || '').trim())
      .filter(c => c !== '')
  )];
  const categorias = ['Todos', ...unicas];

  const barraDesktop = document.getElementById('categorias-desktop');
  const barraMovil = document.getElementById('categorias-movil');

  const crearBotones = (contenedor) => {
    if (!contenedor) return;
    contenedor.innerHTML = categorias.map(cat =>
      `<button class="categoria-btn ${cat === categoriaActiva ? 'activo' : ''}" data-categoria="${cat}">${cat}</button>`
    ).join('');

    contenedor.querySelectorAll('.categoria-btn').forEach(btn => {
      btn.addEventListener('click', () => seleccionarCategoria(btn.dataset.categoria));
    });
  };

  crearBotones(barraDesktop);
  crearBotones(barraMovil);
}

function seleccionarCategoria(categoria) {
  categoriaActiva = categoria;
  paginaActual = 1;

  document.querySelectorAll('.categoria-btn').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.categoria === categoria);
  });

  cerrarMenuMovil();
  renderizarTodo();
}

/* === Búsqueda === */
function iniciarBusqueda() {
  const input = document.getElementById('busqueda-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    terminoBusqueda = e.target.value.trim();
    paginaActual = 1;

    // Al buscar, resetear la categoría a "Todos" para buscar en todo el catálogo
    if (terminoBusqueda !== '' && categoriaActiva !== 'Todos') {
      categoriaActiva = 'Todos';
      document.querySelectorAll('.categoria-btn').forEach(btn => {
        btn.classList.toggle('activo', btn.dataset.categoria === 'Todos');
      });
    }

    renderizarTodo();
  });

  const form = document.getElementById('busqueda-form');
  if (form) form.addEventListener('submit', (e) => e.preventDefault());
}

/* === Menú móvil === */
function toggleMenuMovil() {
  const menu = document.getElementById('menu-movil');
  if (menu) menu.classList.toggle('abierto');
}

function cerrarMenuMovil() {
  const menu = document.getElementById('menu-movil');
  if (menu) menu.classList.remove('abierto');
}

/* === Carrusel de banners === */
let carruselIntervalo = null;
let carruselListo = false;

function iniciarCarrusel() {
  const track = document.getElementById('carrusel-track');
  const dotsContenedor = document.getElementById('carrusel-dots');
  if (!track || !dotsContenedor) return;

  const slides = track.querySelectorAll('.carrusel__slide');
  const total = slides.length;
  if (total === 0) return;

  let actual = 0;
  if (carruselIntervalo) clearInterval(carruselIntervalo);

  const irA = (indice) => {
    actual = (indice + total) % total;
    track.style.transform = `translateX(-${actual * 100}%)`;
    dotsContenedor.querySelectorAll('.carrusel__dot').forEach((d, i) => {
      d.classList.toggle('activo', i === actual);
    });
  };

  /* Dots según la cantidad real de banners */
  dotsContenedor.innerHTML = Array.from({ length: total }, (_, i) =>
    `<button class="carrusel__dot ${i === 0 ? 'activo' : ''}" aria-label="Banner ${i + 1}"></button>`
  ).join('');
  dotsContenedor.querySelectorAll('.carrusel__dot').forEach((dot, i) => {
    dot.addEventListener('click', () => { irA(i); reiniciarIntervalo(); });
  });

  const iniciarIntervalo = () => {
    if (total > 1) carruselIntervalo = setInterval(() => irA(actual + 1), 6500);
  };
  const reiniciarIntervalo = () => { clearInterval(carruselIntervalo); iniciarIntervalo(); };

  irA(0);
  iniciarIntervalo();

  /* Listeners (flechas, mouse, swipe) — solo una vez */
  if (!carruselListo) {
    carruselListo = true;
    document.getElementById('carrusel-prev')?.addEventListener('click', () => { irA(actual - 1); reiniciarIntervalo(); });
    document.getElementById('carrusel-next')?.addEventListener('click', () => { irA(actual + 1); reiniciarIntervalo(); });

    const cont = track.closest('.carrusel');
    cont?.addEventListener('mouseenter', () => clearInterval(carruselIntervalo));
    cont?.addEventListener('mouseleave', iniciarIntervalo);

    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { irA(actual + (diff > 0 ? 1 : -1)); reiniciarIntervalo(); }
    });
  }
}
