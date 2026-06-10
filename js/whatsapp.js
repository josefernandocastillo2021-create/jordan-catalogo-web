/* === whatsapp.js — Links dinámicos de WhatsApp === */

const WA_NUMERO = CONFIG.whatsapp;
const WA_BASE = 'https://wa.me/';

/* Genera link de WhatsApp con mensaje prellenado para un producto */
function generarLinkWhatsApp(nombre, precio) {
  const mensaje = `Hola, me interesa el producto: ${nombre} - Precio: L ${precio.toLocaleString('es-HN')}`;
  return `${WA_BASE}${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

/* Abre WhatsApp directo al número principal sin producto */
function abrirWhatsAppGeneral() {
  const mensaje = 'Hola, me gustaría recibir información sobre sus productos.';
  window.open(`${WA_BASE}${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`, '_blank');
}
