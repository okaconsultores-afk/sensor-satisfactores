import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const nombreArchivo = (ext) => `sensor-satisfactores-${new Date().toISOString().slice(0, 10)}.${ext}`;

async function capturar(elemento) {
  return html2canvas(elemento, {
    scale: 2,
    backgroundColor: '#FFFFFF',
    useCORS: true,
    windowWidth: Math.max(elemento.scrollWidth, 1200),
  });
}

/** Genera un PDF A4 con la captura del informe, repartida en páginas si es necesario. */
export async function descargarPDF(elemento) {
  const canvas = await capturar(elemento);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margen = 10;
  const anchoUtil = pdf.internal.pageSize.getWidth() - margen * 2;
  const altoUtil = pdf.internal.pageSize.getHeight() - margen * 2;
  const pxPorMm = canvas.width / anchoUtil;
  const altoPaginaPx = Math.floor(altoUtil * pxPorMm);

  for (let y = 0, pagina = 0; y < canvas.height; y += altoPaginaPx, pagina++) {
    const alto = Math.min(altoPaginaPx, canvas.height - y);
    const trozo = document.createElement('canvas');
    trozo.width = canvas.width;
    trozo.height = alto;
    trozo.getContext('2d').drawImage(canvas, 0, y, canvas.width, alto, 0, 0, canvas.width, alto);
    if (pagina > 0) pdf.addPage();
    pdf.addImage(trozo.toDataURL('image/jpeg', 0.92), 'JPEG', margen, margen, anchoUtil, alto / pxPorMm);
  }
  pdf.save(nombreArchivo('pdf'));
}

export async function descargarPNG(elemento) {
  const canvas = await capturar(elemento);
  descargar(canvas.toDataURL('image/png'), nombreArchivo('png'));
}

export function descargarJSON(datos) {
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  descargar(url, nombreArchivo('json').replace('informe', 'estudio'));
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function descargar(href, nombre) {
  const a = document.createElement('a');
  a.href = href;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
