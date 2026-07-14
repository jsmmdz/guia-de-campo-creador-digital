# Guía de Campo del Creador Digital — Acto I

Contexto de ingeniería para trabajar en este repo. El spec de producto/diseño
vive aparte (documento de spec ya existente para las secciones construidas);
este archivo cubre **estado actual, decisiones tomadas y errores ya
corregidos** para que un agente nuevo no los repita.

## Qué es esto

Sitio scrollytelling estático (sin build step) para la carrera de Creación
Digital — Universidad El Bosque. Acto I cubre dos nodos:

- **Nodo 0 — Umbral** (`#threshold`): título ancla, constelación de las 8
  herramientas de la carrera orbitando, copy de 5 pilares revelado por
  scroll, cierre "Exploremoslo Juntos", rastro de cursor tipo cometa sobre
  el título.
- **Nodo 1 — Catálogo** (`#catalog`): 6 placas de disciplina en carrusel
  horizontal, blob por disciplina generado por código que muta entre
  tarjetas, fondo reactivo al color de la activa.

## Stack

HTML/CSS/JS planos. GSAP 3.12.5 + ScrollTrigger por CDN (jsdelivr), sin
bundler ni framework. Un solo `script.js` en un IIFE, un solo `styles.css`.

## Estructura

```
index.html
styles.css
script.js
assets/
  home/          8 fotos de herramientas (1122×1402, verticales)
  disciplinas/   vacía — ver convención de nombres más abajo
```

## Decisiones de diseño (no reabrir sin razón)

- **Tipografía**: una sola familia (Archivo) — itálica-black para títulos,
  regular/medium para cuerpo. El spec de Acto I pide explícitamente "la
  misma familia" para títulos y cuerpo (a diferencia del spec de home
  original, que pedía dos familias distintas).
- **Motion por defecto**: el sitio anima siempre, **ignora
  `prefers-reduced-motion`** — decisión de producto explícita del usuario.
  Quien quiera la versión calma la pide con `?static=1`.
- **Breakpoints** (fijos, documentados también en el header de
  `styles.css`): móvil ≤767 · tablet 768–1023 · laptop 1024–1439 (tier
  base, sin `@media`) · desktop 1440–1919 · pantallas grandes ≥1920.
- **Catálogo — modo simple vs. scroll-jacking**: móvil + tablet (≤1023px,
  táctiles) usan scroll-snap nativo; laptop+ (≥1024px) usa scroll-jacking
  con pin de GSAP ScrollTrigger. La tablet se agrupó con móvil porque
  comparte gestos de swipe-back que el scroll-jacking rompería.
- **Blobs del catálogo**: SVG generado en JS, no assets. Los 6 paths usan
  la *misma estructura de comandos* (`M` + 8×`C` + `Z`, ver `blobPath()` en
  `script.js`) para poder interpolarse en caliente con
  `gsap.utils.interpolate` sin plugin de morph.
- **Órbita de íconos**: radio calculado desde `Math.min(innerWidth,
  innerHeight)`, no desde ancho y alto por separado — si se separan, la
  órbita queda ovalada en pantallas anchas.
- **Sin marco en los íconos de herramientas**: las imágenes se muestran tal
  cual vienen (sin circular/cuadrar, sin `object-fit: cover`, sin tinte de
  color) — decisión explícita del usuario, no reintroducir bordes/fondos.

## Errores ya corregidos (no reintroducir)

1. **Constelación partida en 5 + 3**: los 8 íconos deben estar TODOS en
   `.threshold__field` orbitando juntos. Hubo una versión con Ps/Blender/Ai
   en una fila estática aparte (heredada del spec de home viejo) — el spec
   de Acto I pide los 8 en una sola constelación.
2. **Tinte azul en GitHub/Unreal**: se quitó `mix-blend-mode: color` sobre
   esos íconos — con las fotos reales (no logos monocromos) se veía mal.
3. **Imágenes recortadas a cuadrado**: las fotos fuente son 1122×1402
   (verticales). El frame usa `aspect-ratio: 1122/1402` + `object-fit:
   contain`, nunca un contenedor cuadrado con `cover`.
4. **Retry-storm de videos 404**: si un video de disciplina no existe, el
   handler de `error` NO debe borrar la entrada de `feedState` (Map) — si
   se borra, cada vez que la tarjeta vuelve a ser vecina se reintenta la
   descarga. Se deja la entrada con `ready:false` para siempre.
5. **`in-catalog` se activaba al cargar la página** (modo simple/tablet):
   el `IntersectionObserver` para detectar la tarjeta activa usa `root:
   catalog`, lo que lo hace disparar sin importar si el catálogo está
   fuera del viewport de la página. El estado `in-catalog` lo controla
   **únicamente** `simpleBoundaryST` (el ScrollTrigger de límite); el
   observer solo llama `applyProgress(idx)`, nunca `setInCatalog()`.
6. **`<canvas>` no se estira con `inset` solo**: los elementos reemplazados
   (`canvas`, `img`, `video`) necesitan `width`/`height` explícitos en CSS
   además de `inset`, si no usan su tamaño intrínseco (300×150 en canvas).
7. **Cache del navegador durante desarrollo activo**: `styles.css` y
   `script.js` se referencian con `?v=N` en `index.html`; subir la versión
   al editarlos evita servir una copia vieja cacheada.
8. **`body.classList.add("enhanced")` no debe correr antes de confirmar que
   GSAP cargó** — si el CDN falla, el body no debe quedar en estado
   "animado" con contenido escondido y sin JS que lo revele.

## Pendiente

- **Animaciones/videos reales de las 6 disciplinas** — hoy los blobs son
  geometría de placeholder. Convención de nombres esperada en
  `assets/disciplinas/` (carpeta vacía en este repo, hay que crearla):
  `01-ux-ui.mp4`, `02-3d-production.mp4`, `03-software-dev.mp4`,
  `04-game-engineering.mp4`, `05-multimedia-artist.mp4`,
  `06-ai-technologist.mp4`. Carga perezosa por proximidad (±1 tarjeta) ya
  implementada en `ensureFeedLoading()`.
- **Copy final de las 6 placas del catálogo** — el actual es un borrador
  provisional (marcado con comentario `COPY PROVISIONAL` en `index.html`),
  a la espera del texto exacto y definitivo.
- **Switch de "Cognición Aumentada"** — se va a rediseñar. El HUD de
  coordenadas (`.hud`, `.hud__reg`, `.hud__coord`) es un elemento aparte y
  no está en rediseño.

## Correr en local

```
python -m http.server 4174
```
`http://localhost:4174` — parámetros de depuración: `?static=1` fuerza la
versión sin movimiento.

## Repo

Público en GitHub: `jsmmdz/guia-de-campo-creador-digital`, rama `main`.
