# Arquitectura y rendimiento

> Stack, estructura de archivos y todo lo relativo a peso/carga. Aplica a todo el sitio, no a un nodo.
> Extraído literal de CLAUDE.md el 2026-07-26. Fuente de verdad de contenido y narrativa: el vault en DOCUMENTOS/.

## Stack

HTML/CSS/JS planos. GSAP 3.12.5 + ScrollTrigger por CDN (jsdelivr), sin
bundler ni framework. Un solo `script.js` en un IIFE, un solo `styles.css`.

**Excepción puntual — OGL (WebGL) para el fondo de estrellas del Nodo 0:**
`initGalaxy()` en `script.js` carga `ogl` por `import()` dinámico desde
`esm.sh` (no rompe "sin bundler": `import()` dinámico funciona dentro de un
script clásico, no exige `type="module"`). Si el CDN falla, el `.catch()`
no hace nada — queda el radial-gradient + sweep de CSS que `.threshold` ya
tenía de fondo, no se rompe la página. Versión portada y reutilizable, con
comentarios, en `RECURSOS/galaxy.js` + `.css` (fuera del repo, ver
`industrias y creacion/RECURSOS/`). Fuente original:
reactbits.dev/backgrounds/galaxy.

**Excepción puntual — Three.js para el texto ASCII animado de "Digital"
(Nodo 0):** `initAsciiText()` en `script.js` carga `three` por `import()`
dinámico desde `esm.sh`, mismo patrón que OGL. Si el CDN falla, el texto
real de "Digital" (siempre en el DOM) se mantiene visible — nunca se
desvanece hasta que la promesa de `initAsciiText()` confirma que el
montaje terminó con éxito (clase `is-ready` en
`.threshold__title-digital`). Versión portada y reutilizable, con
comentarios, en `RECURSOS/ascii-text.js` + `.css`. Fuente original:
reactbits.dev/text-animations/ascii-text.

**Dependencia de sitio completo — Lenis (scroll suave), desde el Nodo 3:**
a diferencia de OGL/Three.js (acotadas a un `initX()` del Nodo 0), Lenis se
monta una sola vez, global, sincronizada con GSAP/ScrollTrigger vía
`initLenis()` en `script.js` (llamada junto a `initTerritory()`/
`initMethod()` al final del IIFE):
```js
const lenis = new Lenis({ smoothWheel: true, syncTouch: false });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```
`<script>` con versión exacta fijada (nunca `@latest`) e `integrity` (SRI)
en `index.html`, cargado antes que `script.js` — si el CDN cae,
`window.Lenis` queda `undefined`, `initLenis()` corta en la primera línea y
el sitio sigue con scroll nativo, sin estado de error visible.
**Verificado en navegador real** (no solo leído en el código) que esto NO
desincroniza el pin del Catálogo ni sus blobs WebP, ni ninguno de los 5
pines de Territorio — si algún cambio futuro en alguno de esos tres nodos
"pierde sincronía" con el scroll, sospechar primero de este ticker
compartido antes que del código propio de ese nodo. La salida documentada
si eso pasa (Ruta Técnica de Método) es bajar Lenis a alcance parcial
(`new Lenis({ wrapper, content })` desde `#method` hacia abajo) en vez de
pelear la sincronización global.

## Estructura

```
index.html
styles.css
script.js
assets/
  home/          8 fotos de herramientas — WebP, 340px de ancho (fuente
                 real 1122×1402, ver "Optimización de carga" más abajo)
  disciplinas/   frames/<edge>/NNNN.webp — ver convención de nombres y
                 "Optimización de carga" más abajo
```


## Optimización de carga (móviles de gama media / datos móviles)

- **Assets de `assets/disciplinas/frames/` y `assets/home/` recomprimidos a
  WebP** (antes PNG): 214MB → ~18MB para los frames de edge. Las fotos de
  `home` usan `libwebp -quality 95` (elegida por el usuario tras comparar
  contra q78/q95/lossless — a q78 el ahorro era mayor pero con suavizado
  perceptible en zoom; a q95 es indistinguible del original).

  **Frames de edge: 1280×720 completo, q85.** No se recortan. El recorte
  cuadrado a 720×720 que tuvieron antes se justificaba diciendo que
  coincidía con el `object-fit:cover` de `.hero-canvas` y que no se perdía
  nada — era falso: los elementos que flotan alrededor del blob viven en
  los 280px de cada costado y salían visiblemente cortados. q85 compensa
  el área extra (18MB, menos que los 28MB del set cuadrado a q95).
  Extracción en una pasada desde el `.mp4`, sin PNG intermedio:
  ```
  # verde 0x4CED46 (edges 01-02, 02-03, 03-04) · azul 0x214FF6 (04-05, 05-06)
  ffmpeg -i "VIDEOS/<clip>.mp4" -vf "chromakey=<key>:0.15:0.05,format=rgba" \
    -r 12 -start_number 0 -c:v libwebp -lossless 0 -quality 85 \
    -compression_level 6 "frames/<edge>/%04d.webp"

  # fotos de home (por archivo, preserva aspect-ratio real 1122:1402)
  ffmpeg -i tool.png -vf "scale=340:-1" \
    -c:v libwebp -lossless 0 -quality 95 -compression_level 6 tool.webp
  ```
  Los colores de croma están medidos del fondo real de cada clip, no
  supuestos. El mapeo edge → clip está en `docs/nodo-1-catalogo.md`.
- **`initGalaxy`/`initAsciiText` no se llaman con conexión realmente
  limitada** (`script.js`, `isConstrained` cerca de `motionOK`/`mobileMQ`):
  `navigator.connection.saveData` o `effectiveType` en `slow-2g`/`2g` —
  **SOLO señales de conexión, nunca de hardware**. Una primera versión
  también chequeaba `deviceMemory<=4` / `hardwareConcurrency<=4` y apagaba
  las animaciones en casi cualquier celular de gama media (la mayoría
  reporta exactamente 4GB/4 núcleos) — contradice la decisión "el sitio
  anima siempre" de más arriba; no reintroducir. Ambos efectos son WebGL
  puro decorativo con fallback ya existente si el CDN falla (gradient/
  sweep de CSS, texto real de "Digital") — saltarlos reusa ese mismo
  camino, no hay estado nuevo. `navigator.connection` no existe en
  Safari/iOS, ahí queda simplemente en `false`.
- **`pointerFxOK`** (ver "Decisiones de diseño" más arriba): mecanismo
  distinto y más liviano que `isConstrained` — no salta el montaje de
  `initGalaxy`/`initAsciiText`, solo la interactividad de mouse/touch, en
  móvil/tablet (`mobileMQ`, ≤1023px) sin importar la conexión.
- **Galaxy y la órbita de íconos se pausan cuando el Umbral sale de
  pantalla, en TODOS los breakpoints** (no solo mobile): investigación de
  lag encontró que ninguno de los dos efectos tenía guard de visibilidad —
  corrían para siempre (60fps) aunque el usuario ya estuviera scrolleado
  en el Catálogo, compitiendo por el mismo frame budget que su propio
  scroll-jacking + scrub de video. Se enganchó `onEnter`/`onEnterBack`
  (reanudar) y `onLeave`/`onLeaveBack` (pausar) al mismo `ScrollTrigger`
  del pin de `thresholdTl` — mismo patrón que ya usaba el Catálogo
  (`setInCatalog`) para su propio scroll-jacking. `setThresholdVisible()`
  en `script.js` centraliza el toggle de ambos: `galaxyHandle.pause()/
  resume()` (nuevo, `initGalaxy` ahora devuelve un handle en vez de
  ser fire-and-forget) y `gsap.ticker.remove/add(orbitTick)` (el callback
  de la órbita pasó de arrow inline a función con nombre para poder
  sacarlo/ponerlo del ticker). Ninguno de los dos efectos se apaga
  visualmente — solo dejan de gastar CPU/GPU cuando de verdad no se ven.
  Verificado con `gsap.ticker.tick()` + `ScrollTrigger.update()` forzados a
  mano (el entorno de preview no compositea frames reales sin la pestaña
  visible, así que el loop normal de rAF no se puede observar esperando).
  También se le agregó debounce (~200ms, mismo patrón que ya usaba el
  resize del catálogo) al listener de `resize` de Galaxy, que antes
  llamaba `renderer.setSize()` en cada evento crudo — los navegadores
  móviles disparan varios `resize` seguidos al ocultar/mostrar la barra de
  direcciones durante el scroll, justo la interacción reportada como
  lenta.
- **Google Fonts ya no se carga con `@import` dentro de `styles.css`**: un
  `@import` bloquea la construcción del CSSOM hasta que ese round-trip
  completa, antes de que cualquier estilo del archivo aplique. Ahora es
  `<link rel="preconnect">` (×2, googleapis + gstatic) + `<link
  rel="stylesheet">` en el `<head>` de `index.html`, en paralelo con
  `styles.css`.
- **Fuera de alcance a propósito**: el historial de git todavía tiene los
  PNG viejos pesados (no se reescribió — requeriría force-push, decisión
  aparte).


