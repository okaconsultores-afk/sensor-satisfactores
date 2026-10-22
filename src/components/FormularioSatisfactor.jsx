import { useState } from 'react';
import { CATEGORIAS, DESCRIPCION_CATEGORIA, NECESIDADES, TIPOS, validarImpactos } from '../maxneef.js';

const VACIO = { nombre: '', categoria: 'Ser', impactos: {} };

const desdeSatisfactor = (s) => ({
  nombre: s.nombre,
  categoria: s.categoria,
  impactos: Object.fromEntries(s.impactos.map((i) => [i.necesidad, i.tipo])),
});

/**
 * Formulario para registrar un satisfactor nuevo o, si recibe `inicial`, editar uno existente.
 * El componente padre lo vuelve a montar (prop `key`) al cambiar de satisfactor.
 */
export default function FormularioSatisfactor({ inicial, onGuardar, onCancelar }) {
  const editando = !!inicial;
  const [datos, setDatos] = useState(() => (inicial ? desdeSatisfactor(inicial) : VACIO));
  const [errores, setErrores] = useState({});
  const [nota, setNota] = useState('');
  const [ayudaTipo, setAyudaTipo] = useState(null); // definición abierta por toque o teclado

  const cambiar = (campo, valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const necesidadSingular = NECESIDADES.find((n) => datos.impactos[n] === 'singular');

  const asignarTipo = (nec, tipo) => {
    const actuales = datos.impactos;
    let siguientes;
    if (actuales[nec] === tipo) {
      // Pulsar el tipo activo lo quita
      siguientes = { ...actuales };
      delete siguientes[nec];
      setNota('');
    } else if (tipo === 'singular') {
      // Singular atiende una sola necesidad: reemplaza las demás
      const otras = Object.keys(actuales).filter((n) => n !== nec);
      siguientes = { [nec]: 'singular' };
      setNota(otras.length ? `Se quitaron ${otras.join(', ')}: un satisfactor Singular atiende una sola necesidad.` : '');
    } else {
      siguientes = { ...actuales, [nec]: tipo };
      setNota('');
    }
    cambiar('impactos', siguientes);
  };

  const enviar = (ev) => {
    ev.preventDefault();
    const impactos = NECESIDADES.filter((n) => datos.impactos[n]).map((n) => ({ necesidad: n, tipo: datos.impactos[n] }));
    const nuevos = {};
    if (!datos.nombre.trim()) nuevos.nombre = 'Escriba el nombre o una descripción breve del satisfactor.';
    const errorImpactos = validarImpactos(impactos);
    if (errorImpactos) nuevos.impactos = errorImpactos;
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    onGuardar({ nombre: datos.nombre.trim(), categoria: datos.categoria, impactos });
    setNota('');
    if (editando) return;
    // Se conserva la categoría para agilizar registros consecutivos similares
    setDatos((d) => ({ ...VACIO, categoria: d.categoria }));
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sat-nombre" className="etiqueta">
          Satisfactor
        </label>
        <input
          id="sat-nombre"
          className="campo"
          placeholder="Ej.: Talleres de co-creación lúdica"
          value={datos.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          aria-invalid={!!errores.nombre}
        />
        {errores.nombre && <p className="text-xs text-rojo">{errores.nombre}</p>}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="etiqueta mb-1.5">Categorizado como forma de:</legend>
        <div className="grid grid-cols-4 gap-1 rounded-md bg-papel p-1">
          {CATEGORIAS.map((c, i) => (
            <label key={c} className="group relative cursor-pointer">
              <input
                type="radio"
                name="sat-categoria"
                id={`sat-cat-${c}`}
                value={c}
                checked={datos.categoria === c}
                onChange={() => cambiar('categoria', c)}
                className="peer sr-only"
              />
              <span className="block rounded px-2 py-1.5 text-center text-sm text-marino-500 transition peer-checked:bg-white peer-checked:font-semibold peer-checked:text-marino peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-naranja">
                {c}
              </span>
              {/* Ayuda emergente al pasar el cursor o enfocar con el teclado */}
              <span
                role="tooltip"
                className={`pointer-events-none absolute bottom-full z-20 mb-2 hidden w-52 rounded-md bg-marino px-3 py-2 text-xs leading-snug text-white shadow-lg group-hover:block group-focus-within:block ${
                  i === 0 ? 'left-0' : i === CATEGORIAS.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                }`}
              >
                <strong className="font-semibold uppercase tracking-wide">{c}:</strong> {DESCRIPCION_CATEGORIA[c]}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-marino-500">
          <strong className="font-semibold uppercase text-marino-700">{datos.categoria}:</strong>{' '}
          {DESCRIPCION_CATEGORIA[datos.categoria]}
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="etiqueta mb-1">Cómo opera en cada necesidad</legend>
        <p className="text-xs leading-relaxed text-marino-500">
          Marque el tipo de satisfactor en cada necesidad que impacta; deje en blanco las demás. Pulse de nuevo un tipo
          para quitarlo.
        </p>
        <ul className="grid grid-cols-2 gap-1.5" aria-label="Tipos de satisfactor">
          {TIPOS.map((t, i) => {
            const abierta = ayudaTipo === t.id;
            return (
              <li key={t.id} className="group relative">
                <button
                  type="button"
                  id={`ayuda-tipo-${t.id}`}
                  aria-expanded={abierta}
                  aria-describedby={`def-tipo-${t.id}`}
                  onClick={() => setAyudaTipo(abierta ? null : t.id)}
                  onBlur={() => setAyudaTipo((a) => (a === t.id ? null : a))}
                  className="flex w-full items-center gap-1.5 rounded-full border border-linea bg-white py-1 pl-1 pr-2 text-left text-[11px] font-medium text-marino-700 transition hover:border-marino-300"
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-semibold text-white"
                    style={{ background: t.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t.nombre}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-marino-300 font-serif text-[9px] italic leading-none text-marino-500"
                  >
                    i
                  </span>
                </button>
                {/* Definición emergente: al pasar el cursor, o al tocar el tipo en el celular */}
                <div
                  id={`def-tipo-${t.id}`}
                  role="tooltip"
                  className={`pointer-events-none absolute bottom-full z-20 mb-2 w-64 max-w-[calc(100vw-3rem)] overflow-hidden rounded-lg bg-marino text-white shadow-xl group-hover:block ${
                    abierta ? 'block' : 'hidden'
                  } ${i % 2 === 0 ? 'left-0' : 'right-0'}`}
                >
                  <div className="h-1" style={{ background: t.color }} />
                  <div className="flex flex-col gap-1.5 px-3 py-2.5">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] text-white ring-1 ring-white/50"
                        style={{ background: t.color }}
                      >
                        {i + 1}
                      </span>
                      {t.nombre}
                    </p>
                    <p className="text-xs leading-relaxed text-white/90">{t.descripcion}</p>
                    <p className="border-t border-white/15 pt-1.5 text-[11px] leading-snug text-white/70">
                      <span className="font-semibold text-white/85">Ejemplo:</span> {t.ejemplo}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-[11px] text-marino-300">Pase el cursor o toque cada tipo para ver su definición.</p>

        <div className="mt-1 flex flex-col divide-y divide-linea/70 rounded-md border border-linea bg-white">
          {NECESIDADES.map((nec) => {
            const actual = datos.impactos[nec];
            const bloqueada = necesidadSingular && necesidadSingular !== nec;
            return (
              <div
                key={nec}
                role="group"
                aria-label={`Tipo de satisfactor para ${nec}`}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 ${bloqueada ? 'opacity-40' : ''}`}
              >
                <span className={`min-w-0 truncate text-sm ${actual ? 'font-semibold' : 'text-marino-700'}`}>{nec}</span>
                <span className="flex shrink-0 gap-1">
                  {TIPOS.map((t, i) => {
                    const activo = actual === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        id={`sat-${nec}-${t.id}`}
                        disabled={bloqueada}
                        onClick={() => asignarTipo(nec, t.id)}
                        aria-pressed={activo}
                        title={`${nec}: ${t.nombre}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[11px] font-semibold transition disabled:cursor-not-allowed"
                        style={
                          activo
                            ? { background: t.color, borderColor: t.color, color: '#fff' }
                            : { borderColor: '#E3E0DA', color: t.color, background: '#fff' }
                        }
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </span>
              </div>
            );
          })}
        </div>
        {necesidadSingular && (
          <p className="text-xs leading-relaxed text-marino-500">
            Singular en {necesidadSingular}: este satisfactor atiende una sola necesidad. Quite el tipo Singular para marcar
            otras.
          </p>
        )}
        {nota && <p className="text-xs leading-relaxed text-cafe">{nota}</p>}
        {errores.impactos && <p className="text-xs text-rojo">{errores.impactos}</p>}
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-marino px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-marino-700"
        >
          {editando ? 'Guardar cambios' : 'Agregar satisfactor'}
        </button>
        {editando && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-md border border-linea px-4 py-2.5 text-sm font-medium text-marino-700 hover:border-marino-300"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
