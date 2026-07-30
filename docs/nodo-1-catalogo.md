# Nodo 1 — Catálogo (`#catalog`)

> Léelo antes de tocar el Catálogo: scroll-jacking con pin, blobs SVG interpolados, secuencias de frames por edge.
> Extraído literal de CLAUDE.md el 2026-07-26. Fuente de verdad de contenido y narrativa: el vault en DOCUMENTOS/.

## Qué es

- **Nodo 1 — Catálogo** (`#catalog`): implementa "Nodo 1 · Perfil" del
  vault (seis competencias híbridas del Creador Digital) — construido como
  "catálogo de especímenes" siguiendo la metáfora de guía de campo
  naturalista del resto del sitio (HUD, "Registro N.01", especímenes en
  órbita del Nodo 0). 6 placas de disciplina en carrusel horizontal, blob
  por disciplina generado por código que muta entre tarjetas, fondo
  reactivo al color de la activa. **Nombre sin confirmar con el vault** —
  "Catálogo" no aparece en el plan de desarrollo; si se documenta ahí
  también, usar el mismo término en ambos lados.

## Decisiones de diseño (no reabrir sin razón)

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
  `01-02` (UX/UI→3D, `UX.UI A 3D.mp4`), `02-03` (3D→Software,
  `3D A SOFTWARE.mp4`), `03-04` (Software→Game, `SOFTWARE A GAME.mp4`),
  `04-05` (Game→Multimedia, `GAME A MEDIA.mp4`, croma azul — el blob de
  Multimedia ya es verde-amarillento, `--spec-5`, choca con croma verde),
  `05-06` (Multimedia→IA, `MEDIA A IA.mp4`, croma azul por el mismo
  motivo). Los tres primeros usan croma verde. Colores medidos del fondo
  real: verde `0x4CED46`, azul `0x214FF6`. `TRANSICION 0 A UX-UI (1).mp4`
  no se usa (sería el edge 0→01, que no existe). Convención:
  `assets/disciplinas/frames/<edge>/0000.webp`…`NNNN.webp`, 62 frames cada
  uno (clips de ~5s a 12fps), **1280×720 completo, sin recortar** —
  comando exacto en `docs/arquitectura.md`, "Optimización de carga". `has-feed` es solo-agregar: una vez
  que una tarjeta muestra video real se queda así para siempre, el blob
  nunca vuelve (coincide con el flujo del sitio de referencia). Se activa
  ON en ambas tarjetas del edge activo, toggleado en `applyProgress()`,
  nunca se apaga. Config y carga perezosa por proximidad (±1 edge) en
  `EDGE_FEEDS` / `ensureEdgeFeedLoading()` / `scrubEdgeFeed()` en
  `script.js` — ojo con `ctx.clearRect()` antes de cada `drawImage()`: con
  alfa real, sin el clear queda "fantasma" del frame anterior en las zonas
  transparentes.

- **Blobs del catálogo**: SVG generado en JS, no assets. Los 6 paths usan
  la *misma estructura de comandos* (`M` + 8×`C` + `Z`, ver `blobPath()`
  en `script.js`) para poder interpolarse en caliente con
  `gsap.utils.interpolate` sin plugin de morph.

## Pendiente

- **Copy final de las 6 placas del catálogo** — el actual es un borrador
  provisional (marcado con comentario `COPY PROVISIONAL` en `index.html`),
  a la espera del texto exacto y definitivo.

