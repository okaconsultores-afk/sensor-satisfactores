import { TIPOS } from '../maxneef.js';

/**
 * Copia compacta del gráfico, fija en la esquina inferior derecha, que aparece cuando el gráfico
 * principal sale de la pantalla. Así el gráfico sigue visible al registrar datos o revisar tablas.
 */
export default function GraficoFlotante({ minimizado, onMinimizar, onIrAlGrafico, children }) {
  const posicion = {
    right: 'max(12px, env(safe-area-inset-right, 0px))',
    bottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
  };

  if (minimizado) {
    return (
      <button
        type="button"
        onClick={() => onMinimizar(false)}
        style={posicion}
        className="fixed z-30 flex items-center gap-2 rounded-full bg-marino py-2.5 pl-3 pr-4 text-sm font-semibold text-white shadow-lg transition hover:bg-marino-700"
        data-html2canvas-ignore
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
          {[3, 6, 9].map((r) => (
            <circle key={r} cx="10" cy="10" r={r} fill="none" stroke="currentColor" strokeOpacity={0.4 + r / 15} />
          ))}
          <circle cx="10" cy="1.5" r="1.8" fill="#E8863A" />
        </svg>
        Ver gráfico
      </button>
    );
  }

  return (
    <aside
      aria-label="Gráfico flotante"
      style={posicion}
      className="fixed z-30 w-[176px] rounded-xl border border-linea bg-white/95 p-1.5 shadow-xl backdrop-blur sm:w-[300px] sm:p-2 xl:w-[330px]"
      data-html2canvas-ignore
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={onIrAlGrafico}
          className="truncate text-left text-[11px] font-semibold text-marino hover:underline sm:text-xs"
          title="Ir al gráfico completo"
        >
          <span className="sm:hidden">Ver completo</span>
          <span className="hidden sm:inline">Tipo predominante por necesidad</span>
        </button>
        <button
          type="button"
          onClick={() => onMinimizar(true)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-marino-500 hover:bg-papel hover:text-marino"
          aria-label="Minimizar gráfico"
          title="Minimizar"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {children}
      <ul className="hidden flex-wrap justify-center gap-x-2.5 sm:flex gap-y-1 px-1 pb-1 text-[10px] text-marino-700">
        {TIPOS.map((t, i) => (
          <li key={t.id} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
            {i + 1} {t.nombre.replace('-satisfactor', '')}
          </li>
        ))}
      </ul>
    </aside>
  );
}
