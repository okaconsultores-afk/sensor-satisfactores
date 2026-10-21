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
    for (const nec of s.necesidades) {
      if (!tabla[nec]) continue;
      tabla[nec][s.tipo] += 1;
      tabla[nec].total += 1;
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

export const EJEMPLO = {
  problema:
    '¿De qué manera los satisfactores presentes en la vida comunitaria del barrio inciden en la realización de las necesidades humanas fundamentales de sus jóvenes?',
  satisfactores: [
    { nombre: 'Huerta comunitaria autogestionada', categoria: 'Hacer', tipo: 'sinergico', necesidades: ['Subsistencia', 'Participación', 'Entendimiento', 'Identidad'] },
    { nombre: 'Asamblea vecinal mensual', categoria: 'Estar', tipo: 'sinergico', necesidades: ['Participación', 'Identidad', 'Libertad'] },
    { nombre: 'Videojuegos en solitario por horas', categoria: 'Hacer', tipo: 'pseudo', necesidades: ['Ocio'] },
    { nombre: 'Cámaras de vigilancia en la calle', categoria: 'Tener', tipo: 'pseudo', necesidades: ['Protección'] },
    { nombre: 'Presencia de pandillas armadas', categoria: 'Estar', tipo: 'destructor', necesidades: ['Protección', 'Libertad', 'Afecto'] },
    { nombre: 'Comedor escolar', categoria: 'Tener', tipo: 'singular', necesidades: ['Subsistencia'] },
    { nombre: 'Clases memorísticas y verticales', categoria: 'Hacer', tipo: 'inhibidor', necesidades: ['Entendimiento', 'Creación'] },
    { nombre: 'Familia sobreprotectora', categoria: 'Ser', tipo: 'inhibidor', necesidades: ['Protección', 'Libertad'] },
    { nombre: 'Grupo de música tradicional', categoria: 'Hacer', tipo: 'sinergico', necesidades: ['Creación', 'Identidad', 'Ocio', 'Afecto'] },
    { nombre: 'Consumo de alcohol en fiestas', categoria: 'Hacer', tipo: 'destructor', necesidades: ['Ocio', 'Afecto'] },
    { nombre: 'Biblioteca barrial', categoria: 'Estar', tipo: 'singular', necesidades: ['Entendimiento'] },
    { nombre: 'Extorsión a comercios locales', categoria: 'Estar', tipo: 'destructor', necesidades: ['Protección', 'Subsistencia'] },
    { nombre: 'Mercado de trueque', categoria: 'Hacer', tipo: 'singular', necesidades: ['Subsistencia'] },
    { nombre: 'Taller de lectura entre generaciones', categoria: 'Hacer', tipo: 'sinergico', necesidades: ['Entendimiento', 'Afecto'] },
    { nombre: 'Torneo de fútbol barrial', categoria: 'Hacer', tipo: 'sinergico', necesidades: ['Participación', 'Afecto', 'Identidad'] },
    { nombre: 'Centro comercial como único lugar de encuentro', categoria: 'Estar', tipo: 'pseudo', necesidades: ['Ocio', 'Afecto', 'Identidad'] },
    { nombre: 'Toque de queda impuesto por grupos ilegales', categoria: 'Estar', tipo: 'destructor', necesidades: ['Libertad', 'Participación'] },
  ],
};
