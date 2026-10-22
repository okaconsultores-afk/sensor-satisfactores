import { useEffect, useMemo, useRef, useState } from 'react';
import Asesoria from './components/Asesoria.jsx';
import FormularioSatisfactor from './components/FormularioSatisfactor.jsx';
import GraficoFlotante from './components/GraficoFlotante.jsx';
import GraficoPolar from './components/GraficoPolar.jsx';
import TablaFrecuencias from './components/TablaFrecuencias.jsx';
import TablaRegistro from './components/TablaRegistro.jsx';
import { EJEMPLO, EJEMPLO_PROBLEMA, NECESIDADES, TIPOS, calcularFrecuencias, calcularPredominancia, normalizarSatisfactor } from './maxneef.js';

const CLAVE = 'evaluador-max-neef:v1';
const CLAVE_MINIMIZADO = 'evaluador-max-neef:grafico-minimizado';
const nuevoId = () => Math.random().toString(36).slice(2, 10);

function estadoInicial() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado && Array.isArray(guardado.satisfactores)) return { ...normalizar(guardado), ejemplo: !!guardado.ejemplo };
  } catch {
    /* sin almacenamiento disponible o datos dañados */
  }
  return cargarEjemplo();
}

function cargarEjemplo() {
  return {
    problema: EJEMPLO.problema,
    satisfactores: EJEMPLO.satisfactores.map((s) => ({ ...s, id: nuevoId() })),
    ejemplo: true,
  };
}

// Valida un estudio guardado o importado (.json), incluido el formato de la primera versión.
function normalizar(datos) {
  if (!datos || !Array.isArray(datos.satisfactores)) throw new Error('formato');
  return {
    problema: String(datos.problema ?? ''),
    ejemplo: false,
    satisfactores: datos.satisfactores
      .map(normalizarSatisfactor)
      .filter(Boolean)
      .map((s) => ({ ...s, id: nuevoId() })),
  };
}

export default function App() {
  const [estado, setEstado] = useState(estadoInicial);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);
  const [exportando, setExportando] = useState(null);
  const [aviso, setAviso] = useState('');
  const [mostrarAreas, setMostrarAreas] = useState(true);
  const [resaltado, setResaltado] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const informeRef = useRef(null);
  const formularioRef = useRef(null);
  const graficoRef = useRef(null);
  const [graficoEnPantalla, setGraficoEnPantalla] = useState(true);
  const [flotanteMinimizado, setFlotanteMinimizado] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_MINIMIZADO) === '1';
    } catch {
      return false;
    }
  });

  // El gráfico flotante aparece cuando el gráfico principal deja de verse
  useEffect(() => {
    const el = graficoRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entrada]) => setGraficoEnPantalla(entrada.isIntersecting), {
      threshold: 0.2,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const minimizarFlotante = (valor) => {
    setFlotanteMinimizado(valor);
    try {
      localStorage.setItem(CLAVE_MINIMIZADO, valor ? '1' : '0');
    } catch {
      /* sin almacenamiento disponible */
    }
  };
  const archivoRef = useRef(null);

  const { problema, satisfactores, ejemplo } = estado;

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [estado]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(''), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const frecuencias = useMemo(() => calcularFrecuencias(satisfactores), [satisfactores]);
  const predominancia = useMemo(() => calcularPredominancia(frecuencias), [frecuencias]);
  const editando = satisfactores.find((s) => s.id === editandoId) ?? null;
  const necesidadesConDatos = NECESIDADES.filter((n) => frecuencias[n].total > 0).length;
  const empates = NECESIDADES.filter((n) => predominancia[n].length > 1);

  const actualizar = (cambios) => setEstado((e) => ({ ...e, ...cambios }));
  const agregar = (s) =>
    setEstado((e) => ({ ...e, satisfactores: [...e.satisfactores, { ...s, id: nuevoId() }] }));
  const guardarEdicion = (cambios) => {
    setEstado((e) => ({
      ...e,
      satisfactores: e.satisfactores.map((s) => (s.id === editandoId ? { ...s, ...cambios } : s)),
    }));
    setEditandoId(null);
    setAviso('Cambios guardados.');
  };
  const empezarEdicion = (id) => {
    setEditandoId(id);
    formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const eliminar = (id) => {
    setEstado((e) => ({ ...e, satisfactores: e.satisfactores.filter((s) => s.id !== id) }));
    setResaltado(null);
  };

  const exportar = async (formato) => {
    setExportando(formato);
    // Espera un cuadro para que aparezca el encabezado del informe antes de capturar
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      // Las librerías de exportación se cargan solo cuando se necesitan
      const { descargarPDF, descargarPNG } = await import('./exportar.js');
      await (formato === 'pdf' ? descargarPDF : descargarPNG)(informeRef.current);
      setAviso(formato === 'pdf' ? 'Informe PDF descargado.' : 'Imagen PNG descargada.');
    } catch (err) {
      console.error(err);
      setAviso('No se pudo generar el archivo. Intente de nuevo o use otro navegador.');
    } finally {
      setExportando(null);
    }
  };

  const importar = async (ev) => {
    const archivo = ev.target.files?.[0];
    ev.target.value = '';
    if (!archivo) return;
    try {
      setEstado(normalizar(JSON.parse(await archivo.text())));
      setAviso('Estudio cargado.');
    } catch {
      setAviso('El archivo no es un estudio válido de este evaluador (.json).');
    }
  };

  const fecha = new Date().toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen">
      {/* Encabezado */}
      <header className="border-b border-linea bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-[1_1_280px] items-center gap-4">
            <img src="./icon-192x192.PNG" alt="Logo Grupo de Investigación" className="h-14 w-14 shrink-0 object-contain" />
            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                Sensor de satisfactores-necesidades
              </h1>
              <p className="text-sm text-marino-500">Diseño Participativo orientado a la satisfacción</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#asesoria"
              onClick={(ev) => {
                ev.preventDefault();
                document.getElementById('asesoria')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.getElementById('ase-nombre')?.focus({ preventScroll: true });
              }}
              className="rounded-md px-3 py-2 text-sm font-medium text-marino-700 underline-offset-4 transition hover:underline"
            >
              Solicitar asesoría
            </a>
            <button
              type="button"
              onClick={() => exportar('png')}
              disabled={!!exportando}
              className="rounded-md border border-linea px-3 py-2 text-sm font-medium text-marino-700 transition hover:border-marino-300 disabled:opacity-50"
            >
              {exportando === 'png' ? 'Generando…' : 'Imagen PNG'}
            </button>
            <button
              type="button"
              onClick={() => exportar('pdf')}
              disabled={!!exportando}
              className="rounded-md bg-rojo px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#B9402F] disabled:opacity-50"
            >
              {exportando === 'pdf' ? 'Generando…' : 'Descargar informe'}
            </button>
          </div>
        </div>
        <div className="flex h-1" aria-hidden="true">
          <span className="flex-1 bg-naranja" />
          <span className="flex-1 bg-rojo" />
          <span className="flex-1 bg-cafe" />
        </div>
      </header>

      <div
        className={`mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] ${
          !graficoEnPantalla && !flotanteMinimizado ? 'pb-[22rem]' : 'pb-6'
        }`}
      >
        {/* Panel de entrada */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <section className="flex flex-col gap-2">
            <label htmlFor="problema" className="etiqueta">
              Problema o pregunta de investigación
            </label>
            <textarea
              id="problema"
              rows={4}
              className="campo resize-y leading-relaxed"
              placeholder={`Ej.: ${EJEMPLO_PROBLEMA}`}
              value={problema}
              onChange={(e) => actualizar({ problema: e.target.value })}
            />
          </section>

          <section ref={formularioRef} className={`panel scroll-mt-4 p-4 ${editando ? 'border-naranja ring-2 ring-naranja/30' : ''}`}>
            <h2 className="mb-4 font-display text-lg font-semibold">
              {editando ? `Editar satisfactor ${satisfactores.indexOf(editando) + 1}` : 'Registrar satisfactor'}
            </h2>
            <FormularioSatisfactor
              key={editando?.id ?? 'nuevo'}
              inicial={editando}
              onGuardar={editando ? guardarEdicion : agregar}
              onCancelar={() => setEditandoId(null)}
            />
          </section>

          <section className="flex flex-col gap-2">
            <span className="etiqueta block">Datos del estudio</span>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={async () => {
                  const { descargarJSON } = await import('./exportar.js');
                  descargarJSON({ problema, satisfactores: satisfactores.map(({ id, ...s }) => s) });
                }}
                className="rounded-md border border-linea bg-white px-3 py-1.5 font-medium text-marino-700 hover:border-marino-300"
              >
                Guardar .json
              </button>
              <button
                type="button"
                onClick={() => archivoRef.current?.click()}
                className="rounded-md border border-linea bg-white px-3 py-1.5 font-medium text-marino-700 hover:border-marino-300"
              >
                Abrir .json
              </button>
              <input ref={archivoRef} id="abrir-json" type="file" accept="application/json,.json" className="hidden" onChange={importar} />
              {confirmarVaciar ? (
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEstado({ problema: '', satisfactores: [], ejemplo: false });
                      setConfirmarVaciar(false);
                    }}
                    className="rounded-md bg-rojo px-3 py-1.5 font-semibold text-white"
                  >
                    Sí, borrar todo
                  </button>
                  <button type="button" onClick={() => setConfirmarVaciar(false)} className="px-2 py-1.5 text-marino-500">
                    Cancelar
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmarVaciar(true)}
                  className="rounded-md px-3 py-1.5 font-medium text-marino-500 hover:text-rojo"
                >
                  Vaciar
                </button>
              )}
            </div>
            <p className="text-xs leading-relaxed text-marino-500">
              Los datos se guardan solo en este navegador. Use “Guardar .json” para conservarlos o compartirlos.
            </p>
          </section>

          <section id="asesoria" className="panel scroll-mt-4 p-4">
            <h2 className="mb-3 font-display text-lg font-semibold">Solicitar asesoría</h2>
            <Asesoria problema={problema} />
          </section>
        </aside>

        {/* Área de visualización (es lo que se exporta) */}
        <main ref={informeRef} className="flex min-w-0 flex-col gap-6 bg-papel">
          {ejemplo && !exportando && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-naranja/40 bg-naranja/10 px-4 py-3 text-sm">
              <span>
                <strong className="font-semibold">Datos de ejemplo.</strong> Muestran cómo se lee el gráfico; reemplácelos por los de su estudio.
              </span>
              <button
                type="button"
                onClick={() => setEstado({ problema: '', satisfactores: [], ejemplo: false })}
                className="rounded-md bg-marino px-3 py-1.5 text-xs font-semibold text-white"
              >
                Empezar en blanco
              </button>
            </div>
          )}

          {exportando && (
            <div className="flex items-center gap-4 border-b border-linea pb-4">
              <img src="./icon-192x192.PNG" alt="" className="h-16 w-16 object-contain" />
              <div>
                <p className="font-display text-2xl font-bold">Sensor de satisfactores-necesidades</p>
                <p className="text-sm text-marino-500">Diseño Participativo orientado a la satisfacción · {fecha}</p>
              </div>
            </div>
          )}

          <section>
            <span className="etiqueta block">Problema de investigación</span>
            <p className={`mt-1 max-w-[75ch] font-display text-lg leading-snug sm:text-xl ${problema ? '' : 'text-marino-300'}`}>
              {problema || 'Sin problema definido todavía.'}
            </p>
            <p className="num mt-2 text-sm text-marino-500">
              {satisfactores.length} satisfactores registrados · {necesidadesConDatos} de 9 necesidades con datos
            </p>
          </section>

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <section ref={graficoRef} className="panel flex scroll-mt-4 flex-col p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">Tipo predominante por necesidad</h2>
                <label htmlFor="mostrar-areas" className="flex cursor-pointer items-center gap-2 text-sm text-marino-700" data-html2canvas-ignore>
                  <input
                    id="mostrar-areas"
                    type="checkbox"
                    checked={mostrarAreas}
                    onChange={(e) => setMostrarAreas(e.target.checked)}
                    className="h-4 w-4 accent-marino"
                  />
                  Áreas por satisfactor
                </label>
              </div>
              <div className="flex justify-center py-2">
                <GraficoPolar
                  frecuencias={frecuencias}
                  predominancia={predominancia}
                  satisfactores={satisfactores}
                  mostrarAreas={mostrarAreas}
                  resaltado={resaltado}
                  onResaltar={setResaltado}
                />
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-linea pt-3 text-xs">
                {TIPOS.map((t, i) => (
                  <li key={t.id} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                    <span className="font-mono text-marino-500">{i + 1}</span> {t.nombre}
                  </li>
                ))}
                <li className="flex items-center gap-1.5 text-marino-500">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-marino-500 bg-white" /> Empate
                </li>
                {mostrarAreas && (
                  <li className="flex items-center gap-1.5 text-marino-500">
                    <span className="h-2.5 w-3.5 rounded-sm border border-marino-300 bg-marino/10" /> Área de un satisfactor
                  </li>
                )}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-marino-500">
                Los anillos son una convención de lectura ordinal (del centro hacia afuera: Destructor a Sinérgico), no una
                escala de valor ni de cantidad; no se suman ni se promedian. Cada punto marca el tipo que más se repite en esa
                necesidad. Las frecuencias exactas están en la tabla.
                {mostrarAreas &&
                  ' Cada área sombreada une las necesidades que impacta un satisfactor, cada una en el anillo del tipo con que opera allí (con una o dos necesidades, el área parte del centro). Si opera igual en todas, el área toma el color de ese tipo; si combina tipos, es azul oscuro. Donde se superponen varias áreas, el tono se intensifica. Pase el cursor sobre un área o una fila del registro para resaltarla.'}
              </p>
            </section>

            <section className="panel flex flex-col gap-3 p-4 sm:p-5">
              <h2 className="font-display text-lg font-semibold">Frecuencias por necesidad</h2>
              <TablaFrecuencias frecuencias={frecuencias} predominancia={predominancia} />
              {empates.length > 0 && (
                <p className="text-xs leading-relaxed text-marino-500">
                  Empate en {empates.join(', ')}: dos o más tipos tienen la misma frecuencia máxima y se marcan todos con punto hueco.
                </p>
              )}
            </section>
          </div>

          <section className="panel flex flex-col gap-3 p-4 sm:p-5">
            <h2 className="font-display text-lg font-semibold">Registro de satisfactores</h2>
            <TablaRegistro
              satisfactores={satisfactores}
              onEliminar={eliminar}
              onEditar={empezarEdicion}
              editandoId={editandoId}
              resaltado={resaltado}
              onResaltar={setResaltado}
            />
          </section>
        </main>
      </div>

      {!graficoEnPantalla && !exportando && (
        <GraficoFlotante
          minimizado={flotanteMinimizado}
          onMinimizar={minimizarFlotante}
          onIrAlGrafico={() => graficoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <GraficoPolar
            frecuencias={frecuencias}
            predominancia={predominancia}
            satisfactores={satisfactores}
            mostrarAreas={mostrarAreas}
            resaltado={resaltado}
            onResaltar={setResaltado}
          />
        </GraficoFlotante>
      )}

      {aviso && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-md bg-marino px-4 py-2.5 text-sm text-white shadow-lg"
        >
          {aviso}
        </div>
      )}
    </div>
  );
}
