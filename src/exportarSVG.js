import { NECESIDADES, TIPOS, TIPO_POR_ID } from './maxneef.js';

// Exportación vectorial (SVG). El texto queda como texto editable y el gráfico conserva sus formas,
// así que el archivo se puede abrir y ajustar en Inkscape, Illustrator, Figma o un navegador.

const ANCHO = 1100;
const MARGEN = 48;
const UTIL = ANCHO - MARGEN * 2;
const FUENTE_TEXTO = "'IBM Plex Sans', Helvetica, Arial, sans-serif";
const FUENTE_TITULO = "'Bricolage Grotesque', 'IBM Plex Sans', Helvetica, Arial, sans-serif";
const FUENTE_DATOS = "'IBM Plex Mono', Menlo, Consolas, monospace";
const C = { marino: '#16213A', gris: '#4A5672', claro: '#8C94A8', linea: '#E3E0DA', papel: '#F5F4F1' };

const esc = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Parte un texto en líneas según un ancho aproximado (no hay medición de texto en SVG estático). */
function partir(texto, anchoPx, tamano) {
  const maxCar = Math.max(8, Math.floor(anchoPx / (tamano * 0.53)));
  const lineas = [];
  for (const parrafo of String(texto).split('\n')) {
    let actual = '';
    for (const palabra of parrafo.split(/\s+/).filter(Boolean)) {
      if (actual && (actual + ' ' + palabra).length > maxCar) {
        lineas.push(actual);
        actual = palabra;
      } else actual = actual ? `${actual} ${palabra}` : palabra;
    }
    lineas.push(actual);
  }
  return lineas;
}

function texto(x, y, contenido, { tam = 14, peso = 400, color = C.marino, fuente = FUENTE_TEXTO, ancla = 'start', extra = '' } = {}) {
  return `<text x="${x}" y="${y}" font-family="${esc(fuente)}" font-size="${tam}" font-weight="${peso}" fill="${color}" text-anchor="${ancla}"${extra}>${esc(contenido)}</text>`;
}

function parrafo(x, y, lineas, opciones, interlineado) {
  return lineas.map((l, i) => texto(x, y + i * interlineado, l, opciones)).join('');
}

/**
 * Copia el SVG del gráfico en pantalla y lo deja autónomo: convierte las posiciones definidas con
 * CSS (que muchos editores vectoriales ignoran) en atributos `transform`.
 */
export function graficoAutonomo(svgEnPantalla) {
  const copia = svgEnPantalla.cloneNode(true);
  copia.removeAttribute('class');
  copia.querySelectorAll('[style]').forEach((el) => {
    const m = /translate\(\s*([-\d.]+)px,\s*([-\d.]+)px\s*\)/.exec(el.getAttribute('style'));
    if (m) el.setAttribute('transform', `translate(${m[1]} ${m[2]})`);
    el.removeAttribute('style');
  });
  return copia;
}

async function logoComoDataURL() {
  try {
    const resp = await fetch('./icon-192x192.PNG');
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise((ok, falla) => {
      const lector = new FileReader();
      lector.onload = () => ok(lector.result);
      lector.onerror = falla;
      lector.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Solo el gráfico de anillos, con su leyenda, como archivo SVG. */
export function svgSoloGrafico(svgEnPantalla) {
  const g = graficoAutonomo(svgEnPantalla);
  const [, , w, h] = (g.getAttribute('viewBox') || '0 0 640 548').split(/\s+/).map(Number);
  // En el ancho del gráfico la leyenda va en dos filas
  const altoLeyenda = 64;
  const leyenda = leyendaTipos(20, h + 22, w - 40, ITEMS_LEYENDA.slice(0, 3)) + leyendaTipos(20, h + 46, w - 40, ITEMS_LEYENDA.slice(3));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + altoLeyenda}" viewBox="0 0 ${w} ${h + altoLeyenda}">
<rect width="100%" height="100%" fill="#FFFFFF"/>
<g id="grafico-anillos">${g.innerHTML}</g>
${leyenda}
</svg>`;
}

// Leyenda centrada en el ancho dado; cada elemento ocupa según el largo de su texto
const ITEMS_LEYENDA = [...TIPOS.map((t, i) => ({ etiqueta: `${i + 1} ${t.nombre}`, color: t.color })), { etiqueta: 'Empate', hueco: true }];

function leyendaTipos(x, y, ancho, items = ITEMS_LEYENDA) {
  const anchos = items.map((it) => 16 + it.etiqueta.length * 6.6 + 18);
  let cx = x + Math.max(0, (ancho - anchos.reduce((a, b) => a + b, 0)) / 2) + 6;
  return `<g class="leyenda">${items
    .map((it, i) => {
      const punto = it.hueco
        ? `<circle cx="${cx}" cy="${y - 4}" r="5" fill="#FFFFFF" stroke="${C.gris}" stroke-width="2"/>`
        : `<circle cx="${cx}" cy="${y - 4}" r="5" fill="${it.color}"/>`;
      const salida = punto + texto(cx + 10, y, it.etiqueta, { tam: 12, color: C.marino });
      cx += anchos[i];
      return salida;
    })
    .join('')}</g>`;
}

/** Informe completo: encabezado, problema, gráfico, tabla de frecuencias y registro. */
export async function svgInforme({ svgEnPantalla, problema, satisfactores, frecuencias, predominancia, fecha }) {
  const partes = [];
  let y = MARGEN;

  // Encabezado
  const logo = await logoComoDataURL();
  const xTitulo = logo ? MARGEN + 84 : MARGEN;
  if (logo) partes.push(`<image href="${logo}" xlink:href="${logo}" x="${MARGEN}" y="${y}" width="68" height="68"/>`);
  partes.push(texto(xTitulo, y + 30, 'Sensor de satisfactores-necesidades', { tam: 28, peso: 700, fuente: FUENTE_TITULO }));
  partes.push(texto(xTitulo, y + 56, `Diseño Participativo orientado a la satisfacción · ${fecha}`, { tam: 14, color: C.gris }));
  y += 84;
  partes.push(
    `<rect x="${MARGEN}" y="${y}" width="${UTIL / 3}" height="4" fill="#E8863A"/><rect x="${MARGEN + UTIL / 3}" y="${y}" width="${UTIL / 3}" height="4" fill="#D04C3B"/><rect x="${MARGEN + (2 * UTIL) / 3}" y="${y}" width="${UTIL / 3}" height="4" fill="#A0614E"/>`
  );
  y += 40;

  // Problema de investigación
  partes.push(texto(MARGEN, y, 'PROBLEMA DE INVESTIGACIÓN', { tam: 11, peso: 600, color: C.gris, extra: ' letter-spacing="1"' }));
  y += 28;
  const lineasProblema = partir(problema || 'Sin problema definido.', UTIL, 19);
  partes.push(parrafo(MARGEN, y, lineasProblema, { tam: 19, peso: 600, fuente: FUENTE_TITULO }, 27));
  y += (lineasProblema.length - 1) * 27 + 26;
  const conDatos = NECESIDADES.filter((n) => frecuencias[n].total > 0).length;
  partes.push(texto(MARGEN, y, `${satisfactores.length} satisfactores registrados · ${conDatos} de 9 necesidades con datos`, { tam: 13, color: C.gris }));
  y += 44;

  // Gráfico
  partes.push(texto(MARGEN, y, 'Tipo predominante por necesidad', { tam: 18, peso: 600, fuente: FUENTE_TITULO }));
  y += 16;
  const g = graficoAutonomo(svgEnPantalla);
  const [, , gw, gh] = (g.getAttribute('viewBox') || '0 0 640 548').split(/\s+/).map(Number);
  const escala = 680 / gw;
  partes.push(`<g id="grafico-anillos" transform="translate(${(ANCHO - gw * escala) / 2} ${y}) scale(${escala})">${g.innerHTML}</g>`);
  y += gh * escala + 26;
  partes.push(leyendaTipos(MARGEN, y, UTIL));
  y += 26;
  const nota = partir(
    'Los anillos son una convención de lectura ordinal (del centro hacia afuera: Destructor a Sinérgico), no una escala de valor ni de cantidad; no se suman ni se promedian. Cada punto marca el tipo que más se repite en esa necesidad; un punto hueco indica empate. Las frecuencias exactas están en la tabla.',
    UTIL,
    12
  );
  partes.push(parrafo(MARGEN, y, nota, { tam: 12, color: C.gris }, 17));
  y += nota.length * 17 + 36;

  // Tabla de frecuencias
  partes.push(texto(MARGEN, y, 'Frecuencias por necesidad', { tam: 18, peso: 600, fuente: FUENTE_TITULO }));
  y += 30;
  const colNec = 150;
  const colTipo = 108;
  const colTotal = 64;
  const xTipo = (i) => MARGEN + colNec + i * colTipo + colTipo / 2;
  const xTotal = MARGEN + colNec + TIPOS.length * colTipo + colTotal / 2;
  const xPred = MARGEN + colNec + TIPOS.length * colTipo + colTotal + 12;
  partes.push(texto(MARGEN, y + 18, 'NECESIDAD', { tam: 10, peso: 600, color: C.gris, extra: ' letter-spacing="1"' }));
  TIPOS.forEach((t, i) => {
    partes.push(`<rect x="${xTipo(i) - 12}" y="${y}" width="24" height="5" rx="2.5" fill="${t.color}"/>`);
    partes.push(texto(xTipo(i), y + 22, `${i + 1}. ${t.nombre}`, { tam: 10.5, peso: 600, ancla: 'middle' }));
  });
  partes.push(texto(xTotal, y + 18, 'TOTAL', { tam: 10, peso: 600, color: C.gris, ancla: 'middle', extra: ' letter-spacing="1"' }));
  partes.push(texto(xPred, y + 18, 'PREDOMINANTE', { tam: 10, peso: 600, color: C.gris, extra: ' letter-spacing="1"' }));
  y += 32;
  partes.push(`<line x1="${MARGEN}" y1="${y}" x2="${ANCHO - MARGEN}" y2="${y}" stroke="${C.linea}"/>`);
  const alto = 30;
  for (const nec of NECESIDADES) {
    const fila = frecuencias[nec];
    const pred = predominancia[nec];
    const yt = y + 20;
    partes.push(texto(MARGEN, yt, nec, { tam: 13, peso: 500 }));
    TIPOS.forEach((t, i) => {
      const v = fila[t.id];
      if (pred.includes(t.id)) {
        partes.push(`<rect x="${xTipo(i) - 15}" y="${y + 5}" width="30" height="21" rx="4" fill="${t.color}"/>`);
        partes.push(texto(xTipo(i), yt, v, { tam: 12, peso: 600, color: '#FFFFFF', fuente: FUENTE_DATOS, ancla: 'middle' }));
      } else {
        partes.push(texto(xTipo(i), yt, v || '·', { tam: 12, color: v ? C.marino : C.claro, fuente: FUENTE_DATOS, ancla: 'middle' }));
      }
    });
    partes.push(texto(xTotal, yt, fila.total || '·', { tam: 12, peso: 600, fuente: FUENTE_DATOS, ancla: 'middle' }));
    const etiquetaPred = pred.length === 0 ? 'Sin datos' : pred.map((id) => TIPO_POR_ID[id].nombre).join(' / ') + (pred.length > 1 ? ' (empate)' : '');
    partes.push(texto(xPred, yt, etiquetaPred, { tam: 12, color: pred.length ? C.marino : C.claro }));
    y += alto;
    partes.push(`<line x1="${MARGEN}" y1="${y}" x2="${ANCHO - MARGEN}" y2="${y}" stroke="${C.linea}"/>`);
  }
  partes.push(`<line x1="${MARGEN}" y1="${y}" x2="${ANCHO - MARGEN}" y2="${y}" stroke="${C.marino}" stroke-width="2"/>`);
  const totalTipo = (id) => NECESIDADES.reduce((a, n) => a + frecuencias[n][id], 0);
  partes.push(texto(MARGEN, y + 20, 'TOTAL', { tam: 10, peso: 600, color: C.gris, extra: ' letter-spacing="1"' }));
  TIPOS.forEach((t, i) =>
    partes.push(texto(xTipo(i), y + 20, totalTipo(t.id) || '·', { tam: 12, peso: 600, fuente: FUENTE_DATOS, ancla: 'middle' }))
  );
  partes.push(
    texto(xTotal, y + 20, NECESIDADES.reduce((a, n) => a + frecuencias[n].total, 0) || '·', { tam: 12, peso: 600, fuente: FUENTE_DATOS, ancla: 'middle' })
  );
  y += 64;

  // Registro de satisfactores
  partes.push(texto(MARGEN, y, 'Registro de satisfactores', { tam: 18, peso: 600, fuente: FUENTE_TITULO }));
  y += 30;
  const xNombre = MARGEN + 34;
  const xCat = MARGEN + 340;
  const xImp = MARGEN + 440;
  ['#', 'SATISFACTOR', 'FORMA DE', 'NECESIDAD Y TIPO'].forEach((h, i) =>
    partes.push(texto([MARGEN, xNombre, xCat, xImp][i], y, h, { tam: 10, peso: 600, color: C.gris, extra: ' letter-spacing="1"' }))
  );
  y += 10;
  partes.push(`<line x1="${MARGEN}" y1="${y}" x2="${ANCHO - MARGEN}" y2="${y}" stroke="${C.linea}"/>`);
  if (satisfactores.length === 0) {
    partes.push(texto(MARGEN, y + 26, 'Sin satisfactores registrados.', { tam: 13, color: C.gris }));
    y += 40;
  }
  satisfactores.forEach((s, idx) => {
    const lNombre = partir(s.nombre, xCat - xNombre - 16, 13);
    // Cada impacto en su propia línea, con el punto del color de su tipo
    const filas = Math.max(lNombre.length, s.impactos.length);
    const yt = y + 22;
    partes.push(texto(MARGEN, yt, idx + 1, { tam: 11, color: C.gris, fuente: FUENTE_DATOS }));
    partes.push(parrafo(xNombre, yt, lNombre, { tam: 13, peso: 500 }, 19));
    partes.push(texto(xCat, yt, s.categoria.toUpperCase(), { tam: 12, color: C.gris }));
    s.impactos.forEach(({ necesidad, tipo }, i) => {
      partes.push(`<circle cx="${xImp + 4}" cy="${yt - 4 + i * 19}" r="4" fill="${TIPO_POR_ID[tipo].color}"/>`);
      partes.push(texto(xImp + 14, yt + i * 19, `${necesidad} · ${TIPO_POR_ID[tipo].nombre}`, { tam: 12 }));
    });
    y += filas * 19 + 16;
    partes.push(`<line x1="${MARGEN}" y1="${y}" x2="${ANCHO - MARGEN}" y2="${y}" stroke="${C.linea}"/>`);
  });
  y += MARGEN;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${ANCHO}" height="${Math.ceil(y)}" viewBox="0 0 ${ANCHO} ${Math.ceil(y)}">
<title>Sensor de satisfactores-necesidades</title>
<rect width="100%" height="100%" fill="#FFFFFF"/>
${partes.join('\n')}
</svg>`;
}

export function descargarSVG(contenido, nombre) {
  const blob = new Blob([contenido], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
