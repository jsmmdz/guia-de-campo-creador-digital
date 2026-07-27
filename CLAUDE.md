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
- **Nodo 2 — Territorio** (`#territory`): implementa "Nodo 2 · Territorio"
  del vault — el mercado creativo-tecnológico como tres altitudes reales
  (Suelo, Ladera, Cima) que se recorren de abajo hacia arriba, cada una con
  menos gente y más poder de fijar las reglas. 5 tramos con scroll-jacking
  pineado (Intro · Suelo · Ladera · Cima · Cierre), cada uno paginado en
  capas que se cruzan en fundido (`initTerritory()` en `script.js`, función
  propia dentro del IIFE para no chocar con el Catálogo). Cada nivel repite
  la misma estructura: nombre → intro narrativa en zigzag → frase de cierre
  → ficha técnica (panel completo, nunca campo por campo) → nota de campo
  (+ callout en Suelo/Ladera, Cima no tiene). Cierra con una comparativa de
  las 3 fichas juntas y un remate. **Primera versión construida en una
  sesión de agentes en paralelo (workflows) siguiendo al pie de la letra
  los specs del vault y evitando los errores ya documentados de un intento
  anterior** (`Spec - Nodo 2 Territorio (correcciones de
  implementacion).md`), y después depurada con verificación real en
  navegador (no solo medición de DOM/CSS — ver errores #20-23). **Sigue
  pendiente confirmar la diagramación exacta contra las capturas de Figma**
  (el conector de Figma no estaba autorizado en esa sesión) — ver
  Pendiente.
- **Nodo 3 — Método** (`#method`): implementa "Nodo 3 · Método" del vault —
  qué es la investigación-creación, explicado sin jerga académica: doce
  bloques en columna fija (marquee → apertura narrativa → término →
  definición → Diagrama 01 contraste metodológico → inversión → aterrizaje
  → pregunta bisagra → Diagrama 02 las cuatro condiciones de Frascati →
  tarjeta Makro (`PRÓXIMAMENTE`) → cita destacada de Melisa Ballesteros →
  remate). **El nodo más simple del sitio a propósito** (ver Ruta Técnica
  del vault, §Advertencia de alcance): a partir de acá no hay
  GSAP/ScrollTrigger/pin/scroll-jacking — `initMethod()` en `script.js` es
  un `IntersectionObserver` binario para el reveal de entrada y `@keyframes`
  CSS puro para el marquee, nada más. **Primero construido y probado
  aislado en `PRUEBAS/Prototipo - Nodo 3 Método (alta fidelidad)/` (workflow
  de build + auditoría en paralelo + fix), después integrado acá** una vez
  verificado en navegador real. Tipografía recalibrada con datos exactos de
  Figma a mitad de sesión (ver "Método — tipografía" en Decisiones de
  diseño) — no quedó nada de la escala original inventada a partir de la
  sola regla ordinal del spec.
- **Nodo 4 — Voces** (`#voices`): implementa "Nodo 4 · Voces" del vault —
  patrón compuesto "Acordeón de perfil" (`Plan de Desarrollo y
  Especificacion Tecnica.md` §1.3). Dos entrevistas reales (Melisa
  Ballesteros, Juan David Aristizábal) presentadas en Diagrama 01 (dos
  bloques de color con inicial, full-width), luego cada una con su propio
  acordeón (5 filas Melisa, 4 filas Juan David — la 4ta, "Consejos de
  oficio", es una fila compuesta con 3 áreas EQUIPO/FINANZAS/PITCH, no 3
  filas separadas), bisagra hacia la primera persona, conclusión personal
  de Junior Mejía (bloque grande, acordeón de 5 filas sin cita), sub-bloque
  "Qué técnica o método rescato de cada entrevista" (Diagrama 02 + cita
  destacada de Melisa, siempre visible) y cierre. **Igual que Método, sin
  GSAP/ScrollTrigger/pin en ningún punto** (spec §6, regla dura) — los
  únicos mecanismos son el marquee (CSS puro, igual que Método), el reveal
  de entrada (mismo `IntersectionObserver` binario que Método) y el
  acordeón (altura por `scrollHeight` + transición CSS interrumpible,
  **primer `<button>` interactivo real del sitio**). **Primero construido y
  auditado aislado en `PRUEBAS/Prototipo - Nodo 4 Voces (alta
  fidelidad)/`** (workflow build → verify en paralelo [responsive/a11y +
  cumplimiento de spec/contenido] → fix → comparación pixel-a-pixel contra
  el frame real de Figma `IMAGENES/frames figma/nodo 4 voces.png` → merge),
  después integrado acá siguiendo el mismo patrón de merge que Método
  (`initVoices()` propia en `script.js`, tokens nuevos en su propio bloque
  `:root` en `styles.css`, sin duplicar el reset global). Ver Pendiente
  para las divergencias abiertas.

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
  defecto sin necesidad de tocar el loop. El peso persistió incluso
  después de esto y de pausar por visibilidad (ver bullet siguiente) — el
  usuario pidió explícitamente ir más lejos en galaxy, ver ese bullet.
- **Galaxy: movimiento congelado del todo en móvil/tablet + menos
  estrellas** (`animateGalaxy`, `NUM_LAYER`, `cfg.density` en
  `initGalaxy`/`script.js`) — pedido explícito del usuario ("pausar el
  movimiento... y reducir la cantidad") porque el lag persistía en mobile
  incluso con la interactividad ya sacada y con el loop ya pausado cuando
  el Umbral no está en pantalla (ver "se pausan cuando el Umbral sale de
  pantalla" más abajo). A diferencia de esa pausa por visibilidad, esto
  apaga el movimiento SIEMPRE en `mobileMQ` (≤1023px), aunque el Umbral
  esté a la vista: `update()` renderiza un único frame (`rafId =
  animateGalaxy ? requestAnimationFrame(update) : null` — con
  `animateGalaxy=false` nunca se vuelve a programar) y `resume()` también
  respeta el flag, así que ni siquiera el pausado/reanudado por
  scroll reinicia la animación ahí. El fondo de estrellas se sigue viendo
  (no desaparece, solo queda estático) y además tiene menos densidad
  (`density: 1.6` vs `2.5`) y menos capas (`NUM_LAYER` interpolado a `2.0`
  en mobile/tablet vs `4.0` en laptop+, directo en el string del fragment
  shader — MENOS capas de verdad baja el trabajo por píxel del shader, a
  diferencia de bajar solo `density`, que cambia la escala de la grilla
  pero no el número de iteraciones). En laptop+ nada cambia. Ojo con el
  interpolado del `#define`: `${valor}` en un template string de JS
  convierte `2.0` a `"2"` (sin el punto), y GLSL exige que el literal sea
  float (`2.0`), no int, en esa división — hay que forzar `.toFixed(1)` al
  interpolar o el shader no compila (error real, ya pasó acá).

- **Territorio — mecánica de scroll**: 5 `ScrollTrigger` independientes con
  `pin:true, scrub:1` (uno por tramo: Intro/Suelo/Ladera/Cima/Cierre),
  nunca un mega-timeline ni un `IntersectionObserver` para el progreso —
  mismo criterio que ya falló en el Catálogo (error #5: un observer no da
  progreso fraccional). `TERRITORY_PAGE_SCROLL = 650` px es la palanca
  única del ritmo de lectura de todo el nodo. Cada página tiene su propia
  timeline de reveal (`splitBlurText()`, reutilizada tal cual) que
  `applyStintProgress()` solo LEE con `.progress(x)` — nunca
  `.play()`/`.restart()` — para que el resultado sea 100% función pura de
  dónde está el scroll, sin importar si el usuario llegó rápido, lento, o
  volviendo hacia atrás.
- **Territorio — la ficha técnica NO usa el efecto blur del resto del
  scrollytelling.** Pedido explícito del usuario: los fragmentos
  narrativos (zigzag, énfasis, notas) cruzan con blur-puente porque son
  "texto que se lee"; la ficha es una "lectura de instrumento" y entra/sale
  con scroll normal — sube desde abajo, se va hacia arriba, siempre nítida
  (`page.isCard` en `initTerritory()`, ver `CARD_TRAVEL` en
  `applyStintProgress()`). Aplica también a la comparativa final, que
  reutiliza el mismo marcado de ficha.
- **Territorio — título de tramo y nombre de nivel van arriba, no en el
  centro vertical de la pantalla.** El resto del texto narrativo
  (zigzag/énfasis/cierre/remate) sigue centrado verticalmente; pedido
  explícito del usuario solo para `.territory__stint-title` y
  `.territory__level-name` (`top: var(--sp-6)` en vez de `top:50%` +
  `translateY(-50%)`).
- **Territorio — indicador de altitud, Fase 1 sin video** (`.territory__center`,
  ver Ruta Técnica del vault §Advertencia de alcance): banda central
  reservada con una línea + 3 marcas + un punto que sube con el scroll,
  CSS/GSAP puro. Es UN SOLO elemento `position:fixed`, no vive dentro de
  ningún tramo — así el punto sube de forma continua Suelo→Ladera→Cima en
  vez de resetearse en cada pin. Se muestra/oculta con
  `body.territory-ascent`. El video real (Fase 2) todavía no existe;
  reemplazarlo es cuestión de montar la secuencia de frames sobre el mismo
  espacio y el mismo `ScrollTrigger`, con esto ya como fallback probado.
- **Territorio — 3 familias tipográficas nuevas, acotadas a este nodo**:
  Gantari bold-itálica-uppercase (títulos y registro técnico de la ficha),
  Fraunces itálica (narrativa y notas de campo), Martian Mono (captions y
  sellos de coordenada). Cargadas por `<link>` de Google Fonts (no
  autohospedadas — la ruta técnica lo sugería como "ideal", no obligatorio,
  y no había forma de descargar los `.woff2` sin acción explícita del
  usuario). Martian Mono **no** expone su eje de ancho "Condensed" en la
  API pública de Google Fonts (`family=Martian+Mono:wdth,wght@...` devuelve
  400) — el "corte Condensed" del spec se aproxima con tracking/tamaño en
  CSS, no es una variante real de la fuente.
- **Método — sin GSAP/ScrollTrigger/pin, a propósito.** Es el único nodo
  del sitio donde eso es una regla explícita del spec (§4), no una omisión.
  Los únicos 3 elementos animados: marquee en loop autónomo 100% CSS
  (`@keyframes method-marquee-scroll`, nunca `gsap.to` como el de
  Territorio), reveal de entrada por bloque con un único
  `IntersectionObserver` binario (`threshold:0.15`, `unobserve()` tras
  revelar — nunca progreso fraccional, ver error #5: acá es seguro porque
  el reveal solo necesita saber SI un bloque entró, no CUÁNTO) y el scroll
  suave de Lenis (ver "Stack"). El marquee calcula su cantidad de `<span>`
  por ancho real del viewport en runtime (`initMethodMarquee()`), midiendo
  después de `document.fonts.ready` (mismo cuidado que error #9) — el HTML
  trae 8 `<span>` fijos por riel como respaldo estático para `?static=1`/JS
  caído, motionOK controla si se recalcula.
- **Método — tipografía, dato exacto de Figma a 1440px de ancho, no
  inventada desde la regla ordinal del spec.** El spec del vault solo daba
  un orden relativo ("enunciados grandes > pregunta bisagra > apertura
  serif > remate > registro pequeño > etiquetas mono"); la primera pasada
  de implementación calibró tamaños a mano a partir de esa sola regla y
  terminó con la pregunta bisagra a ~88% del tamaño del enunciado
  principal — visualmente casi confundible con el pico real del nodo. El
  usuario después pasó capturas de Figma con los 16 tamaños/pesos exactos
  a 1440px, que resolvieron el problema de raíz (la bisagra terminó a 50%
  del enunciado, no 88%) y de paso introdujeron **Plus Jakarta Sans**
  (`--m-f-sans`) como familia nueva — reemplaza a Gantari en casi todo el
  registro medio/pequeño/bisagra/diagramas; Gantari queda solo para el
  marquee y los dos enunciados grandes ("INVESTIGACIÓN-CREACIÓN.",
  "EMERGE DE ÉL"). Conversión a fluido: cada `clamp(min, Xvw, max)` tiene
  `max` = el valor exacto de Figma y `slope_vw = (px_objetivo/1440)*100`
  **redondeado siempre hacia arriba** (nunca al valor exacto con
  decimales) — así la curva cruza el máximo en o antes de 1440px, nunca
  después, y el `clamp()` devuelve el literal del dato de Figma sin
  arrastre de punto flotante. Antes de tocar cualquiera de estos 14
  selectores, releer el comentario puntual en `styles.css` — cada uno
  documenta su piso elegido y por qué (agrupados en "tiers" por tamaño
  compartido, p. ej. el "tier 48px": hinge/serif/definition/quote-text/
  outro compartiendo piso 28px).
- **Método — "PRÓXIMAMENTE" (tarjeta Makro) usa `container-type:
  inline-size` + `font-size: 12.5cqi`, no un `clamp()` con `vw`.** Pedido
  explícito del usuario ("lo más grande posible dentro de la tarjeta"): la
  tarjeta no tiene `max-width` propio, así que a full-bleed en desktop es
  mucho más ancha que `.method__opening` — un tamaño atado a `vw` (ancho
  del viewport) no reflejaría el ancho real disponible. `cqi` sí lo hace,
  crece/encoge exactamente con el ancho de la tarjeta en cualquier
  breakpoint. Valor tuneado a mano y verificado en navegador de 320 a
  2560px sin partir línea ni tocar bordes.
- **Método — merge al sitio real desde un prototipo aislado.** A
  diferencia de Territorio (construido directo acá), Método se armó y
  auditó primero en `PRUEBAS/Prototipo - Nodo 3 Método (alta fidelidad)/`
  — sin los nodos 0-2 reales, con su propio `initLenis()` de respaldo (rAF
  directo, sin GSAP porque el prototipo no lo carga). Al integrar, ese
  `initLenis()` de prototipo SE DESCARTA — la versión real usa el snippet
  sincronizado con `ScrollTrigger.update()` de más arriba, porque acá sí
  hay pines de por medio que sincronizar. No reintroducir la versión rAF
  simple si se vuelve a tocar `initLenis()`.

- **Voces — 7 discrepancias resueltas entre spec/contenido/captura de
  Figma al construir el nodo (2026-07-26), ya aplicadas, no reabrir sin
  razón nueva:** (1) la bisagra hacia la primera persona (§3.6) usa "Falta
  la mía" (el spec, más reciente) y no "Falta la tuya" (el archivo de
  Contenido); (2) Juan David usa SIEMPRE una sola inicial "J" (nunca "JD",
  aunque el archivo de Contenido lo mencione así para su cabecera) — misma
  inicial en Diagrama 01, avatar chico y en todos lados; (3) el Diagrama 02
  usa las etiquetas literales del spec (PLANEACIÓN/ALGORITMO/PSEUDOCÓDIGO/
  DIAGRAMA DE FLUJO/RESULTADO FINAL), mientras el párrafo narrativo debajo
  conserva "Flowchart"/"Código final" tal cual el archivo de Contenido —
  las dos redacciones conviven a propósito, una es etiqueta de diagrama y
  la otra es copy cerrado; (4) la cita de Melisa sobre el método preserva
  el corchete "[...]" y el verbo "parecía" (no "parece") tal cual el
  archivo de Contenido; (5) Junior (tercera voz) reusa el par terracota de
  Juan David — **PROVISIONAL, sin confirmar contra Figma si debería tener
  acento propio** (ver Pendiente); (6) **"Consejos de oficio" (4ta fila de
  Juan David) es UNA sola fila de acordeón con 3 áreas internas rotuladas
  EQUIPO/FINANZAS/PITCH**, no 3 filas hermanas — la captura de Figma
  muestra 3 filas separadas, pero el spec §3.5 lo marca como nota de
  trazabilidad confirmada con el usuario el 2026-07-26: manda el archivo de
  Contenido. Es el punto más propenso a reintroducirse mal si alguien mira
  solo la imagen de Figma sin leer el spec; (7) la escala tipográfica de
  Voces quedó **PROVISIONAL** (sin datos exactos de Figma para este nodo,
  a diferencia de Método) — anclada a la jerarquía ordinal del spec §5.4 y
  reusando literal los tiers ya calibrados de Método donde el rol es
  análogo (marquesina = marquee de Método, "INVESTIGACIÓN-CREACIÓN." =
  `.method__term`, citas/subtítulos serif = "tier 48px" de Método). Ajustar
  cuando lleguen datos reales, mismo patrón que ya pasó con Método.
- **Voces — primer `<button>` interactivo real del sitio** (el acordeón).
  No hay un reset `button {}` global en `styles.css`: el reset (border,
  font, color, cursor, text-align) vive scoped directo en
  `.voices__row-toggle`, porque ningún otro nodo tiene botones todavía. Si
  se agrega un botón real en otro nodo, considerar entonces sí promover un
  reset genérico en vez de repetirlo por selector.
- **Voces — acordeón sin `<details>`/`<summary>`, altura por
  `scrollHeight` medido en vivo, nunca `height:auto` directo en la
  transición ni un valor fijo.** `expandRow()`/`collapseRow()` (dentro de
  `initVoices()` en `script.js`) miden la altura REAL en pantalla antes de
  animar (funciona igual si el cuerpo estaba en 0, en `auto`, o a mitad de
  una transición anterior interrumpida — así un doble click rápido arranca
  en la dirección nueva desde donde está, sin saltar). Al terminar de
  abrir pasa a `height:auto` (se adapta solo a resize/fuente tardía); al
  terminar de cerrar recién ahí se aplica `hidden=true` (nunca antes, o
  corta la transición para quien navega con lector de pantalla). La
  compensación de salto de scroll al cerrar una fila por encima del
  viewport (spec §4.3) pasa por `lenisInstance.scrollTo(...,
  {immediate:true})` — variable module-level nueva en `script.js`,
  asignada dentro de `initLenis()` (`lenisInstance = lenis`), porque antes
  del merge de Voces esa instancia de Lenis era una `const` local sin
  exponer fuera de `initLenis()`.
- **Voces — Diagrama 02 (protocolo de ejecución técnica) queda VERTICAL en
  todos los breakpoints, no horizontal como en la captura de Figma.**
  Decisión tomada durante la construcción del prototipo (documentada en el
  propio `styles.css`): está confinado a la columna de lectura (~42rem,
  a diferencia del Diagrama 01, que es full-width), y 5 cajas horizontales
  no entran ahí sin romper. Confirmado con una comparación posterior
  contra el frame real de Figma que la divergencia es real — **queda como
  decisión pendiente de confirmar con el usuario** (ver Pendiente): o se
  acepta vertical, o se rediseña full-width horizontal como el Diagrama 01.

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
| 18 | Solo 5 de los 8 íconos de la constelación aparecían en móvil ≤767px (confirmado en dispositivo real) | Clase `is-compact` (leftover de un layout viejo, ver error #1) en 3 `specimen-chip` (`webflow`, `blender`, `figma`) + regla `@media (max-width:767px) { .specimen-chip.is-compact { display:none } }` en `styles.css` — nunca se sacó del todo al pasar a "los 8 orbitan siempre juntos" | Sacada la regla CSS y la clase `is-compact` de los 3 `<div>` en `index.html` — los 8 quedan iguales, ninguno se oculta en ningún breakpoint |
| 19 | Texto ASCII de "Digital" se veía como bloques de colores sólidos (no como letras) en móvil, en un celular real | El fragment shader de `initAsciiText` separa los canales r/g/b con un offset de UV distinto por canal (aberración cromática/glitch, intencional) — en desktop es un fringe sutil porque el canvas interno de `asciify()` tiene resolución alta (~160×20); en móvil ese canvas es mucho más chico (~80×10) y además se downsamplea con `imageSmoothingEnabled:false` (nearest-neighbor) desde la resolución real del `WebGLRenderer` — el mismo fringe de un par de píxeles pasa a ser una fracción enorme de cada letra | Uniform nuevo `uChroma` que multiplica el offset de los 3 canales — `0` en móvil/tablet (`mobileMQ`, efecto apagado del todo), `1` en laptop+ (sin cambios) |
| 20 | Territorio: espacios entre palabras desaparecían en los fragmentos narrativos ("Yavistelostresniveles...") | `display:flex` aplicado directo sobre el `<p>` cuyos childNodes son `span.territory__word` + nodos de texto (los espacios que `splitBlurText()` deja entre palabras) — flexbox no les da caja como sí hace el flujo inline normal, los colapsa a ancho cero. Confirmado inspeccionando el DOM: los nodos `" "` existían, pero renderizaban invisibles | Centrado vertical de páginas de texto crudo (zigzag/énfasis/cierre/remate) vía `top:50%` + `transform:translateY(-50%)`, nunca `display:flex` sobre el propio elemento — separado de las páginas contenedoras (ficha/nota/comparativa), que sí pueden ser flex/grid porque sus hijos son elementos reales |
| 21 | Territorio: la última página de cada tramo (nota de campo, remate) se quedaba permanentemente sin revelar — texto blureado para siempre | `activeFloat` nunca supera `max` (páginas−1), así que la última página solo es "la activa" (`idx`) en el instante final exacto del scroll, con `localT=0` — nunca llegaba a acumular progreso de reveal ahí | El reveal cuelga del mismo `fadeT` que la entrada de opacidad (progresa mientras la página es `nextIdx`, entrando), no de un cálculo aparte atado a cuándo es `idx` — cubre tanto páginas intermedias como la última de cada tramo |
| 22 | Territorio: nota de campo y su callout aparecían lado a lado en vez de apilados, en todos los breakpoints | Una regla agregada para centrar verticalmente las páginas "contenedoras" (`display:flex` en `.territory__card`/`.territory__note`/`.territory__compare`) pisaba el `display:grid` que esas mismas páginas ya tenían para su layout de 3 columnas — dos hijos con `grid-column:1/-1` pasaron a ser dos flex items lado a lado. Confirmado con `getBoundingClientRect` (125px + 164px de ancho, uno junto al otro) | `.territory__compare` sí es flex (nunca tuvo grid propio); `.territory__card`/`.territory__note` se centran con `align-content:center` sobre su `display:grid` existente, sin tocar `display` |
| 23 | Territorio: filas de la ficha técnica desbordaban el viewport en mobile (texto cortado, scrollbar horizontal) | `.territory__card-row dd` es un flex item (`flex:1 1 auto`) dentro de una fila que en mobile pasa a `flex-direction:column` — por default un flex item no encoge por debajo del ancho de su propio contenido (`min-width:auto`), así que el texto largo empujaba el ancho en vez de hacer wrap | `min-width:0` en `dd` (permite que el texto haga wrap normal) + `max-width:100%` en `dt` para el breakpoint móvil |
| 24 | Método: el wrap móvil del Diagrama 01 ocultaba la flecha equivocada y reordenaba los chips (`:nth-of-type()`) | Chips y flechas son todos `<span>` — `:nth-of-type()` cuenta posición por *tag*, no por clase, así que agarra el N-ésimo `<span>` de la fila entera, no el N-ésimo elemento de esa clase | Usar `:nth-child()` (cuenta la posición real entre TODOS los hermanos) cuando varios tipos de elemento comparten tag dentro del mismo contenedor |
| 25 | Método: "PRÓXIMAMENTE" (contenido real, no decorativo) tenía contraste ~2.7:1 contra `--t-panel`, por debajo del mínimo 3:1 (WCAG AA, texto grande) | `opacity:0.35` sobre `--t-ink` para dar aspecto "apagado" — la opacidad reduce contraste real, no solo brillo percibido, y nadie había hecho la cuenta contra el fondo real | Antes de usar opacidad reducida en texto que es contenido (no decoración), calcular el contraste resultante contra el fondo real, no solo "que se vea sutil" |
| 26 | **Después del marquee "EL MÉTODO." no se veía NADA** (reportado en el sitio publicado, con video) — y, sin que nadie lo reportara, el hero del Umbral también estaba invisible: faltaban el `<h1>` "Creador Digital", el eyebrow y la pregunta. Solo se veían galaxy, íconos y HUD | **Colisión entre dos sistemas de reveal que compartían el atributo `data-reveal` con selectores globales.** El Nodo 0 tenía `gsap.from("[data-reveal]", …)` — escrito cuando solo el Umbral usaba ese atributo, 4 elementos. El Nodo 3 sumó 35 elementos más **y** una armadura CSS igual de global (`body.method-js [data-reveal] {opacity:0}`). Con eso, el `from` pasó a agarrar los 39 del sitio. Clave: **GSAP fija el valor FINAL de un `from` en su primer tick, no al crearlo** — y para ese tick `initMethod()` ya había puesto `body.method-js`, así que la armadura ya reportaba `opacity:0`. El tween terminaba animando 0→0 y dejando `style="opacity:0"` **inline y permanente** en los 39. Un estilo inline le gana a `.is-in`, así que el reveal quedaba muerto pase lo que pase | Acotar CADA sistema de reveal a su propio nodo: `gsap.from("#threshold [data-reveal]", …)` en `script.js` y `.method [data-reveal]` en los 4 selectores de la armadura en `styles.css`. Regla general: **`data-reveal` no es de nadie — ningún nodo puede seleccionarlo sin acotar el selector a su propia sección.** Dos falsos culpables que costaron una investigación entera: (a) **no era Lenis** — los elementos ya estaban en `opacity:0` antes de cualquier scroll, y el commit base `e5b9b2d` (sin Lenis, sin Método) deja el mismo tween en `opacity:1`; (b) **no era el `IntersectionObserver`** — sí dispara y sí agrega `.is-in`. Se creyó que no porque se midió en una pestaña en segundo plano: **con la pestaña oculta el navegador no corre el ciclo de render, así que IntersectionObserver no emite nada.** Medir reveals ahí da falso negativo garantizado — verificar siempre con la pestaña realmente renderizando (ver "Cómo verificar" abajo) |

## Cómo verificar un cambio visual (no repetir el error de la investigación de #26)

El navegador embebido del panel de preview **no compositea frames cuando el
panel no está desplegado**: ahí `IntersectionObserver` no dispara, las
transiciones CSS no avanzan y las capturas fallan por timeout. Un reveal que
"no funciona" medido así es un falso negativo, no un bug.

Lo que sí funcionó para depurar #26 — **el Chrome real del usuario** vía las
herramientas `claude-in-chrome`, sirviendo el sitio con
`python -m http.server` y comparando contra un `git worktree` del último
commit estable:
```
git worktree add /tmp/baseline <commit-estable>
python -m http.server 4180   # baseline
python -m http.server 4181   # trabajo
```
Ojo: incluso ahí la pestaña puede reportar `document.visibilityState ===
"hidden"` si la ventana está en segundo plano — en ese estado `rAF` no corre
y los tweens de GSAP quedan congelados en `progress: 0`. Dos salidas:
tomar un screenshot (fuerza un frame real y destraba el observer) o avanzar
el tiempo a mano con `gsap.globalTimeline.time(N)` para ver de forma
determinista **en qué valor deja un tween a sus elementos** — que es
exactamente como se encontró el `opacity:0` inline de #26.

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

## Pendiente

- **La Bitácora Oculta del vault todavía no existe — falta construir el
  componente real desde cero.** Hasta hace poco había un placeholder
  (`#sensor`, toggle "Cognición Aumentada" que revelaba 3 `<aside
  class="sensor-note">` sueltos) — se sacó por completo (HTML, CSS y el
  listener en `script.js`) porque no correspondía al diseño de Figma ni al
  vault: ni el nombre, ni el copy, ni el mecanismo. También se sacó el
  marco/corchetes decorativos de `.hud` (el border fijo con corner-
  brackets) por el mismo motivo — no está en el Figma. `.hud__reg`/
  `.hud__coord` (las lecturas de sección/coordenadas) quedaron intactas,
  son dato, no decoración. El vault (`Plan de Desarrollo y Especificacion
  Tecnica.md`, sección 1.2) especifica algo más grande y ya con nombre
  fijo, **"Bitácora Oculta"** (nunca "Cognición Aumentada" — ese nombre no
  aparece en el vault; el nombre viejo y ya reemplazado en el vault era
  "Modo Rayos X"):
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

- **Territorio — varios puntos abiertos, ninguno bloqueante:**
  - No confirmado contra las capturas reales de Figma (el conector no
    estaba autorizado en la sesión que lo construyó) — jerarquía, escala
    exacta y sobre todo el acento secundario `#c9803d` siguen
    "provisional", tal como ya lo marcaba el spec del vault.
    Comparar apenas se pueda y ajustar `--t-accent` en `styles.css` si
    corresponde.
    - Corrección de layout ya reportada por el usuario y aplicada durante
      la depuración: la ficha técnica no debía compartir el efecto blur
      del scrollytelling narrativo (ver Decisiones de diseño), y los
      títulos debían anclarse arriba en vez de centrarse verticalmente —
      ambas ya resueltas antes de este commit, pero puede haber más
      ajustes de diagramación cuando se compare contra el Figma completo.
  - Animación central del ascenso: solo Fase 1 (línea + punto CSS/GSAP,
    sin video) — Fase 2 (secuencia de frames WebP) queda para cuando el
    clip exista, siguiendo el mismo pipeline que ya usa el Catálogo.
  - Se lanzó una revisión en paralelo (animaciones, accesibilidad/
    guidelines, mejoras, cumplimiento literal del spec) sobre la primera
    versión construida; sus hallazgos, si quedan pendientes de aplicar,
    conviene revisarlos antes de dar el nodo por cerrado.
  - Bitácora Oculta: igual que en Nodo 0/1, Territorio todavía no expone
    sus 5 subsecciones (Génesis/Instrucción/Síntesis técnica/Datos/
    Hallazgos) — depende del componente reutilizable de Fase 0, que sigue
    sin construirse (ver primer punto de este Pendiente).

- **Método — puntos abiertos, ninguno bloqueante:**
  - Bitácora Oculta: mismo caso que Nodo 0/1/2 — todavía no expone sus 5
    subsecciones, depende del componente reutilizable de Fase 0.
  - Tarjeta Makro sigue en `PRÓXIMAMENTE` (fase actual del spec). El
    contenido real (cita de Melisa Ballesteros sobre los stickers de fruta
    de Makro + referencia `ESTUDIOS_ENSE_04 // ACERBIS - 2023`) ya está
    redactado en el vault, pendiente de decisión de negocio para pasar a
    la fase interactiva (acordeón que expande/colapsa con click — primer
    uso de ese patrón en el sitio, ver Plan de Desarrollo §1.3). Cuando se
    active, revisar el guardrail del Spec §6 sobre "no exigir clicks para
    revelar contenido argumental" — la lectura que adoptó el spec (Makro
    es ilustrativo, no esencial para seguir el argumento) queda por
    confirmar antes de construir el estado expandido.
  - Etiqueta "DIAGRAMA 02" sin decidir: el Spec §3.10 nunca la pide (a
    diferencia de §3.5, que sí especifica el texto literal de "DIAGRAMA
    01:..."), así que el Diagrama 02 quedó sin etiqueta — un auditor
    interno lo marcó como posible falta de paridad visual, pero no es un
    requisito confirmado. Decidir si se agrega antes de dar el nodo por
    cerrado.
  - No confirmado pixel a pixel contra el frame completo de Figma más allá
    de los 16 valores de tipografía que el usuario ya dio a mano (tamaño,
    peso, familia, anclados a 1440px de ancho) — el conector de Figma
    sigue sin autorizar en sesión. Si aparece un archivo exportado del
    frame, hay margen para una pasada de comparación más fina (espaciado
    entre secciones, alineación exacta).
  - Remate final (`.method__outro`) usa el mismo "tier 48px" que
    hinge/serif/definition/quote-text por default del agente de
    responsive — el usuario confirmó 48px/Italic/Medium a 1440px pero no
    el piso mobile; queda en 28px por consistencia con ese tier, ajustar
    si no calza contra Figma.

- **Voces — puntos abiertos, ninguno bloqueante (2026-07-26):**
  - **Bug visual reportado por el usuario, sin resolver — investigar de
    nuevo, no repetir el mismo diagnóstico.** El usuario mostró dos
    capturas de una misma sección (la cita de Melisa en "Qué técnica o
    método rescato...") donde el texto se ve amontonado, justificado a la
    izquierda y en una fuente sans-serif bold no itálica en vez de
    Fraunces itálica — "durante toda la página". Se investigó sirviendo el
    prototipo aislado con un servidor nuevo (sin caché) y midiendo
    `getComputedStyle` en vivo sobre `.voices__method-subtitle` y
    `.voices__quote.voices__accent--melisa .voices__quote-text`: en esa
    sesión los estilos medían CORRECTOS (Fraunces itálica 28px, spacing
    esperado) — no se pudo reproducir el bug así. Se subió el
    cache-busting `?v=1→2` de `styles.css`/`script.js` en el prototipo
    (nunca se había subido pese a que `fix:voices` y el agente de
    figma-compare editaron esos archivos después del build, exactamente el
    error #7 de este mismo archivo) y se le pidió al usuario recargar con
    Ctrl+Shift+R — **reportó que el problema seguía igual**, lo que
    descarta (o al menos no confirma del todo) la teoría de caché de
    navegador como única causa. No se investigó más allá por pedido
    explícito del usuario ("déjalo así"). Pistas para la próxima sesión:
    (a) confirmar con una captura de pantalla REAL del navegador del
    usuario (no solo `getComputedStyle`) que el bug persiste en el momento
    de investigar; (b) descartar que la captura que mostró el usuario sea
    de una fuente distinta al HTML servido (un PDF/imagen exportada de
    Figma, una pestaña vieja, un dispositivo distinto); (c) revisar si el
    fix de fuentes (`fixReport`, sacar `Archivo`/`IBM Plex Mono` del
    `<head>` del prototipo) pudo interactuar mal con algún selector que sí
    dependa de esas familias como primario en vez de fallback. El merge al
    sitio real (esta sesión) usa las fuentes YA cargadas por
    Territorio/Método, así que no hereda el `<link>` que se tocó en el
    prototipo — vale la pena confirmar primero si el bug aparece también
    acá o era exclusivo del prototipo aislado.
  - Diagrama 02 (protocolo de ejecución técnica) vertical vs. horizontal
    como en Figma — ver "Decisiones de diseño" más arriba.
  - Margen de la bisagra (`.voices__hinge`) en móvil: 128px de base baja a
    96px (`var(--sp-6)`) en `≤767px` — el spec no autoriza esa excepción
    por breakpoint, fue criterio del agente de build. Confirmar con el
    usuario o revertir a 128px fijo.
  - Caption de rol en el Diagrama 01 ("Profesora e investigadora" /
    "Animador 3D y director creativo") usa versión abreviada, distinta de
    la versión completa en las cabeceras de perfil (con ", Universidad El
    Bosque" / ", +10 años en la industria"). El spec exime a esta pieza
    del texto cerrado (dice que el Diagrama 01 "no está descrito en el
    vault"), así que no es un error de fidelidad de contenido, pero genera
    una inconsistencia de redacción del mismo dato dentro del propio nodo.
  - Acento de color de Junior (tercera voz) comparte el terracota de Juan
    David — confirmado que así lo muestra también la captura de Figma,
    pero el spec lo marca como "punto a confirmar": decidir si conviene que
    Junior tenga su acento propio o si compartirlo con Juan David lo hace
    leer como un cuarto entrevistado del mismo bando.
  - Activación por teclado (Enter/Espacio sobre los botones de fila) no se
    pudo confirmar con una interacción realmente en vivo en esta sesión —
    limitación del entorno de pruebas (la pestaña de Chrome real perdió
    foco de SO a mitad de la verificación), no evidencia de fallo. El
    `<button>` nativo no intercepta `keydown`/`keyup`, así que debería
    funcionar por comportamiento por defecto del navegador — probarlo a
    mano (Tab + Enter + Espacio sobre 2-3 filas) antes de dar el nodo por
    cerrado.
  - Bitácora Oculta: igual que en los nodos 0-3, Voces todavía no expone
    sus 5 subsecciones (Génesis/Instrucción/Síntesis técnica/Datos/
    Hallazgos) — depende del componente reutilizable de Fase 0, que sigue
    sin construirse (ver primer punto de este Pendiente).
  - No confirmado pixel a pixel contra el frame completo de Figma más allá
    de los 5 puntos revisados en la comparación del 2026-07-26 (grid de
    2 columnas de las filas expandidas, tamaño/gap del Diagrama 01, tamaño
    del bloque de Junior, estilo del Diagrama 02, colores de acento) —
    esos 5 coincidieron bien salvo el Diagrama 02 (ver arriba). Queda
    margen para una pasada más fina de espaciado/alineación si aparece
    necesidad.

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
