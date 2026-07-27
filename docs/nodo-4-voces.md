# Nodo 4 — Voces (`#voices`)

> Léelo antes de tocar Voces. Sin GSAP/pin. Primer botón interactivo real del sitio (acordeón).
> Extraído literal de CLAUDE.md el 2026-07-26. Fuente de verdad de contenido y narrativa: el vault en DOCUMENTOS/.

## Qué es

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


## Decisiones de diseño (no reabrir sin razón)

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


## Pendiente

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


