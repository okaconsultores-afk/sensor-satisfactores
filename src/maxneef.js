// Modelo de la Teoría del Desarrollo a Escala Humana (Max-Neef, Elizalde y Hopenhayn).

export const NECESIDADES = [
  'Subsistencia',
  'Protección',
  'Afecto',
  'Entendimiento',
  'Participación',
  'Ocio',
  'Creación',
  'Identidad',
  'Libertad',
];

export const CATEGORIAS = ['Ser', 'Tener', 'Hacer', 'Estar'];

// El orden es la convención de lectura de los anillos, del centro hacia afuera.
// Es ordinal: no expresa cantidad ni se promedia.
export const TIPOS = [
  {
    id: 'destructor',
    nombre: 'Destructor',
    color: '#8E2A22',
    descripcion: 'Pretende satisfacer una necesidad pero imposibilita su satisfacción y la de otras.',
  },
  {
    id: 'pseudo',
    nombre: 'Pseudo-satisfactor',
    color: '#D04C3B',
    descripcion: 'Genera una falsa sensación de satisfacción de una necesidad.',
  },
  {
    id: 'inhibidor',
    nombre: 'Inhibidor',
    color: '#A0614E',
    descripcion: 'Sobresatisface una necesidad y dificulta la satisfacción de otras.',
  },
  {
    id: 'singular',
    nombre: 'Singular',
    color: '#E8863A',
    descripcion: 'Satisface una sola necesidad y es neutro respecto de las demás.',
  },
  {
    id: 'sinergico',
    nombre: 'Sinérgico',
    color: '#2E7D6F',
    descripcion: 'Satisface una necesidad y estimula la satisfacción de otras.',
  },
];

export const TIPO_POR_ID = Object.fromEntries(TIPOS.map((t) => [t.id, t]));

/**
 * Un satisfactor tiene `impactos`: una lista de { necesidad, tipo }. Un mismo satisfactor puede
 * operar de forma distinta en cada necesidad (p. ej. pseudo-satisfactor para Creación y
 * destructor para Entendimiento).
 */

/** Un satisfactor Singular satisface una sola necesidad: si tiene algún impacto singular, debe ser el único. */
export function validarImpactos(impactos) {
  if (impactos.length === 0) return 'Asigne un tipo de satisfactor al menos a una necesidad.';
  if (impactos.length > 1 && impactos.some((i) => i.tipo === 'singular'))
    return 'Un satisfactor Singular atiende una sola necesidad.';
  return null;
}

/**
 * Cuenta cuántos satisfactores de cada tipo recaen sobre cada necesidad.
 * Devuelve { [necesidad]: { [tipoId]: n, total: n } }.
 */
export function calcularFrecuencias(satisfactores) {
  const tabla = {};
  for (const nec of NECESIDADES) {
    tabla[nec] = { total: 0 };
    for (const t of TIPOS) tabla[nec][t.id] = 0;
  }
  for (const s of satisfactores) {
    for (const { necesidad, tipo } of s.impactos) {
      if (!tabla[necesidad] || !TIPO_POR_ID[tipo]) continue;
      tabla[necesidad][tipo] += 1;
      tabla[necesidad].total += 1;
    }
  }
  return tabla;
}

/**
 * Regla de predominancia: para cada necesidad, el tipo (o los tipos, si hay empate)
 * con la frecuencia más alta. No se suma ni se promedia entre anillos.
 * Devuelve { [necesidad]: string[] } con los ids de tipo predominantes (vacío si no hay datos).
 */
export function calcularPredominancia(frecuencias) {
  const res = {};
  for (const nec of NECESIDADES) {
    const fila = frecuencias[nec];
    const max = Math.max(...TIPOS.map((t) => fila[t.id]));
    res[nec] = max === 0 ? [] : TIPOS.filter((t) => fila[t.id] === max).map((t) => t.id);
  }
  return res;
}

/**
 * Convierte un satisfactor guardado o importado al modelo actual. Acepta también el formato de la
 * primera versión ({ tipo, necesidades }), en el que un único tipo valía para todas sus necesidades.
 * Devuelve null si no es válido.
 */
export function normalizarSatisfactor(s) {
  if (!s || !s.nombre) return null;
  const crudos = Array.isArray(s.impactos)
    ? s.impactos
    : (s.necesidades || []).map((necesidad) => ({ necesidad, tipo: s.tipo }));
  let impactos = NECESIDADES.flatMap((nec) => {
    const i = crudos.find((c) => c && c.necesidad === nec && TIPO_POR_ID[c.tipo]);
    return i ? [{ necesidad: nec, tipo: i.tipo }] : [];
  });
  // En la primera versión un Singular podía tener varias necesidades: se conserva solo la primera
  if (!Array.isArray(s.impactos) && s.tipo === 'singular') impactos = impactos.slice(0, 1);
  if (validarImpactos(impactos)) return null;
  return {
    nombre: String(s.nombre),
    categoria: CATEGORIAS.includes(s.categoria) ? s.categoria : CATEGORIAS[0],
    impactos,
  };
}

const imp = (pares) => Object.entries(pares).map(([necesidad, tipo]) => ({ necesidad, tipo }));

export const EJEMPLO = {
  problema:
    '¿De qué manera los satisfactores presentes en la vida comunitaria del barrio inciden en la realización de las necesidades humanas fundamentales de sus jóvenes?',
  satisfactores: [
    { nombre: 'Huerta comunitaria autogestionada', categoria: 'Hacer', impactos: imp({ Subsistencia: 'sinergico', Entendimiento: 'sinergico', 'Participación': 'sinergico', Identidad: 'sinergico' }) },
    { nombre: 'Asamblea vecinal mensual', categoria: 'Estar', impactos: imp({ 'Participación': 'sinergico', Identidad: 'sinergico', Libertad: 'sinergico' }) },
    { nombre: 'Videojuegos en solitario por horas', categoria: 'Hacer', impactos: imp({ Afecto: 'inhibidor', Ocio: 'pseudo', 'Creación': 'inhibidor' }) },
    { nombre: 'Cámaras de vigilancia en la calle', categoria: 'Tener', impactos: imp({ 'Protección': 'pseudo', Libertad: 'pseudo' }) },
    { nombre: 'Presencia de pandillas armadas', categoria: 'Estar', impactos: imp({ 'Protección': 'destructor', Afecto: 'pseudo', Identidad: 'pseudo', Libertad: 'destructor' }) },
    { nombre: 'Comedor escolar', categoria: 'Tener', impactos: imp({ Subsistencia: 'singular' }) },
    { nombre: 'Clases memorísticas y verticales', categoria: 'Hacer', impactos: imp({ Entendimiento: 'pseudo', 'Creación': 'destructor', Ocio: 'inhibidor' }) },
    { nombre: 'Familia sobreprotectora', categoria: 'Ser', impactos: imp({ 'Protección': 'inhibidor', Afecto: 'sinergico', Libertad: 'inhibidor' }) },
    { nombre: 'Grupo de música tradicional', categoria: 'Hacer', impactos: imp({ Afecto: 'sinergico', Ocio: 'sinergico', 'Creación': 'sinergico', Identidad: 'sinergico' }) },
    { nombre: 'Consumo de alcohol en fiestas', categoria: 'Hacer', impactos: imp({ Afecto: 'pseudo', Ocio: 'destructor' }) },
    { nombre: 'Biblioteca barrial', categoria: 'Estar', impactos: imp({ Entendimiento: 'singular' }) },
    { nombre: 'Extorsión a comercios locales', categoria: 'Estar', impactos: imp({ Subsistencia: 'destructor', 'Protección': 'destructor' }) },
    { nombre: 'Mercado de trueque', categoria: 'Hacer', impactos: imp({ Subsistencia: 'singular' }) },
    { nombre: 'Taller de lectura entre generaciones', categoria: 'Hacer', impactos: imp({ Afecto: 'sinergico', Entendimiento: 'sinergico', 'Creación': 'sinergico' }) },
    { nombre: 'Torneo de fútbol barrial', categoria: 'Hacer', impactos: imp({ Afecto: 'sinergico', 'Participación': 'sinergico', Ocio: 'sinergico' }) },
    { nombre: 'Centro comercial como único lugar de encuentro', categoria: 'Estar', impactos: imp({ Ocio: 'pseudo', Identidad: 'pseudo', 'Participación': 'inhibidor' }) },
    { nombre: 'Toque de queda impuesto por grupos ilegales', categoria: 'Estar', impactos: imp({ 'Participación': 'destructor', Libertad: 'destructor', 'Protección': 'destructor' }) },
  ],
};
