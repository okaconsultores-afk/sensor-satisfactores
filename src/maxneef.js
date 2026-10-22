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

// Orientación breve para elegir la categoría existencial de un satisfactor
export const DESCRIPCION_CATEGORIA = {
  Ser: 'Atributos personales o colectivos.',
  Tener: 'Instituciones, normas, herramientas (no necesariamente materiales).',
  Hacer: 'Acciones personales o colectivas.',
  Estar: 'Espacios, lugares, ambientes.',
};

// El orden es la convención de lectura de los anillos, del centro hacia afuera.
// Es ordinal: no expresa cantidad ni se promedia.
export const TIPOS = [
  {
    id: 'destructor',
    nombre: 'Destructor',
    color: '#8E2A22',
    descripcion: 'Promete satisfacer una necesidad, pero termina anulándola y además bloquea la satisfacción de otras.',
    ejemplo: 'El armamentismo, que se ofrece como protección.',
  },
  {
    id: 'pseudo',
    nombre: 'Pseudo-satisfactor',
    color: '#D04C3B',
    descripcion: 'Da una sensación falsa de satisfacción, casi siempre inducida por la publicidad, la moda o la costumbre.',
    ejemplo: 'Comprar marcas para sentir identidad.',
  },
  {
    id: 'inhibidor',
    nombre: 'Inhibidor',
    color: '#A0614E',
    descripcion: 'Satisface, o incluso sobre-satisface, una necesidad, pero su rigidez dificulta mucho satisfacer otras.',
    ejemplo: 'La familia sobreprotectora, que limita la libertad.',
  },
  {
    id: 'singular',
    nombre: 'Singular',
    color: '#E8863A',
    descripcion: 'Atiende una sola necesidad y es neutro frente a las demás. Suele venir de instituciones o programas.',
    ejemplo: 'Un programa de asistencia alimentaria.',
  },
  {
    id: 'sinergico',
    nombre: 'Sinérgico',
    color: '#2E7D6F',
    descripcion: 'Satisface una necesidad y, por la forma en que se lleva a cabo, estimula a la vez la satisfacción de otras.',
    ejemplo: 'La educación popular, que también fortalece la participación y la identidad.',
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

export const EJEMPLO_PROBLEMA =
  'En una investigación con víctimas del conflicto armado en Colombia nos preguntamos: ¿Cuándo una respuesta lúdica digital co-diseñada con víctimas del conflicto armado puede agenciar la convivencia pacífica?';

export const EJEMPLO = {
  problema: EJEMPLO_PROBLEMA,
  satisfactores: [
    { nombre: 'Talleres de co-creación lúdica', categoria: 'Hacer', impactos: imp({ Afecto: 'sinergico', Entendimiento: 'sinergico', 'Participación': 'sinergico', 'Creación': 'sinergico', Identidad: 'sinergico' }) },
    { nombre: 'Videojuego cooperativo co-diseñado', categoria: 'Tener', impactos: imp({ Entendimiento: 'sinergico', Ocio: 'sinergico', 'Creación': 'sinergico', Identidad: 'sinergico' }) },
    { nombre: 'Círculos de memoria y relato', categoria: 'Estar', impactos: imp({ Afecto: 'sinergico', Entendimiento: 'sinergico', Identidad: 'sinergico' }) },
    { nombre: 'Juego de rol sobre reconciliación', categoria: 'Hacer', impactos: imp({ Entendimiento: 'sinergico', 'Participación': 'sinergico', Libertad: 'sinergico' }) },
    { nombre: 'Proyectos productivos asociativos', categoria: 'Hacer', impactos: imp({ Subsistencia: 'sinergico', 'Participación': 'sinergico', Identidad: 'sinergico' }) },
    { nombre: 'Ayuda humanitaria asistencialista', categoria: 'Tener', impactos: imp({ Subsistencia: 'singular' }) },
    { nombre: 'Subsidio de transporte', categoria: 'Tener', impactos: imp({ Subsistencia: 'singular' }) },
    { nombre: 'Ludoteca comunitaria', categoria: 'Estar', impactos: imp({ Ocio: 'singular' }) },
    { nombre: 'Estigmatización como “víctimas”', categoria: 'Ser', impactos: imp({ 'Participación': 'inhibidor', Identidad: 'destructor', Libertad: 'destructor' }) },
    { nombre: 'Presencia de actores armados en el territorio', categoria: 'Estar', impactos: imp({ 'Protección': 'destructor', 'Participación': 'destructor', Libertad: 'destructor' }) },
    { nombre: 'Esquemas de protección con escoltas', categoria: 'Tener', impactos: imp({ 'Protección': 'pseudo', Libertad: 'inhibidor' }) },
    { nombre: 'Redes sociales con discursos de odio', categoria: 'Estar', impactos: imp({ Afecto: 'destructor', Entendimiento: 'pseudo', Identidad: 'destructor' }) },
    { nombre: 'Juegos de azar como única recreación', categoria: 'Hacer', impactos: imp({ Subsistencia: 'destructor', Ocio: 'pseudo' }) },
    { nombre: 'Desconfianza entre vecinos', categoria: 'Ser', impactos: imp({ 'Protección': 'destructor', Afecto: 'inhibidor', 'Participación': 'inhibidor' }) },
    { nombre: 'Mesa de participación burocratizada', categoria: 'Tener', impactos: imp({ 'Participación': 'pseudo', Identidad: 'pseudo' }) },
    { nombre: 'Videojuegos violentos comerciales', categoria: 'Tener', impactos: imp({ Ocio: 'pseudo', 'Creación': 'inhibidor', Afecto: 'inhibidor' }) },
  ],
};
