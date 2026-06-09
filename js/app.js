/* === app.js — Lógica principal del catálogo === */

const CACHE_KEY = 'jordan_productos';
const CACHE_KEY_BANNERS = 'jordan_banners';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos en ms
const API_URL = 'https://script.google.com/macros/s/AKfycbw4Tx2mVKd_l6GuImW6SDJl_ZyX_IXGmYKzmhtlhewszfkLCHb0qrqkX8Z7Ni8MbNQ6_Q/exec';

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
  iniciarDestacadosNav();
});

/* === Navegación del carrusel de destacados (flechas) === */
function iniciarDestacadosNav() {
  const track = document.getElementById('destacados-grid');
  if (!track) return;
  const paso = () => Math.max(track.clientWidth * 0.8, 200);
  document.getElementById('destacados-prev')?.addEventListener('click', () => track.scrollBy({ left: -paso(), behavior: 'smooth' }));
  document.getElementById('destacados-next')?.addEventListener('click', () => track.scrollBy({ left: paso(), behavior: 'smooth' }));
  window.addEventListener('resize', actualizarNavDestacados);
}

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
  const select = document.getElementById('sucursales-select');
  const mapa = document.getElementById('mapa-sucursal');
  if (!lista || !mapa) return;

  // Lista (escritorio)
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

  lista.querySelectorAll('.sucursal-item').forEach(btn => {
    btn.addEventListener('click', () => seleccionarSucursal(parseInt(btn.dataset.indice)));
  });

  // Dropdown (móvil)
  if (select) {
    select.innerHTML = SUCURSALES.map((s, i) =>
      `<option value="${i}">📍 ${s.nombre} — ${s.ciudad}${s.principal ? ' (Principal)' : ''}</option>`
    ).join('');
    select.addEventListener('change', () => seleccionarSucursal(parseInt(select.value)));
  }

  // Cargar el primer mapa
  mapa.src = SUCURSALES[0].mapa;
}

function seleccionarSucursal(indice) {
  const mapa = document.getElementById('mapa-sucursal');
  if (mapa) mapa.src = SUCURSALES[indice].mapa;

  document.querySelectorAll('.sucursal-item').forEach((btn, i) => {
    btn.classList.toggle('activa', i === indice);
  });

  const select = document.getElementById('sucursales-select');
  if (select && select.value != indice) select.value = indice;
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

/* Obtiene y filtra los productos desde el Apps Script */
async function obtenerProductosFrescos() {
  const datos = await cargarDesdeSheets();
  return datos.filter(p => p.activo);
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
  const res = await fetch(`${API_URL}?tipo=productos`);
  const filas = await res.json();
  return filas.map(raw => {
    const f = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v]));
    return {
      id:              String(f.id || ''),
      nombre:          String(f.nombre || ''),
      precio:          parseFloat(f.precio) || 0,
      precio_anterior: (f.precio_anterior !== '' && f.precio_anterior !== null && f.precio_anterior !== undefined)
                         ? parseFloat(f.precio_anterior) : null,
      categoria:       String(f.categoria || ''),
      descripcion:     String(f.descripcion || ''),
      foto1:           String(f.foto1 || ''),
      foto2:           String(f.foto2 || ''),
      foto3:           String(f.foto3 || ''),
      foto4:           String(f.foto4 || ''),
      activo:          f.activo === true || String(f.activo).toUpperCase() === 'TRUE',
      destacado:       f.destacado === true || String(f.destacado).toUpperCase() === 'TRUE',
      regalia:         String(f.regalia || ''),
    };
  });
}

/* === Banners desde Apps Script (stale-while-revalidate) === */
async function cargarBanners() {
  const cache = leerCacheBanners();
  if (cache) {
    renderizarBanners(cache);
    revalidarBanners(cache);
    return;
  }
  try {
    const banners = await obtenerBannersFrescos();
    guardarCacheBanners(banners);
    renderizarBanners(banners);
  } catch (e) {
    console.error('Error cargando banners:', e);
    const seccion = document.querySelector('.carrusel');
    if (seccion) seccion.style.display = 'none';
  }
}

async function obtenerBannersFrescos() {
  const res = await fetch(`${API_URL}?tipo=banners`);
  const filas = await res.json();
  return filas
    .map(raw => {
      const f = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v]));
      return {
        orden:  Number(f.orden) || 0,
        link:   String(f.link  || '').trim(),
        activo: f.activo === true || String(f.activo).toUpperCase() === 'TRUE',
      };
    })
    .filter(b => b.activo && b.link !== '')
    .sort((a, b) => a.orden - b.orden);
}

async function revalidarBanners(cached) {
  try {
    const frescos = await obtenerBannersFrescos();
    if (JSON.stringify(frescos) !== JSON.stringify(cached)) {
      guardarCacheBanners(frescos);
      renderizarBanners(frescos);
    }
  } catch { /* silencioso */ }
}

function renderizarBanners(banners) {
  const seccion = document.querySelector('.carrusel');
  const track = document.getElementById('carrusel-track');
  if (!track) return;

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
  iniciarCarrusel();
}

function guardarCacheBanners(datos) {
  localStorage.setItem(CACHE_KEY_BANNERS, JSON.stringify({ ts: Date.now(), datos }));
}

function leerCacheBanners() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_BANNERS);
    if (!raw) return null;
    const { ts, datos } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return datos;
  } catch { return null; }
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
  actualizarNavDestacados();
}

/* Muestra las flechas solo si hay productos suficientes para deslizar */
function actualizarNavDestacados() {
  const track = document.getElementById('destacados-grid');
  const nav = document.querySelector('.destacados__nav');
  if (!track || !nav) return;
  const sePuedeDeslizar = track.scrollWidth > track.clientWidth + 5;
  nav.style.display = sePuedeDeslizar ? 'flex' : 'none';
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

  const regaliaHTML = producto.regalia
    ? `<div class="regalia-overlay">
        <img src="${convertirLinkDrive(producto.regalia)}" alt="Regalo incluido" class="regalia-overlay__img" loading="lazy">
        <span class="regalia-overlay__label">🎁 Regalo</span>
      </div>`
    : '';

  const badgeOferta = tieneOferta
    ? `<span class="producto-card__badge producto-card__badge--oferta">-${descuento}%</span>`
    : '';

  const badgeDestacado = (producto.destacado === true || producto.destacado === 'TRUE')
    ? `<span class="producto-card__badge producto-card__badge--destacado">⭐ Destacado</span>`
    : '';

  const precioAnterior = tieneOferta
    ? `<span class="producto-card__precio-anterior">L ${producto.precio_anterior.toLocaleString('es-HN')}</span>`
    : '';

  const nombreEsc = (producto.nombre || '').replace(/'/g, "\\'");

  return `
    <div class="producto-card" onclick="window.location='producto.html?id=${producto.id}'">
      ${badgeOferta}
      ${badgeDestacado}
      <div class="producto-card__foto">${fotoHTML}${regaliaHTML}</div>
      <div class="producto-card__info">
        <span class="producto-card__categoria">${producto.categoria} · <span style="font-weight:600;color:#1B3A6B;">${producto.id}</span></span>
        <h3 class="producto-card__nombre">${producto.nombre}</h3>
        <div class="producto-card__precios">
          <span class="producto-card__precio ${tieneOferta ? 'producto-card__precio--oferta' : ''}">L ${producto.precio.toLocaleString('es-HN')}</span>
          ${precioAnterior}
        </div>
        <button class="producto-card__btn-cotizar" onclick="event.stopPropagation(); agregarAlCarrito('${producto.id}', '${nombreEsc}', ${producto.precio}, 1, '${fotoURL || ''}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Agregar a cotización
        </button>
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
