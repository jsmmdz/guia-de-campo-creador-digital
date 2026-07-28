# Nodo 3 — Método (`#method`)

> Léelo antes de tocar Método. Regla dura: sin GSAP/ScrollTrigger/pin. Tipografía con datos exactos de Figma.
> Extraído literal de CLAUDE.md el 2026-07-26. Fuente de verdad de contenido y narrativa: el vault en DOCUMENTOS/.

## Qué es

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

## Decisiones de diseño (no reabrir sin razón)

- **Método — sin scroll-jacking, a propósito.** Es el único nodo del sitio
  donde eso es una regla explícita del spec (§4), no una omisión.

  > **Aclaración del usuario (2026-07-27) — leer antes de aplicar la regla.**
  > Lo prohibido es la **mecánica**: pin, scrub, progreso fraccional atado al
  > scroll, animación frame por frame y `position:fixed` dentro del nodo.
  > **GSAP como librería no está vetado**: puede usarse para animación
  > autónoma en loop, que corre sola sin depender del scroll. El spec §4 lo
  > respalda — al enumerar lo que sí se anima incluye "el fondo que se
  > importará más adelante", además del marquee y la entrada de cada bloque.
  > La letra del spec dice "no usar GSAP" (§4 y §6), pero su intención es
  > impedir que este nodo vuelva al scroll-jacking de Territorio, no elegir
  > motor de animación. El párrafo que sigue describe cómo quedó construido
  > el nodo en su primera versión, cuando la regla se aplicó en sentido
  > estricto.

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
- **Método — fondo "Background Lines" (puerto de Aceternity UI), detrás de
  los 12 bloques.** Portado primero aislado en
  `PRUEBAS/Prototipo - Aceternity Background Lines/` (21 paths SVG × copias,
  paths/colores copiados verbatim de la pestaña "Manual" del componente),
  integrado a `.method__bg` (primer hijo de `.method`, `pointer-events:none`,
  `aria-hidden`). `initMethodBackground()` en `script.js` construye el SVG
  siempre (motionOK o no); anima con GSAP solo si `motionOK`.
  - **`position:sticky`, no `absolute`.** Pedido explícito del usuario tras
    ver dos intentos previos: primero tileado en "bandas" verticales para
    cubrir la columna larga (se leía como "un efecto por pantalla", no un
    bucle continuo); después un solo paso estirado con
    `preserveAspectRatio="none"` a la altura real de `.method` (se veía
    "desproporcionado y alargado"). La versión final usa un contenedor del
    tamaño real del viewport (`height:100svh`) con `position:sticky;top:0` —
    se clava al tope mientras se hace scroll por los 12 bloques y se libera
    solo, en CSS puro, en el borde inferior real de `.method`
    (`margin-bottom:calc(-100vh)` cancela el hueco que el propio sticky
    reservaría en el flujo, para no empujar el contenido 100vh hacia abajo).
    **Toca el límite de la regla dura "ni `position:fixed` dentro del
    nodo"** sin violarla en la letra (sticky ≠ fixed, se libera solo) ni en
    el espíritu (los 12 bloques nunca se pinean, pasan una sola vez a la
    velocidad que decida quien navega — lo único clavado es esta capa
    decorativa). Confirmado antes de implementar que Lenis corre en modo
    nativo (`new Lenis({smoothWheel:true, syncTouch:false})`, sin
    `wrapper`/`content`) — un wrapper con `transform` rompe `sticky`, acá no
    hay ninguno.
  - **`preserveAspectRatio="xMidYMid slice"`, no `"none"`.** Escala
    uniforme + recorte, nunca deforma — directamente la causa de la queja
    "alargado" del intento anterior.
  - **Paleta alineada al sitio** (`--signal`/`--signal-hi`/`--t-accent` en
    vez del arcoíris original de Aceternity) — decisión tomada mostrando
    ambas paletas aplicadas al nodo real (capturas en Chrome, no en el panel
    embebido) y confirmada por el usuario. El último color del arcoíris
    original quedaba en `--t-ink` (#f2f1ec, casi el mismo tono del texto);
    sustituido por `--signal-hi` para no poner una línea casi del color del
    texto detrás del texto.
  - **Contraste calculado, no a ojo** (ver CLAUDE.md error #25 para el
    precedente). El color más claro de la paleta (#8f8dc4) mezclado a
    opacidad 1 sobre `--depth` (#050507) deja ~2.7:1 contra `--t-ink` si un
    trazo cae justo detrás de texto — por debajo del mínimo AA. Pico de
    opacidad de la animación capado en `METHOD_BG_PEAK_OPACITY = 0.55` (el
    prototipo usaba 1): con eso el peor caso sube a ≥4.5:1, verificado a
    mano con la fórmula de luminancia relativa de WCAG.
  - **3 copias superpuestas por path** (21 en laptop+, 11 en móvil/tablet
    vía `mobileMQ`) **y `duration` al azar por trazo** (7-15s, antes fija en
    10 para todos) además del `delay`/`repeatDelay` que ya traía el
    prototipo — pedido explícito del usuario tras ver la primera pasada
    ("aumenta la cantidad de líneas... desfasa cada una... la velocidad
    entre ellas").
  - **Contención de rendimiento** (mismo patrón que Galaxy en el Nodo 0):
    móvil/tablet usa la mitad de los paths; el loop arranca en pausa
    (`paused:true`) y un `ScrollTrigger.create()` con solo
    `onEnter`/`onEnterBack`/`onLeave`/`onLeaveBack` (sin `pin` ni `scrub`)
    lo pausa/reanuda según si `.method` está realmente en pantalla — mismo
    mecanismo que `setThresholdVisible` del Nodo 0.
  - Bug real encontrado en el camino, ver CLAUDE.md error #27: `.method`
    necesitó `isolation:isolate` — sin contexto de apilamiento propio, el
    `z-index:-1` de `.method__bg` escapaba al contexto raíz y quedaba
    pintado detrás del `background:black` opaco de `<body>`.


## Pendiente

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


