# Almacén El Jordán — Catálogo Web

Catálogo de productos web para **Almacén El Jordán** (San Pedro Sula, Honduras). Muestra el inventario y cierra ventas por WhatsApp. **No procesa pagos.**

Toda la información (productos y banners) se gestiona desde **Google Sheets** — no se necesita tocar el código para actualizar el catálogo.

---

## 🛠️ Tecnología

- HTML5 + CSS3 + JavaScript (sin frameworks)
- Datos: Google Sheets (hoja pública)
- Fotos: Google Drive (links públicos)
- Hosting: Hostinger / GitHub Pages

---

## 📊 Cómo gestionar el catálogo (Google Sheets)

El sitio lee los datos del Google Sheet conectado. Tiene **2 pestañas**:

### Pestaña `Productos`

| Columna | Descripción |
|---------|-------------|
| id | Código único del producto (ej: `GS-K50-Q01B`) |
| nombre | Nombre del producto |
| precio | Precio en lempiras (solo número) |
| precio_anterior | Precio anterior si hay oferta (vacío si no aplica) |
| categoria | Comedores, Estufas, Refrigeradoras, Lavadoras, Congeladores, Microondas, Pequeños Electrodomésticos |
| descripcion | Descripción corta |
| foto1–foto4 | Links de Google Drive de las fotos |
| activo | `TRUE` = aparece en la web / `FALSE` = oculto |
| destacado | `TRUE` = aparece en sección Destacados |

### Pestaña `BANNERS`

| Columna | Descripción |
|---------|-------------|
| orden | Orden de aparición (1, 2, 3...) |
| link | Link de Google Drive del banner (1500 × 438 px) |
| activo | `TRUE` = se muestra / `FALSE` = oculto |

> Los cambios en el Sheet se reflejan en la web en máximo **30 minutos** (caché). Para verlos al instante, abrir en ventana de incógnito.

---

## 📸 Cómo agregar fotos

1. Sube la foto a la carpeta correspondiente en Google Drive
2. Clic derecho → **Compartir** → "Cualquier persona con el enlace puede ver"
3. Copia el enlace y pégalo en la columna `foto1` del producto en el Sheet

**Recomendado:** fotos cuadradas 800 × 800 px, fondo blanco, formato JPG (bajo 200 KB).

---

## 📱 WhatsApp

Número configurado: **+504 9445-2724**

Cada producto genera un mensaje automático:
> "Hola, me interesa el producto: [nombre] - Precio: L [precio]"

Para cambiar el número, editar `js/whatsapp.js` (constante `WA_NUMERO`).

---

## 📁 Estructura del proyecto

```
jordan-catalogo-web/
├── index.html          Página principal (catálogo)
├── producto.html       Página de detalle de producto
├── css/
│   ├── styles.css      Estilos principales
│   └── responsive.css  Adaptación a móvil/tablet
├── js/
│   ├── app.js          Lógica: carga productos, filtros, búsqueda, banners
│   ├── galeria.js      Galería de fotos en detalle
│   └── whatsapp.js     Links de WhatsApp
├── img/                Logo y recursos
└── data/               Datos de respaldo y generadores de Excel
```

---

## ⚙️ Configuración técnica

Para conectar otro Google Sheet, editar en `js/app.js` la constante:

```js
const SHEETS_ID = 'TU_ID_DE_GOOGLE_SHEETS';
```

El ID está en la URL del Sheet:
`https://docs.google.com/spreadsheets/d/`**`[ESTE-ES-EL-ID]`**`/edit`

---

Documento preparado con Claude · Almacén El Jordán © 2026
