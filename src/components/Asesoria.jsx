import { useState } from 'react';

export const CORREO_GRUPO = 'okaconsultores@gmail.com';

/**
 * Solicitud de asesoría al grupo de investigación. Como el sitio es estático, el mensaje se envía
 * desde el programa de correo del usuario (enlace mailto con asunto y cuerpo ya escritos).
 */
export default function Asesoria({ problema }) {
  const [datos, setDatos] = useState({ nombre: '', correo: '', institucion: '', mensaje: '' });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState('');

  const cambiar = (campo, valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const enviar = (ev) => {
    ev.preventDefault();
    const nuevos = {};
    if (!datos.nombre.trim()) nuevos.nombre = 'Escriba su nombre.';
    if (!/^\S+@\S+\.\S+$/.test(datos.correo.trim())) nuevos.correo = 'Escriba un correo válido para responderle.';
    if (!datos.mensaje.trim()) nuevos.mensaje = 'Cuéntenos en qué necesita asesoría.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    const cuerpo = [
      `Nombre: ${datos.nombre.trim()}`,
      `Correo: ${datos.correo.trim()}`,
      datos.institucion.trim() && `Institución u organización: ${datos.institucion.trim()}`,
      problema.trim() && `Problema de investigación: ${problema.trim()}`,
      '',
      datos.mensaje.trim(),
    ]
      .filter((l) => l !== false && l !== '')
      .join('\n');
    const asunto = `Solicitud de asesoría · Sensor de satisfactores-necesidades · ${datos.nombre.trim()}`;
    window.location.href = `mailto:${CORREO_GRUPO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    setEstado('abierto');
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(CORREO_GRUPO);
      setEstado('copiado');
    } catch {
      setEstado('sin-copia');
    }
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3" noValidate>
      <p className="text-sm leading-relaxed text-marino-700">
        ¿Quiere acompañamiento para aplicar el análisis de satisfactores en su comunidad u organización? Escríbale al grupo
        de investigación.
      </p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ase-nombre" className="etiqueta">
          Nombre
        </label>
        <input id="ase-nombre" className="campo" value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} autoComplete="name" />
        {errores.nombre && <p className="text-xs text-rojo">{errores.nombre}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ase-correo" className="etiqueta">
          Su correo
        </label>
        <input
          id="ase-correo"
          type="email"
          className="campo"
          value={datos.correo}
          onChange={(e) => cambiar('correo', e.target.value)}
          autoComplete="email"
        />
        {errores.correo && <p className="text-xs text-rojo">{errores.correo}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ase-institucion" className="etiqueta">
          Institución u organización (opcional)
        </label>
        <input
          id="ase-institucion"
          className="campo"
          value={datos.institucion}
          onChange={(e) => cambiar('institucion', e.target.value)}
          autoComplete="organization"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ase-mensaje" className="etiqueta">
          ¿En qué necesita asesoría?
        </label>
        <textarea
          id="ase-mensaje"
          rows={4}
          className="campo resize-y leading-relaxed"
          value={datos.mensaje}
          onChange={(e) => cambiar('mensaje', e.target.value)}
        />
        {errores.mensaje && <p className="text-xs text-rojo">{errores.mensaje}</p>}
      </div>
      <button type="submit" className="rounded-md bg-naranja px-4 py-2.5 text-sm font-semibold text-marino transition hover:bg-[#DA772B]">
        Solicitar asesoría
      </button>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-marino-500">
        <span>
          Se abrirá su programa de correo con el mensaje listo para enviar a{' '}
          <span className="select-all font-medium text-marino">{CORREO_GRUPO}</span>
        </span>
        <button type="button" onClick={copiar} className="font-semibold text-marino-700 underline underline-offset-2">
          Copiar correo
        </button>
      </div>
      {estado === 'abierto' && (
        <p className="text-xs leading-relaxed text-marino-700">
          Revise su programa de correo y pulse Enviar. Si no se abrió, copie la dirección y escríbanos desde su correo.
        </p>
      )}
      {estado === 'copiado' && <p className="text-xs text-marino-700">Correo copiado.</p>}
      {estado === 'sin-copia' && (
        <p className="text-xs text-marino-700">No se pudo copiar. Seleccione la dirección y cópiela manualmente.</p>
      )}
    </form>
  );
}
