# Nodo 2 — Territorio (`#territory`)

> Léelo antes de tocar Territorio: 5 ScrollTrigger pineados, fichas técnicas, indicador de altitud.
> Extraído literal de CLAUDE.md el 2026-07-26. Fuente de verdad de contenido y narrativa: el vault en DOCUMENTOS/.

## Qué es

- **Nodo 2 — Territorio** (`#territory`): implementa "Nodo 2 · Territorio"
  del vault — el mercado creativo-tecnológico como tres altitudes reales
  (Suelo, Ladera, Cima) que se recorren de abajo hacia arriba, cada una con
  menos gente y más poder de fijar las reglas. 5 tramos con scroll-jacking
  pineado (Intro · Suelo · Ladera · Cima · Cierre), cada uno paginado en
  capas que se cruzan en fundido (`initTerritory()` en `script.js`, función
  propia dentro del IIFE para no chocar con el Catálogo). Cada nivel repite
  la misma estructura: nombre → intro narrativa en zigzag → frase de cierre
  → ficha técnica (panel completo, nunca campo por campo) → nota de campo
  (+ callout en Suelo/Ladera, Cima no tiene). Cierra con un remate y nada
  más: la comparativa de las 3 fichas juntas **se eliminó el 2026-07-29** —
  §2.4 ya no existía en el contenido cerrado y sus tarjetas recortaban las
  fichas con texto que no estaba en el vault. **Primera versión construida en una
  sesión de agentes en paralelo (workflows) siguiendo al pie de la letra
  los specs del vault y evitando los errores ya documentados de un intento
  anterior** (`Spec - Nodo 2 Territorio (correcciones de
  implementacion).md`), y después depurada con verificación real en
  navegador (no solo medición de DOM/CSS — ver errores #20-23). **Sigue
  pendiente confirmar la diagramación exacta contra las capturas de Figma**
  (el conector de Figma no estaba autorizado en esa sesión) — ver
  Pendiente.

## Decisiones de diseño (no reabrir sin razón)

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
  `applyStintProgress()`).
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

## Pendiente

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


