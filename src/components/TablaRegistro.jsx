import { ChipTipo } from './TablaFrecuencias.jsx';

export default function TablaRegistro({ satisfactores, onEliminar, resaltado, onResaltar }) {
  if (satisfactores.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-linea px-4 py-8 text-center text-sm text-marino-500">
        Aún no hay satisfactores. Agregue el primero desde el formulario.
      </p>
    );
  }
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-linea text-left">
            <th className="py-2 pr-2 etiqueta">#</th>
            <th className="py-2 pr-3 etiqueta">Satisfactor</th>
            <th className="py-2 pr-3 etiqueta">Categoría</th>
            <th className="py-2 pr-3 etiqueta">Tipo</th>
            <th className="py-2 pr-3 etiqueta">Necesidades</th>
            <th className="py-2" data-html2canvas-ignore>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {satisfactores.map((s, i) => (
            <tr
              key={s.id}
              onMouseEnter={() => onResaltar?.(s.id)}
              onMouseLeave={() => onResaltar?.(null)}
              className={`border-b border-linea/70 align-top transition-colors last:border-0 ${
                resaltado === s.id ? 'bg-naranja/10' : ''
              }`}
            >
              <td className="num py-2.5 pr-2 font-mono text-xs text-marino-500">{i + 1}</td>
              <td className="py-2.5 pr-3 font-medium">{s.nombre}</td>
              <td className="py-2.5 pr-3 text-marino-700">{s.categoria}</td>
              <td className="py-2.5 pr-3">
                <ChipTipo id={s.tipo} />
              </td>
              <td className="py-2 pr-3">
                <span className="flex flex-wrap gap-1">
                  {s.necesidades.map((n) => (
                    <span key={n} className="rounded bg-papel px-1.5 py-0.5 text-xs text-marino-700">
                      {n}
                    </span>
                  ))}
                </span>
              </td>
              <td className="py-1.5 text-right" data-html2canvas-ignore>
                <button
                  type="button"
                  onClick={() => onEliminar(s.id)}
                  className="rounded px-2 py-1 text-xs font-medium text-marino-500 transition hover:bg-rojo/10 hover:text-rojo"
                  aria-label={`Eliminar ${s.nombre}`}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
