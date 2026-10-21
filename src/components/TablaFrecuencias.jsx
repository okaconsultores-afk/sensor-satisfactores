import { NECESIDADES, TIPOS, TIPO_POR_ID } from '../maxneef.js';

export function ChipTipo({ id, hueco = false }) {
  const t = TIPO_POR_ID[id];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-marino-700">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={hueco ? { border: `2px solid ${t.color}` } : { background: t.color }}
      />
      {t.nombre}
    </span>
  );
}

export default function TablaFrecuencias({ frecuencias, predominancia }) {
  const totalesTipo = Object.fromEntries(
    TIPOS.map((t) => [t.id, NECESIDADES.reduce((acc, n) => acc + frecuencias[n][t.id], 0)])
  );
  const totalGeneral = NECESIDADES.reduce((acc, n) => acc + frecuencias[n].total, 0);

  return (
    <div className="relative overflow-x-auto">
      <table className="num w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-linea text-left">
            <th className="py-2 pr-3 etiqueta">Necesidad</th>
            {TIPOS.map((t, i) => (
              <th key={t.id} className="px-2 py-2 text-center align-bottom" title={t.descripcion}>
                <span className="flex flex-col items-center gap-1">
                  <span className="h-1.5 w-6 rounded-full" style={{ background: t.color }} />
                  <span className="text-[11px] font-semibold leading-tight text-marino-700">
                    {i + 1}. {t.nombre}
                  </span>
                </span>
              </th>
            ))}
            <th className="px-2 py-2 text-center etiqueta">Total</th>
            <th className="py-2 pl-3 etiqueta">Predominante</th>
          </tr>
        </thead>
        <tbody>
          {NECESIDADES.map((nec) => {
            const fila = frecuencias[nec];
            const pred = predominancia[nec];
            return (
              <tr key={nec} className="border-b border-linea/70 last:border-0">
                <td className="py-2 pr-3 font-medium">{nec}</td>
                {TIPOS.map((t) => {
                  const v = fila[t.id];
                  const esPred = pred.includes(t.id);
                  return (
                    <td key={t.id} className="px-2 py-1.5 text-center">
                      <span
                        className={`inline-flex h-7 min-w-[2rem] items-center justify-center rounded px-1.5 font-mono ${
                          esPred ? 'font-semibold text-white' : v ? 'text-marino' : 'text-marino-300'
                        }`}
                        style={esPred ? { background: t.color } : undefined}
                      >
                        {v || '·'}
                      </span>
                    </td>
                  );
                })}
                <td className="px-2 py-1.5 text-center font-mono font-semibold">{fila.total || '·'}</td>
                <td className="py-1.5 pl-3">
                  {pred.length === 0 ? (
                    <span className="text-xs text-marino-300">Sin datos</span>
                  ) : (
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {pred.map((id) => (
                        <ChipTipo key={id} id={id} hueco={pred.length > 1} />
                      ))}
                      {pred.length > 1 && (
                        <span className="rounded bg-papel px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-marino-500">
                          Empate
                        </span>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-marino/80">
            <td className="py-2 pr-3 etiqueta">Total</td>
            {TIPOS.map((t) => (
              <td key={t.id} className="px-2 py-2 text-center font-mono font-semibold">
                {totalesTipo[t.id] || '·'}
              </td>
            ))}
            <td className="px-2 py-2 text-center font-mono font-semibold">{totalGeneral || '·'}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
