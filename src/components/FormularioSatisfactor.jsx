import { useState } from 'react';
import { CATEGORIAS, NECESIDADES, TIPOS } from '../maxneef.js';

const VACIO = { nombre: '', categoria: 'Ser', tipo: 'singular', necesidades: [] };

export default function FormularioSatisfactor({ onAgregar }) {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});

  const cambiar = (campo, valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const alternarNecesidad = (nec) =>
    cambiar(
      'necesidades',
      datos.necesidades.includes(nec)
        ? datos.necesidades.filter((n) => n !== nec)
        : NECESIDADES.filter((n) => n === nec || datos.necesidades.includes(n))
    );

  const enviar = (ev) => {
    ev.preventDefault();
    const nuevos = {};
    if (!datos.nombre.trim()) nuevos.nombre = 'Escriba el nombre o una descripción breve del satisfactor.';
    if (datos.necesidades.length === 0) nuevos.necesidades = 'Seleccione al menos una necesidad.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    onAgregar({ ...datos, nombre: datos.nombre.trim() });
    // Se conservan categoría y tipo para agilizar registros consecutivos similares
    setDatos((d) => ({ ...VACIO, categoria: d.categoria, tipo: d.tipo }));
  };

  const tipoActual = TIPOS.find((t) => t.id === datos.tipo);

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sat-nombre" className="etiqueta">
          Satisfactor
        </label>
        <input
          id="sat-nombre"
          className="campo"
          placeholder="Ej.: Huerta comunitaria autogestionada"
          value={datos.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          aria-invalid={!!errores.nombre}
        />
        {errores.nombre && <p className="text-xs text-rojo">{errores.nombre}</p>}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="etiqueta mb-1.5">Categoría existencial (formas de)</legend>
        <div className="grid grid-cols-4 gap-1 rounded-md bg-papel p-1">
          {CATEGORIAS.map((c) => (
            <label key={c} className="cursor-pointer">
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
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="etiqueta mb-1.5">Tipo de satisfactor</legend>
        <div className="flex flex-col gap-1">
          {TIPOS.map((t, i) => (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                datos.tipo === t.id ? 'border-marino/40 bg-white shadow-sm' : 'border-transparent hover:bg-white/70'
              }`}
            >
              <input
                type="radio"
                name="sat-tipo"
                id={`sat-tipo-${t.id}`}
                value={t.id}
                checked={datos.tipo === t.id}
                onChange={() => cambiar('tipo', t.id)}
                className="sr-only"
              />
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold text-white"
                style={{ background: t.color, opacity: datos.tipo === t.id ? 1 : 0.55 }}
              >
                {i + 1}
              </span>
              <span className={datos.tipo === t.id ? 'font-semibold' : 'text-marino-700'}>{t.nombre}</span>
            </label>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-marino-500">{tipoActual.descripcion}</p>
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="etiqueta mb-1.5">Necesidades que impacta</legend>
        <div className="flex flex-wrap gap-1.5">
          {NECESIDADES.map((nec) => {
            const activa = datos.necesidades.includes(nec);
            return (
              <label key={nec} className="cursor-pointer">
                <input
                  type="checkbox"
                  id={`sat-nec-${nec}`}
                  checked={activa}
                  onChange={() => alternarNecesidad(nec)}
                  className="peer sr-only"
                />
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-xs font-medium transition peer-focus-visible:ring-2 peer-focus-visible:ring-naranja ${
                    activa
                      ? 'border-marino bg-marino text-white'
                      : 'border-linea bg-white text-marino-700 hover:border-marino-300'
                  }`}
                >
                  {nec}
                </span>
              </label>
            );
          })}
        </div>
        {errores.necesidades && <p className="text-xs text-rojo">{errores.necesidades}</p>}
      </fieldset>

      <button
        type="submit"
        className="rounded-md bg-marino px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-marino-700"
      >
        Agregar satisfactor
      </button>
    </form>
  );
}
