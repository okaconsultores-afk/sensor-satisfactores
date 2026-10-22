# Sensor de satisfactores-necesidades

_Diseño Participativo orientado a la satisfacción_

Aplicación web (SPA) para registrar y visualizar los satisfactores de un grupo social según la
Teoría del Desarrollo a Escala Humana de Manfred Max-Neef. Es un sitio estático: no tiene backend
y los datos se guardan solo en el navegador (`localStorage`), con opción de guardar y abrir el
estudio como archivo `.json`.

## Funciones

- **Problema de investigación**: campo de texto que encabeza el informe.
- **Registro de satisfactores**: nombre, categoría existencial (Ser, Tener, Hacer, Estar) y, para
  cada necesidad que impacta, el tipo con que opera en ella (Destructor, Pseudo-satisfactor,
  Inhibidor, Singular, Sinérgico). Un mismo satisfactor puede ser, por ejemplo, pseudo-satisfactor
  para Creación, destructor para Entendimiento e inhibidor para Ocio.
- **Regla del Singular**: un satisfactor Singular atiende una sola necesidad. Al marcar Singular en
  una necesidad, las demás quedan bloqueadas.
- **Ayudas para personas no expertas**: ejemplos en los campos, y descripción emergente de cada
  categoría (Ser: atributos personales o colectivos; Tener: instituciones, normas, herramientas;
  Hacer: acciones personales o colectivas; Estar: espacios, lugares, ambientes).
- **Gráfico siempre visible**: cuando el gráfico principal sale de la pantalla aparece una copia
  flotante en la esquina inferior derecha, que se puede minimizar.
- **Gráfico de anillos concéntricos** que se actualiza en tiempo real, con un área sombreada por satisfactor que une las necesidades que impacta (se puede ocultar).
- **Etiqueta emergente**: al pasar el cursor (o tocar) un área del gráfico se muestra el nombre del
  satisfactor y su categoría (p. ej. "Talleres de co-creación lúdica, forma de HACER").
- **Edición**: cada fila del registro tiene "Editar" para cambiar nombre, categoría y agregar o
  quitar necesidades y tipos.
- **Solicitar asesoría**: formulario que envía el mensaje a okaconsultores@gmail.com mediante
  [FormSubmit](https://formsubmit.co) (el sitio es estático, sin servidor propio). La primera vez
  que alguien lo usa, FormSubmit manda a ese correo un mensaje con el botón **Activate Form**; hay
  que pulsarlo una sola vez para que los siguientes mensajes lleguen. Si el envío falla, se ofrece
  enviarlo desde el programa de correo del usuario.
- **Tabla de frecuencias** (tipo × necesidad) y **registro** completo de satisfactores.
- **Descargar informe** en PDF (A4) o imagen PNG.

## Lógica del gráfico

- Cada eje es una de las nueve necesidades axiológicas.
- Los anillos, del centro hacia afuera, son: 1 Destructor, 2 Pseudo-satisfactor, 3 Inhibidor,
  4 Singular, 5 Sinérgico. Es una **convención de lectura ordinal**: no es una escala de valor ni
  de cantidad, y nada se suma ni se promedia.
- **Regla de predominancia**: en cada eje se marca el anillo del tipo que más se repite para esa
  necesidad. Las frecuencias exactas quedan en la tabla.
- **Empates**: si dos o más tipos comparten la frecuencia máxima, se marcan todos con un punto
  hueco y la tabla lo indica como "Empate".

Las frecuencias cuentan cada par necesidad–tipo de cada satisfactor. La lógica está en
`src/maxneef.js` (`calcularFrecuencias`, `calcularPredominancia` y `validarImpactos`). Los estudios
guardados con la primera versión (un solo tipo por satisfactor) se convierten automáticamente.

## Desarrollo local

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # genera la carpeta dist/
npm run preview  # sirve dist/ para probar la versión final
```

## Publicar en GitHub Pages

1. Suba este proyecto a un repositorio de GitHub (rama `main`).
2. En el repositorio, vaya a **Settings → Pages** y en **Source** elija **GitHub Actions**.
3. Cada `push` a `main` compila y publica el sitio con `.github/workflows/deploy.yml`.

El proyecto usa rutas relativas (`base: './'` en `vite.config.js`), así que funciona en
`https://<usuario>.github.io/<repositorio>/` sin cambios. El logotipo está en
`public/icon-192x192.PNG`; para cambiarlo, reemplace ese archivo conservando el nombre.

## Estructura

```
public/icon-192x192.PNG          logotipo del grupo de investigación
src/maxneef.js                   necesidades, categorías, tipos, frecuencias y predominancia
src/App.jsx                      diseño del panel y estado (con persistencia local)
src/components/GraficoPolar.jsx  gráfico SVG de anillos concéntricos
src/components/TablaFrecuencias.jsx
src/components/TablaRegistro.jsx
src/components/FormularioSatisfactor.jsx
src/exportar.js                  PDF/PNG (html2canvas-pro + jsPDF) y JSON
```

Tecnologías: React 18, Vite 5, Tailwind CSS 3, html2canvas-pro, jsPDF.
