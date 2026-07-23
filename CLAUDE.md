# Guía de Campo del Creador Digital — Acto I

Contexto de ingeniería para trabajar en este repo. El plan de contenido y la
especificación técnica completa (los 5 nodos, el sistema de Bitácora Oculta,
el banco de fragmentos de entrevistas) viven fuera de este repo, en el vault
de Obsidian del proyecto: `DOCUMENTOS/Vault - Guía de Campo/` — en particular
`Plan de Desarrollo y Especificacion Tecnica.md` y `Plan de Produccion -
Orden de Trabajo (2026-07-12).md`. Este archivo NO los reemplaza: cubre
**estado actual de este repo, decisiones de implementación tomadas y errores
ya corregidos** para que un agente nuevo no los repita. Ante cualquier duda
de contenido, narrativa o mecánica no resuelta aquí, el vault es la fuente
de verdad.

## Antes de hacer commit

Mostrar el mensaje propuesto y el resumen de archivos/cambios, y esperar
confirmación explícita del usuario antes de correr `git commit` — incluso
cuando el usuario ya pidió "hacé un commit" en el mismo turno. Nunca
commitear primero y mostrar después.

## Qué es esto

Sitio scrollytelling estático (sin build step) para la carrera de Creación
Digital — Universidad El Bosque. "Acto I" es la etiqueta de este primer
tramo de construcción — cubre, con nombres propios de implementación, los
dos primeros de los 5 nodos que define el vault:

- **Nodo 0 — Umbral** (`#threshold`): implementa "Nodo 0 · Umbral" del
  vault — título ancla, constelación de las 8 herramientas de la carrera
  orbitando, copy de 5 pilares revelado por scroll, cierre "Exploremoslo
  Juntos", fondo de estrellas animado (`.threshold__galaxy`, ver Stack). El
  rastro de cursor tipo cometa que tenía antes se retiró (no era
  definitivo); ese lugar lo
  ocupa ahora el fondo de estrellas. La palabra "Digital" del título se
  renderiza como arte ASCII animado con Three.js, reactivo al mouse (ver
  Stack).
- **Nodo 1 — Catálogo** (`#catalog`): implementa "Nodo 1 · Perfil" del
  vault (seis competencias híbridas del Creador Digital) — construido como
  "catálogo de especímenes" siguiendo la metáfora de guía de campo
  naturalista del resto del sitio (HUD, "Registro N.01", especímenes en
  órbita del Nodo 0). 6 placas de disciplina en carrusel horizontal, blob
  por disciplina generado por código que muta entre tarjetas, fondo
  reactivo al color de la activa. **Nombre sin confirmar con el vault** —
  "Catálogo" no aparece en el plan de desarrollo; si se documenta ahí
  también, usar el mismo término en ambos lados.

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

## Decisiones de diseño (no reabrir sin razón)

- **Tipografía**: una sola familia (Archivo) — itálica-black para títulos,
  regular/medium para cuerpo. El spec de Acto I pide explícitamente "la
  misma familia" para títulos y cuerpo (a diferencia del spec de home
  original, que pedía dos familias distintas).
- **Motion por defecto**: el sitio anima siempre, **ignora
  `prefers-reduced-motion`** — decisión de producto explícita del usuario.
  Quien quiera la versión calma la pide con `?static=1`.
- **Breakpoints** (fijos, también en el header de `styles.css`): móvil
  ≤767 · tablet 768–1023 · laptop 1024–1439 (tier base, sin `@media`) ·
  desktop 1440–1919 · pantallas grandes ≥1920.
- **Catálogo — scroll-jacking con pin en TODOS los breakpoints por
  defecto** (`setupEnhanced()` en `script.js`): `catalogSimple` depende
  únicamente de `motionOK` (nunca de `mobileMQ`) — el input es 100% scroll
  vertical incluso en touch, porque el `pin` de ScrollTrigger traduce
  scroll vertical normal en desplazamiento horizontal visual del carril
  sin exigir swipe, a pedido explícito para que mobile tenga el mismo
  efecto visual que laptop+.
  **Riesgo aceptado, no resuelto — probar en dispositivo real**: la razón
  original para separar mobile/tablet (scroll-snap horizontal en vez de
  pin) era que el pin podría chocar con el gesto nativo de "volver atrás"
  deslizando desde el borde en navegadores móviles. Se decidió probarlo
  igual; si se rompe en un celular real, la opción de volver a separar
  mobile/tablet (con `setupSimple()`, ver abajo) sigue disponible y ya
  está implementada.
  `setupSimple()` (fallback de `motionOK=false`, o sea `?static=1`; ya no
  es una rama de mobile/tablet): apila las 6 tarjetas verticalmente, SIN
  pin ni swipe horizontal. Un `ScrollTrigger` sin `pin` (`trigger:
  catalog, start:"top top", end:"bottom bottom"`) traduce el scroll
  vertical en `self.progress * (plates.length-1)` — mismo cálculo que
  `setupEnhanced()` — pasado a `applyProgress()`, que decide `in-catalog` y
  el progreso juntos, en un solo ScrollTrigger.
  Historial (no reintroducir, ya reemplazadas): (1) `IntersectionObserver`
  — solo producía índices enteros, nunca progreso fraccional, el video de
  transición nunca se disparaba; (2) scroll-snap horizontal con progreso
  derivado de `catalog.scrollLeft` — el video sí funcionaba, pero el
  scroll-snap cortaba en seco el scroll vertical de la página al llegar al
  catálogo (el problema que motivó pasar a stack vertical, y que dejó de
  importar para mobile/tablet en cuanto se unificó todo bajo
  `setupEnhanced()`).
- **Transiciones reales de blobs — 5/5 edges resueltos.** No es un video
  por disciplina: son videos de transición ENTRE tarjetas consecutivas
  ("edges"), reproducidos como secuencia de frames WebP con alfa real
  (recorte por croma verde/azul, no `video.currentTime` — técnica portada
  de `RECURSOS/blobsite/index.html`, sin latencia de seek, scrub fluido en
  ambas direcciones). Con 6 tarjetas hay 5 edges posibles, los 5 cubiertos:
  `01-02` (UX/UI→3D), `02-03` (3D→Software), `03-04` (Software→Game),
  `04-05` (Game→Multimedia, croma azul — el blob de Multimedia ya es
  verde-amarillento, `--spec-5`, choca con croma verde), `05-06`
  (Multimedia→IA, croma azul por el mismo motivo). Convención:
  `assets/disciplinas/frames/<edge>/0000.webp`…`NNNN.webp`, 62 frames cada
  uno (clips de ~5s, extraídos a 12fps con `ffmpeg -i clip.mp4 -vf
  "chromakey=<color>:0.15:0.05,format=rgba" -r 12 -start_number 0
  frames/<edge>/%04d.png`, recomprimidos después a WebP 720×720 — comando
  exacto en "Optimización de carga"). `has-feed` es solo-agregar: una vez
  que una tarjeta muestra video real se queda así para siempre, el blob
  nunca vuelve (coincide con el flujo del sitio de referencia). Se activa
  ON en ambas tarjetas del edge activo, toggleado en `applyProgress()`,
  nunca se apaga. Config y carga perezosa por proximidad (±1 edge) en
  `EDGE_FEEDS` / `ensureEdgeFeedLoading()` / `scrubEdgeFeed()` en
  `script.js` — ojo con `ctx.clearRect()` antes de cada `drawImage()`: con
  alfa real, sin el clear queda "fantasma" del frame anterior en las zonas
  transparentes.
- **Reveal letra por letra del copy de 5 pilares (`.threshold__reading`)**:
  portado desde reactbits.dev/text-animations/blur-text ("BlurText") a
  vanilla — `splitBlurText()` en `script.js` (versión reutilizable
  comentada en `RECURSOS/componentes/texto-storytelling.js` +
  `RECURSOS/docs/TEXTO-STORYTELLING.md`). El original dispara la animación
  una sola vez con su propio `IntersectionObserver`; acá NO se usó ese
  mecanismo — `splitBlurText()` solo separa el texto en spans y deja el
  estado inicial (blureado + corrido), y el reveal en sí queda enganchado
  al mismo `thresholdTl` con scrub que ya pinea todo el Nodo 0, sumado
  (no en reemplazo) al fade de opacidad 0.08→1 que cada `.threshold__fragment`
  ya tenía — ver error #5 más abajo: cualquier reveal de esta sección debe
  colgar del scroll real vía ese timeline, nunca de un observer aparte.
  `animateBy` quedó en "letters" (así estaba configurado en la URL de
  origen citada en el .md); distancia de entrada y blur bajados de los
  defaults del demo (50px/10px → 20px/8px) para no chocar con el resto del
  motion, ya más contenido, del sitio. El `<span class="threshold__emoji">`
  de cada fragmento (que ya tiene su propio vuelo animado) queda intacto:
  `splitBlurText()` solo toca nodos de texto, nunca elementos hijos
  existentes. Estructura de DOM en dos niveles, palabra > letra
  (`.threshold__word` > `.threshold__letter`), no una lista plana de
  letras — ver error #17: sin el contenedor de palabra con
  `white-space:nowrap`, el navegador parte palabras a la mitad al hacer
  wrap.
- **Blobs del catálogo**: SVG generado en JS, no assets. Los 6 paths usan
  la *misma estructura de comandos* (`M` + 8×`C` + `Z`, ver `blobPath()`
  en `script.js`) para poder interpolarse en caliente con
  `gsap.utils.interpolate` sin plugin de morph.
- **Órbita de íconos**: radio calculado desde `Math.min(innerWidth,
  innerHeight)`, no desde ancho y alto por separado (si se separan, la
  órbita queda ovalada en pantallas anchas). Cada chip se centra sobre su
  punto de órbita con `xPercent:-50, yPercent:-50` (ver error #15) — sin
  eso, el punto trasladado es la esquina superior-izquierda del chip, no
  su centro visual. Factor de radio: 0.47/0.40 (rx/ry) en `narrow`
  (`mobileMQ`, ≤1023px — móvil+tablet) y 0.52/0.45 el resto (laptop en
  adelante) — valores elegidos para que ningún breakpoint pase más de
  ~30-34% del giro con el ícono parcial o totalmente fuera de pantalla
  (medido analíticamente, ver error #15).
- **Sin marco en los íconos de herramientas**: las imágenes se muestran tal
  cual vienen (sin circular/cuadrar, sin `object-fit: cover`, sin tinte de
  color) — decisión explícita del usuario, no reintroducir bordes/fondos.
- **Config del fondo galaxy** (`initGalaxy`, objeto `cfg` en `script.js`):
  `density: 2.5, hueShift: 0, saturation: 0.1, speed: 0.8, starSpeed: 0.2,
  glowIntensity: 0.3, twinkleIntensity: 0.1, rotationSpeed: 0.05,
  repulsionStrength: 1` — valores elegidos a mano por el usuario probando
  en el sitio de origen, no son los defaults del componente. El shader no
  usa HSL estándar: `uHueShift` rota un tono pseudoaleatorio por estrella
  (no fija un color único), y con `saturation` baja (0.1 acá) el resultado
  se mantiene cerca del blanco/gris sin importar el hue — por eso esta
  combinación no choca con la paleta del sitio aunque el hue sea distinto
  al azul-violeta exacto de `--signal`. Si se cambia, probar siempre
  visualmente antes de asumir el resultado — el mapeo no es intuitivo.
- **Cámara del efecto ASCII de "Digital"** (`initAsciiText`, `CanvAscii`
  en `script.js`): perspectiva con FOV 18° y distancia calculada
  (`cameraDistance()`) para que el frustum a z=0 mida exacto los píxeles
  del contenedor (1 unidad de mundo = 1px CSS) — ni el FOV 45° del demo
  original (el borde cercano crecía ~35% al rotar y recortaba las letras
  contra el frustum) ni una cámara ortográfica (sin distorsión de
  perspectiva, la rotación deja de verse). El plano se dimensiona según un
  elemento de referencia (`refEl`, el wrapper `.threshold__title-digital`,
  tamaño real de la palabra) y NO según el contenedor que renderiza (`ctn`,
  deliberadamente ~36% más grande vía `inset` negativo en CSS + `overflow:
  hidden` en el wrapper) — así el texto ocupa su tamaño completo (igual a
  "Creador") y la rotación/onda tienen frustum de sobra para moverse sin
  recortar contra su propio borde; lo que se pasa de la caja original lo
  recorta limpio el `overflow:hidden`, no un artefacto de WebGL. Patrón
  documentado como reutilizable en el header de `RECURSOS/ascii-text.js`.
- **Interactividad de puntero de galaxy/texto ASCII desactivada en
  móvil/tablet** (`pointerFxOK` en `script.js`, junto a `isConstrained`):
  en pantallas ≤1023px (mismo corte que `mobileMQ`) ninguno de los dos
  efectos reacciona al mouse/touch — decisión explícita del usuario,
  quedaba pesado en mobile. El efecto visual en sí (fondo de estrellas
  animado, texto ASCII con onda) se mantiene igual en todos los
  breakpoints; lo único que se saca ahí es el listener (`mousemove` en
  `initGalaxy`, `mousemove`/`touchmove` en `initAsciiText`) que dispara la
  repulsión de estrellas y la rotación/hue-rotate del texto. En laptop+
  sigue reaccionando al mouse exactamente como antes. Ojo: esto NO baja el
  costo del render loop en sí — el WebGL sigue dibujando cuadro a cuadro
  igual en mobile con o sin listener, porque `uMouse`/`uMouseActiveFactor`
  (galaxy) y `this.mouse`/`filter.mouse` (ASCII) ya quedan neutros por
  defecto sin necesidad de tocar el loop. Si el peso persiste, el próximo
  paso sería saltar `initGalaxy`/`initAsciiText` por completo en
  móvil/tablet (mismo mecanismo que ya usa `isConstrained` más abajo), no
  solo la interactividad.

## Errores ya corregidos (no reintroducir)

| # | Bug | Causa | Fix / regla |
|---|-----|-------|--------------|
| 1 | Constelación partida en 5+3 | Versión heredada del spec de home viejo tenía Ps/Blender/Ai en fila estática aparte | Los 8 íconos van TODOS en `.threshold__field` orbitando juntos — el spec de Acto I pide una sola constelación |
| 2 | Tinte azul en GitHub/Unreal | `mix-blend-mode: color` sobre esos íconos se veía mal con fotos reales (no logos monocromos) | Se quitó ese blend-mode en esos íconos |
| 3 | Imágenes recortadas a cuadrado | Fotos fuente son 1122×1402 (verticales) | El frame usa `aspect-ratio: 1122/1402` + `object-fit: contain`, nunca un contenedor cuadrado con `cover` |
| 4 | Retry-storm de videos 404 | El handler de `error` borraba la entrada de `feedState` (Map); cada vez que la tarjeta volvía a ser vecina se reintentaba la descarga | NO borrar la entrada — dejarla con `ready:false` para siempre |
| 5 | `in-catalog` se activaba al cargar la página (`setupSimple()`, con el diseño viejo de carril horizontal — hoy `setupSimple()` es el fallback de `?static=1`) | El `IntersectionObserver` viejo (`root: catalog`) disparaba sin importar si el catálogo estaba fuera del viewport de la página. Ya no existe ese observer: el catálogo simple ahora apila las tarjetas verticalmente y un único `ScrollTrigger` sin `pin`, atado al scroll vertical real de la página (ver "Catálogo" en Decisiones de diseño), decide progreso e `in-catalog` juntos — es seguro combinarlos ahí porque, a diferencia del observer viejo, ese `ScrollTrigger` sí sabe si el catálogo está realmente en el viewport de la página | Regla vigente: `in-catalog` lo controla ÚNICAMENTE `simpleBoundaryST`. Cualquier mecanismo de progreso cuyo disparo sea independiente de la posición real del catálogo en la página nunca debe tocar `in-catalog` — solo debe llamar `applyProgress()`, nunca `setInCatalog()` |
| 6 | `<canvas>` no se estira con `inset` solo | Elementos reemplazados (`canvas`, `img`, `video`) usan su tamaño intrínseco (300×150 en canvas) si no se fuerza | Dar `width`/`height` explícitos en CSS además de `inset` |
| 7 | Cache del navegador durante desarrollo activo | `styles.css`/`script.js` quedaban cacheados por el navegador | Referenciarlos con `?v=N` en `index.html` y subir la versión al editarlos |
| 8 | Body queda "animado" con contenido escondido para siempre (sin JS que lo revele) si el CDN falla | `body.classList.add("enhanced")` corría antes de confirmar que GSAP cargó | Solo agregar la clase tras confirmar la carga de GSAP |
| 9 | Desfase entre `<canvas>` y `<pre>` en el efecto ASCII | La grilla de columnas/filas se medía con `measureText()` de un canvas 2D, pero el `<pre>` visible renderiza con las métricas de fuente reales del DOM (pueden diferir: cara de fuente aún no cargada, CSS heredado que `measureText` no ve) | Medir con un `<span>` de sonda dentro del propio `<pre>` (`AsciiFilter.reset()`); cargar también la cara 400 de IBM Plex Mono (la que usa el `<pre>`) antes de medir — antes solo se cargaban 500/600 |
| 10 | `<pre>` del ASCII heredaba estilos del `<h1>` | `italic`/`uppercase`/`letter-spacing`/`text-shadow` cambian el ancho de los glifos y hasta qué carácter se ve (`uppercase`) | `.ascii-text-container pre` neutraliza estas herencias explícitamente en `styles.css` |
| 11 | Rotación por mouse sin acotar en el efecto ASCII | El demo original de reactbits asume un contenedor a pantalla completa donde el cursor casi no sale de sus límites; sobre una sola palabra se sale todo el tiempo, y sin clamp `mapRange` extrapolaba el ángulo sin límite (rotación absurda, geometría plegada sobre sí misma) | Acotar el mouse a los límites del contenedor visual antes de mapear a rotación (`updateRotation()`) |
| 12 | `ResizeObserver` puede no disparar nunca su primer callback (confirmado en al menos un entorno real de prueba) | El montaje del efecto ASCII no puede depender solo de él | Medición inmediata de respaldo (`getBoundingClientRect`) si el contenedor ya mide algo real al momento de llamar `initAsciiText()` |
| 13 | Redibujar una textura estática en cada frame | El efecto ASCII volvía a dibujar el texto "DIGITAL" en un canvas 2D y a resubirlo a la GPU en cada frame, aunque el texto nunca cambia (desperdicio de CPU/GPU, más notorio con `asciiFontSize` bajo) | Dibujar una sola vez al montar (`setMesh()`) |
| 14 | `.catalog__hero` (blob fijo del catálogo) se veía centrado sobre el Umbral | Es `position:fixed` sin regla que lo ocultara fuera del catálogo (a diferencia de `.field-bg`, que ya usaba `body.in-catalog`). En laptop+ "no se notaba" solo porque el pin de ScrollTrigger sobre `.catalog` le da a ese ancestro un efecto de `will-change`/transform que de casualidad contiene el `fixed` del blob dentro de su propia caja — no por diseño. En modo simple (móvil/tablet, sin pin) no hay ese efecto secundario, así que aparecía centrado en pantalla desde el primer frame | `opacity:0` + `body.in-catalog .catalog__hero {opacity:1}`, mismo patrón que `.field-bg` |
| 15 | Órbita de íconos con excesivo clipping en móvil/tablet | Dos causas combinadas: (a) `gsap.set(el, {x, y})` trasladaba la esquina superior-izquierda del chip al punto de órbita, no su centro visual (corregido con `xPercent:-50, yPercent:-50`, ver bullet "Órbita de íconos" más arriba); (b) el factor de radio `narrow` (antes solo `innerWidth<=767`, tablet no entraba en esa rama) era **mayor** que el de desktop (0.62/0.54 vs 0.58/0.5) — al revés de lo que compensaría una pantalla ya más angosta. Medido analíticamente (mismo cálculo que el código, con el tamaño real de frame por breakpoint): móvil pasaba 53.6% del giro con un ícono fuera de pantalla, tablet 44.6%, vs ~29% en laptop/desktop/large (ya aceptado) | (a) `xPercent:-50, yPercent:-50`; (b) `narrow` ahora usa el mismo corte que `mobileMQ` (≤1023, móvil+tablet juntos) con factores 0.47/0.40, bajando a ~30-34% |
| 16 | Nota "Cognición Aumentada" (`.sensor-note--title`) superpuesta con la flecha de scroll (`.threshold__nudge`) en móvil | El override de `@media (max-width:767px)` la anclaba a `bottom:26%`, un porcentaje fijo sin relación con dónde cae realmente la flecha (centrada por flexbox, con rebote ±10px) — se superponían ~4-14px | Bajado a `bottom:18%` |
| 17 | BlurText (`splitBlurText()`, reveal letra por letra de "reading") partía palabras a la mitad al hacer wrap ("complejos" → "co" / "mplejos"), en todos los breakpoints, no solo móvil | Una lista plana de `<span class="threshold__letter">` (uno por letra, sin agrupar) permite que el navegador inserte un punto de corte de línea entre dos `inline-block` adyacentes aunque no haya espacio en blanco entre ellos — se tratan como cajas atómicas sueltas, no como parte de la misma palabra | Envolver cada palabra en un `<span class="threshold__word">` con `white-space:nowrap` (contenedor atómico); las letras quedan adentro. El navegador solo puede partir línea antes/después de una palabra completa, nunca entre sus letras |

## Optimización de carga (móviles de gama media / datos móviles)

- **Assets de `assets/disciplinas/frames/` y `assets/home/` recomprimidos a
  WebP** (antes PNG): 214MB → ~28MB. Los frames de edge se recortan además
  a 720×720 (cuadrado) en vez de 1280×720 — coincide con el
  `object-fit:cover` real de `.hero-canvas`, no se pierde nada que el
  cliente no recortara ya. Calidad `libwebp -quality 95` (elegida por el
  usuario tras comparar contra q78/q95/lossless — a q78 el ahorro era
  mayor pero con suavizado perceptible en zoom; a q95 es indistinguible
  del original). Pipeline (recomprime los PNG ya extraídos por chromakey,
  no rehace la extracción desde los `.mp4`):
  ```
  # frames de edge (por archivo, ver assets/disciplinas/frames/<edge>/NNNN.png)
  ffmpeg -i NNNN.png -vf "scale=720:720:force_original_aspect_ratio=increase,crop=720:720" \
    -c:v libwebp -lossless 0 -quality 95 -compression_level 6 NNNN.webp

  # fotos de home (por archivo, preserva aspect-ratio real 1122:1402)
  ffmpeg -i tool.png -vf "scale=340:-1" \
    -c:v libwebp -lossless 0 -quality 95 -compression_level 6 tool.webp
  ```
  Si se regeneran frames nuevos desde los `.mp4` (chromakey), correr este
  segundo paso sobre el PNG recién extraído antes de commitear.
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
- **Google Fonts ya no se carga con `@import` dentro de `styles.css`**: un
  `@import` bloquea la construcción del CSSOM hasta que ese round-trip
  completa, antes de que cualquier estilo del archivo aplique. Ahora es
  `<link rel="preconnect">` (×2, googleapis + gstatic) + `<link
  rel="stylesheet">` en el `<head>` de `index.html`, en paralelo con
  `styles.css`.
- **Fuera de alcance a propósito**: el historial de git todavía tiene los
  PNG viejos pesados (no se reescribió — requeriría force-push, decisión
  aparte).

## Pendiente

- **El switch actual ("Cognición Aumentada") NO es la Bitácora Oculta del
  vault — falta construir el componente real.** Hoy `#sensor` es un
  toggle simple (`sensor-on`, OFF/ON) que revela 3 `<aside class="sensor-
  note">` sueltos (título, órbita, placa) con una frase corta cada uno. El
  vault (`Plan de Desarrollo y Especificacion Tecnica.md`, sección 1.2)
  especifica algo más grande y ya con nombre fijo, **"Bitácora Oculta"**
  (nunca "Cognición Aumentada" — ese nombre no aparece en el vault; el
  nombre viejo y ya reemplazado en el vault era "Modo Rayos X"):
  - Panel con copy fijo: título *Bitácora Oculta*, cuerpo *"Aquí descansa
    la deconstrucción de cada decisión, cada código rechazado y cada
    prompt que dio forma a la realidad que acabas de navegar"*, llamado
    *"Explora bajo tu propio riesgo"*, cierre *"Una vez que veas cómo se
    creó este mundo, ya no podrás verlo igual"*.
  - Por nodo, 5 subsecciones fijas: Génesis / Instrucción / Síntesis
    técnica / Datos / Hallazgos (ver tabla completa en el vault).
  - Toggle global y persistente — no puede reiniciar el estado de scroll
    de la mecánica activa (p. ej. a mitad del scroll-jacking del Nodo 1).
  El Plan de Producción (`Plan de Produccion - Orden de Trabajo
  (2026-07-12).md`) lo marca como tarea **Fase 0 [GRÁFICO]** — la primera
  pieza gráfica pendiente, antes que assets de nodos individuales — porque
  se repite igual en los 5 nodos y conviene resolverla una sola vez como
  componente reutilizable. El HUD de coordenadas (`.hud`, `.hud__reg`,
  `.hud__coord`) es un elemento aparte, no forma parte de este componente.
- **Copy final de las 6 placas del catálogo** — el actual es un borrador
  provisional (marcado con comentario `COPY PROVISIONAL` en `index.html`),
  a la espera del texto exacto y definitivo.
- **Efecto ASCII de "Digital" — `asciiFontSize` de mobile bajado de 10 a 6**
  (probado en 5, el usuario pidió subirlo un punto a 6). A 10px el
  contenedor real en mobile (~64px de alto) sólo alcanzaba ~6 filas de
  grilla (~4 útiles) — muy poca resolución vertical para 7 letras, se leía
  como ruido, no como "DIGITAL" (reportado por el usuario). A 6px la
  grilla sube a ~10-11 filas y las 7 letras se distinguen (confirmado
  leyendo el `textContent` real del `<pre>` en un viewport de 375px vía
  navegador embebido, a probar todavía en un dispositivo físico real).
  `asciiFontSize` en laptop+ queda en 8 sin cambios (ya confirmado por el
  usuario ahí). Subir la grilla sube el número de celdas que procesa
  `asciify()` por frame en mobile — costo absoluto sigue siendo chico,
  pero si la investigación de performance en curso muestra que ese loop
  sí pesa, reconsiderar este valor junto con esa mejora.

## Correr en local

```
python -m http.server 4174
```
`http://localhost:4174` — parámetros de depuración: `?static=1` fuerza la
versión sin movimiento.

Nota: el server `"home"` ya configurado en `../.claude/launch.json` (para el
navegador integrado de Claude Code) corre en el puerto 8137 desde la carpeta
padre (`industrias y creacion/`, no desde este repo) — con ese, la URL es
`http://localhost:8137/PROYECTO%20DEFINITIVO/index.html`, no la raíz.

## Repo

Público en GitHub: `jsmmdz/guia-de-campo-creador-digital`, rama `main`.
