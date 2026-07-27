# Nodo 0 — Umbral (`#threshold`)

> Léelo antes de tocar el Umbral: galaxy, texto ASCII de "Digital", órbita de íconos, reveal de los 5 pilares.
> Extraído literal de CLAUDE.md el 2026-07-26. Fuente de verdad de contenido y narrativa: el vault en DOCUMENTOS/.

## Qué es

- **Nodo 0 — Umbral** (`#threshold`): implementa "Nodo 0 · Umbral" del
  vault — título ancla, constelación de las 8 herramientas de la carrera
  orbitando, copy de 5 pilares revelado por scroll, cierre "Exploremoslo
  Juntos", fondo de estrellas animado (`.threshold__galaxy`, ver Stack). El
  rastro de cursor tipo cometa que tenía antes se retiró (no era
  definitivo); ese lugar lo
  ocupa ahora el fondo de estrellas. La palabra "Digital" del título se
  renderiza como arte ASCII animado con Three.js, reactivo al mouse (ver
  Stack).

## Decisiones de diseño (no reabrir sin razón)

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


## Pendiente

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


