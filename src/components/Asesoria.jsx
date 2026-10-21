import { useState } from 'react';

export const CORREO_GRUPO = 'okaconsultores@gmail.com';

// Servicio de reenvío de formularios para sitios estáticos. La primera vez, FormSubmit envía a
// CORREO_GRUPO un correo con el enlace "Activate Form"; después de activarlo, los mensajes llegan solos.
const ENDPOINT = `https://formsubmit.co/ajax/${CORREO_GRUPO}`;

/**
 * Solicitud de asesoría al grupo de investigación. El mensaje se envía directamente con FormSubmit;
 * si falla, se ofrece enviarlo desde el programa de correo del usuario (enlace mailto).
 */
export default function Asesoria({ problema }) {
  const [datos, setDatos] = useState({ nombre: '', correo: '', institucion: '', mensaje: '' });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState(''); // '', 'enviando', 'enviado', 'activacion', 'error', 'copiado', 'sin-copia'
  const [mailto, setMailto] = useState('');

  const cambiar = (campo, valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    const nuevos = {};
    if (!datos.nombre.trim()) nuevos.nombre = 'Escriba su nombre.';
    if (!/^\S+@\S+\.\S+$/.test(datos.correo.trim())) nuevos.correo = 'Escriba un correo válido para responderle.';
    if (!datos.mensaje.trim()) nuevos.mensaje = 'Cuéntenos en qué necesita asesoría.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    const asunto = `Solicitud de asesoría · Sensor de satisfactores-necesidades · ${datos.nombre.trim()}`;
    const campos = {
      Nombre: datos.nombre.trim(),
      Correo: datos.correo.trim(),
      'Institución u organización': datos.institucion.trim() || '—',
      'Problema de investigación': problema.trim() || '—',
      Mensaje: datos.mensaje.trim(),
    };
    const cuerpo = Object.entries(campos)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    setMailto(`mailto:${CORREO_GRUPO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`);

    setEstado('enviando');
    try {
      const resp = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...campos,
          _subject: asunto,
          _replyto: datos.correo.trim(),
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const res = await resp.json().catch(() => ({}));
      if (resp.ok && String(res.success) === 'true') {
        setEstado('enviado');
        setDatos({ nombre: '', correo: '', institucion: '', mensaje: '' });
      } else if (/activat/i.test(res.message || '')) {
        setEstado('activacion');
      } else {
        setEstado('error');
      }
    } catch {
      setEstado('error');
    }
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
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="rounded-md bg-naranja px-4 py-2.5 text-sm font-semibold text-marino transition hover:bg-[#DA772B] disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Solicitar asesoría'}
      </button>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-marino-500">
        <span>
          Su mensaje llegará a <span className="select-all font-medium text-marino">{CORREO_GRUPO}</span>
        </span>
        <button type="button" onClick={copiar} className="font-semibold text-marino-700 underline underline-offset-2">
          Copiar correo
        </button>
      </div>
      {estado === 'enviado' && (
        <p role="status" className="rounded-md bg-[#2E7D6F]/10 px-3 py-2 text-sm text-[#1F5A50]">
          Mensaje enviado. El grupo de investigación le responderá a su correo.
        </p>
      )}
      {estado === 'activacion' && (
        <p role="status" className="rounded-md bg-naranja/15 px-3 py-2 text-sm leading-relaxed text-marino">
          El formulario aún no está activado. Se envió un correo de activación a {CORREO_GRUPO}; mientras tanto, puede{' '}
          <a href={mailto} className="font-semibold underline underline-offset-2">
            enviar el mensaje desde su programa de correo
          </a>
          .
        </p>
      )}
      {estado === 'error' && (
        <p role="alert" className="rounded-md bg-rojo/10 px-3 py-2 text-sm leading-relaxed text-marino">
          No se pudo enviar el mensaje. Revise su conexión e intente de nuevo, o{' '}
          <a href={mailto} className="font-semibold underline underline-offset-2">
            envíelo desde su programa de correo
          </a>
          .
        </p>
      )}
      {estado === 'copiado' && <p className="text-xs text-marino-700">Correo copiado.</p>}
      {estado === 'sin-copia' && (
        <p className="text-xs text-marino-700">No se pudo copiar. Seleccione la dirección y cópiela manualmente.</p>
      )}
    </form>
  );
}
