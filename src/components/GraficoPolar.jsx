import { useRef, useState } from 'react';
import { NECESIDADES, TIPOS, TIPO_POR_ID } from '../maxneef.js';

const ANCHO = 640;
const ALTO = 548;
const CX = ANCHO / 2;
const CY = 276;
const R_MIN = 44; // anillo 1 (Destructor)
const R_MAX = 204; // anillo 5 (Sinérgico)
const PASO = (R_MAX - R_MIN) / (TIPOS.length - 1);

const radioDeAnillo = (indice) => R_MIN + indice * PASO;
const anguloDeEje = (i) => (-90 + (360 / NECESIDADES.length) * i) * (Math.PI / 180);
const punto = (angulo, r) => [CX + r * Math.cos(angulo), CY + r * Math.sin(angulo)];

/**
 * Área de un satisfactor: une, en el orden de los ejes, los puntos de las necesidades que impacta,
 * cada uno en el anillo del tipo con que opera en esa necesidad. Con una o dos necesidades el área
 * se cierra en el centro.
 */
function puntosDeArea(s) {
  const pts = NECESIDADES.flatMap((nec, i) => {
    const imp = s.impactos.find((x) => x.necesidad === nec);
    return imp ? [punto(anguloDeEje(i), radioDeAnillo(TIPOS.indexOf(TIPO_POR_ID[imp.tipo])))] : [];
  });
  if (pts.length < 3) pts.unshift([CX, CY]);
  return pts.map((p) => p.join(',')).join(' ');
}

/** Superficie del polígono (fórmula del área de Gauss), para dibujar las áreas pequeñas encima. */
function superficie(puntos) {
  const p = puntos.split(' ').map((xy) => xy.split(',').map(Number));
  return (
    Math.abs(
      p.reduce((acc, [x, y], i) => {
        const [x2, y2] = p[(i + 1) % p.length];
        return acc + x * y2 - x2 * y;
      }, 0),
    ) / 2
  );
}

/** Color del área: el del tipo si el satisfactor opera igual en todas sus necesidades; si no, neutro. */
function colorDeArea(s) {
  const tipos = new Set(s.impactos.map((i) => i.tipo));
  return tipos.size === 1 ? TIPO_POR_ID[[...tipos][0]].color : '#16213A';
}

/**
 * Gráfico polar de anillos concéntricos. Cada eje es una necesidad; cada anillo, un tipo de
 * satisfactor en orden ordinal (centro → afuera). El punto de cada eje se ubica en el anillo del
 * tipo predominante. Si hay empate se marcan todos los tipos empatados con un punto hueco.
 * Opcionalmente, cada satisfactor dibuja un área sombreada que une las necesidades que impacta.
 */
export default function GraficoPolar({
  frecuencias,
  predominancia,
  satisfactores = [],
  mostrarAreas = true,
  resaltado,
  onResaltar,
}) {
  const contenedorRef = useRef(null);
  const [etiqueta, setEtiqueta] = useState(null); // { satisfactor, x, y } en px dentro del contenedor

  const mostrarEtiqueta = (ev, s) => {
    const caja = contenedorRef.current.getBoundingClientRect();
    setEtiqueta({ satisfactor: s, x: ev.clientX - caja.left, y: ev.clientY - caja.top, ancho: caja.width });
    onResaltar?.(s.id);
  };
  const ocultarEtiqueta = () => {
    setEtiqueta(null);
    onResaltar?.(null);
  };

  // Las áreas más grandes se dibujan primero para que las pequeñas queden encima y se puedan señalar
  const areas = satisfactores
    .map((s) => ({ s, puntos: puntosDeArea(s) }))
    .sort((a, b) => superficie(b.puntos) - superficie(a.puntos));

  return (
    <div ref={contenedorRef} className="relative w-full max-w-[640px]">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        role="img"
        aria-label="Gráfico de anillos: tipo de satisfactor predominante por necesidad"
        className="h-auto w-full"
      >
        {/* Bandas y anillos */}
        {TIPOS.map((t, i) => (
          <circle
            key={t.id}
            cx={CX}
            cy={CY}
            r={radioDeAnillo(i)}
            fill="none"
            stroke={t.color}
            strokeOpacity={0.35}
            strokeWidth={1.25}
          />
        ))}
        <circle cx={CX} cy={CY} r={3} fill="#16213A" />

        {/* Ejes y nombres de necesidad */}
        {NECESIDADES.map((nec, i) => {
          const a = anguloDeEje(i);
          const [x2, y2] = punto(a, R_MAX + 10);
          const [lx, ly] = punto(a, R_MAX + 26);
          const cos = Math.cos(a);
          const anchor = Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end';
          const sinDatos = frecuencias[nec].total === 0;
          const dy = Math.sin(a) > 0.6 ? 14 : Math.sin(a) < -0.6 ? -4 : 5;
          return (
            <g key={nec}>
              <line x1={CX} y1={CY} x2={x2} y2={y2} stroke="#8C94A8" strokeOpacity={0.55} strokeWidth={1} />
              <text
                x={lx}
                y={ly + dy}
                textAnchor={anchor}
                fontFamily='"IBM Plex Sans", system-ui, sans-serif'
                fontSize={17}
                fontWeight={600}
                fill={sinDatos ? '#8C94A8' : '#16213A'}
              >
                {nec}
              </text>
            </g>
          );
        })}

        {/* Número de cada anillo, en el hueco entre el primer y el segundo eje (la leyenda los nombra) */}
        {TIPOS.map((t, i) => {
          const a = (anguloDeEje(0) + anguloDeEje(1)) / 2;
          const [x, y] = punto(a, radioDeAnillo(i));
          return (
            <text
              key={t.id}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontFamily='"IBM Plex Mono", ui-monospace, monospace'
              fontSize={12}
              fontWeight={600}
              fill={t.color}
              stroke="#FFFFFF"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {i + 1}
            </text>
          );
        })}

        {/* Áreas de cobertura de cada satisfactor (debajo de los puntos de predominancia) */}
        {mostrarAreas && (
          <g onMouseLeave={ocultarEtiqueta}>
            {areas.map(({ s, puntos }) => {
              const color = colorDeArea(s);
              const activo = resaltado === s.id;
              const atenuado = resaltado && !activo;
              return (
                <polygon
                  key={s.id}
                  points={puntos}
                  fill={color}
                  fillOpacity={activo ? 0.32 : atenuado ? 0.025 : 0.07}
                  stroke={color}
                  strokeOpacity={activo ? 0.95 : atenuado ? 0.12 : 0.45}
                  strokeWidth={activo ? 2 : 1}
                  strokeLinejoin="round"
                  onMouseMove={(ev) => mostrarEtiqueta(ev, s)}
                  onClick={(ev) => mostrarEtiqueta(ev, s)}
                  style={{ cursor: 'pointer', transition: 'fill-opacity 200ms, stroke-opacity 200ms' }}
                />
              );
            })}
          </g>
        )}

        {/* Puntos de predominancia */}
        {NECESIDADES.map((nec, i) => {
          const ids = predominancia[nec];
          const empate = ids.length > 1;
          const a = anguloDeEje(i);
          return ids.map((id) => {
            const tipo = TIPO_POR_ID[id];
            const [x, y] = punto(a, radioDeAnillo(TIPOS.indexOf(tipo)));
            const n = frecuencias[nec][id];
            return (
              <g
                key={`${nec}-${id}`}
                style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 400ms ease' }}
              >
                <title>
                  {`${nec}: ${tipo.nombre}${empate ? ' (empate)' : ''} · ${n} de ${frecuencias[nec].total}`}
                </title>
                {empate ? (
                  <circle r={7.5} fill="#FFFFFF" stroke={tipo.color} strokeWidth={3} />
                ) : (
                  <>
                    <circle r={13} fill={tipo.color} fillOpacity={0.18} />
                    <circle r={8} fill={tipo.color} stroke="#FFFFFF" strokeWidth={2} />
                  </>
                )}
              </g>
            );
          });
        })}
      </svg>

      {etiqueta && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 w-max max-w-[260px] rounded-lg bg-marino px-3 py-2 text-white shadow-lg"
          style={{
            left: Math.min(Math.max(etiqueta.x, 130), etiqueta.ancho - 130),
            top: etiqueta.y - 14,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="text-sm font-semibold leading-snug">{etiqueta.satisfactor.nombre}</p>
          <ul className="mt-1 flex flex-col gap-0.5 text-xs text-white/85">
            {etiqueta.satisfactor.impactos.map(({ necesidad, tipo }) => (
              <li key={necesidad} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/60"
                  style={{ background: TIPO_POR_ID[tipo].color }}
                />
                {necesidad} · {TIPO_POR_ID[tipo].nombre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
