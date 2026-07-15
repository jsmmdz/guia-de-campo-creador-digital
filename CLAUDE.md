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
Digital — Universidad El Bosque. "Acto I" es la etiqueta de este primer tramo
de construcción — cubre, con nombres propios de implementación, los dos
primeros de los 5 nodos que define el vault:

- **Nodo 0 — Umbral** (`#threshold`): implementa el "Nodo 0 · Umbral" del
  vault. Título ancla, constelación de las 8 herramientas de la carrera
  orbitando, copy de 5 pilares revelado por scroll, cierre "Exploremoslo
  Juntos", fondo de estrellas animado (`.threshold__galaxy`, ver sección
  siguiente). El rastro de cursor tipo cometa que tenía antes se retiró (no
  era definitivo) y ese lugar lo ocupa ahora el fondo de estrellas.
- **Nodo 1 — Catálogo** (`#catalog`): implementa el **"Nodo 1 · Perfil"**
  del vault (seis competencias híbridas del Creador Digital) — aquí
  construido como "catálogo de especímenes" siguiendo la metáfora de guía de
  campo naturalista del resto del sitio (HUD, "Registro N.01", especímenes
  en órbita del Nodo 0). 6 placas de disciplina en carrusel horizontal, blob
  por disciplina generado por código que muta entre tarjetas, fondo
  reactivo al color de la activa. **Nombre sin confirmar con el vault** —
  "Catálogo" no aparece en el plan de desarrollo; si se documenta ahí
  también, usar el mismo término en ambos lados.

## Stack

HTML/CSS/JS planos. GSAP 3.12.5 + ScrollTrigger por CDN (jsdelivr), sin
bundler ni framework. Un solo `script.js` en un IIFE, un solo `styles.css`.

**Excepción puntual — OGL (WebGL) para el fondo de estrellas del Nodo 0:**
`initGalaxy()` en `script.js` carga `ogl` por `import()` dinámico desde
`esm.sh` (no rompe el patrón "sin bundler": `import()` dinámico funciona
dentro de un script clásico, no exige `type="module"`). Si el CDN falla, el
`.catch()` no hace nada — queda el radial-gradient + sweep de CSS que
`.threshold` ya tenía de fondo, no se rompe la página. Versión portada y
reutilizable, con comentarios, en `RECURSOS/galaxy.js` + `.css` (fuera del
repo, ver `industrias y creacion/RECURSOS/`). Fuente original:
reactbits.dev/backgrounds/galaxy.

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
- **Config del fondo galaxy (`initGalaxy`, objeto `cfg` en `script.js`)**:
  `density: 2.5, hueShift: 0, saturation: 0.1, speed: 0.8, starSpeed: 0.2,
  glowIntensity: 0.3, twinkleIntensity: 0.1, rotationSpeed: 0.05,
  repulsionStrength: 1` — valores elegidos a mano por el usuario probando
  en el sitio de origen, no son los defaults del componente. El shader no
  usa HSL estándar: `uHueShift` rota un tono pseudoaleatorio por estrella,
  no fija un color único, y con `saturation` baja (acá 0.1) el resultado
  se mantiene cerca del blanco/gris sin importar el hue — por eso esta
  combinación no choca con la paleta del sitio aunque el hue sea distinto
  al azul-violeta exacto de `--signal`. Si se cambia, probar siempre
  visualmente antes de asumir el resultado — el mapeo no es intuitivo.

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
- **Transiciones reales de blobs — 5/5 edges resueltos.** El modelo ya no
  es un video por disciplina: son videos de transición ENTRE tarjetas
  consecutivas ("edges"), reproducidos como secuencia de frames PNG con
  alfa real (recorte por croma verde/azul, no `video.currentTime` —
  técnica portada de `RECURSOS/blobsite/index.html`, sin latencia de
  seek, scrub fluido en ambas direcciones). Con 6 tarjetas hay 5 edges
  posibles, los 5 cubiertos: `01-02` (UX/UI→3D), `02-03` (3D→Software),
  `03-04` (Software→Game), `04-05` (Game→Multimedia, croma azul — el
  blob de Multimedia ya es verde-amarillento, `--spec-5`, choca con
  croma verde), `05-06` (Multimedia→IA, croma azul por el mismo motivo).
  Convención: `assets/disciplinas/frames/<edge>/0000.png`…`NNNN.png`, 62
  frames cada uno (clips de ~5s, extraídos a 12fps con `ffmpeg -i
  clip.mp4 -vf "chromakey=<color>:0.15:0.05,format=rgba" -r 12
  -start_number 0 frames/<edge>/%04d.png`). `has-feed` es solo-agregar:
  una vez que una tarjeta muestra video real se queda así para siempre,
  el blob nunca vuelve (coincide con el flujo del sitio de referencia).
  `has-feed` ON en ambas tarjetas del edge activo, toggleado en
  `applyProgress()`; nunca se apaga. Config y carga perezosa por
  proximidad (±1 edge) en `EDGE_FEEDS` / `ensureEdgeFeedLoading()` /
  `scrubEdgeFeed()` en `script.js` — ojo con `ctx.clearRect()` antes de
  cada `drawImage()`: con alfa real, sin el clear queda "fantasma" del
  frame anterior en las zonas transparentes. Sin equivalente en
  mobile/tablet — `setupSimple()` nunca produce progreso
  fraccional entre tarjetas, así que ahí el catálogo se ve solo con blobs,
  consistente con la separación ya documentada modo simple/scroll-jacking.
- **Copy final de las 6 placas del catálogo** — el actual es un borrador
  provisional (marcado con comentario `COPY PROVISIONAL` en `index.html`),
  a la espera del texto exacto y definitivo.

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
