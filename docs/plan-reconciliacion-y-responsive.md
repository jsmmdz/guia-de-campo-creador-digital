# Plan — Reconciliación de Rutas + fase de responsive

> Abierto 2026-07-28. Documento de continuidad: si la sesión se corta, se
> retoma desde acá sin volver a medir. Cada fase dice **qué instrumento** la
> valida (DESIGN.md §8) y **qué decisión del usuario** ya está tomada.

---

## Fase 0 · Reconciliar el Figma de Rutas contra DESIGN.md §11 y el sitio

**Estado: medido. Falta decidir 3 puntos y aplicar.**

Medición hecha el 2026-07-28 con `get_design_context` sobre el frame
`Desktop - 17` (`270:563`, fileKey `ml7agEUFaiqNyknGicfH5B`), el mismo nodo
que ya citaba §11 — el node-id no cambió, el contenido sí.

Evidencia de que el frame se movió después del commit: `cf3c261` es de las
13:26 y `IMAGENES/frames figma/nodo 5 rutas.png` se reexportó a las 13:43.

### 0.1 · Lo que quedó confirmado sin cambio

No se toca nada de esto — frame, §11 y sitio coinciden:

- Escala completa: 128 · 85 · 80 · 48 · 32/52.8 · 48/32 · 32/32 · 12/1.98 ·
  11/1.1 · 11/2.42.
- Paleta de la tarjeta: `rgba(18,20,17,.5)` · `rgba(70,69,84,.3)` · `#c0c1ff`
  y `rgba(111,17,0,.1)` · `rgba(255,180,164,.3)` · `#ffb4a4`.
- Los seis `--spec-N` del Catálogo, hex por hex, sin variación.
- Ritmo de las tres líneas: **281px** y **289px** entre centros.
- Alto de tarjeta 347px, padding 25px, corchetes de 8px, `backdrop-blur(2px)`.
- Filete de acento de la bisagra: **4px** (D-19 sigue abierta como criterio,
  pero el valor no cambió).
- D-17 (Archivo Narrow + JetBrains Mono) y D-20 (`A DIA DE HOY` repetida,
  corchetes lavanda en la tarjeta FUTURO) **siguen sin corregir en el Figma**.
- D-18 sin cambios: tres márgenes en el mismo frame — 106 combinador,
  118 bisagra/enunciado, 120 prosa.

### 0.2 · Lo que cambió y hay que escribir en §11

| | Qué mide el frame hoy | Qué dice el sitio | Acción |
|---|---|---|---|
| C-01 | Pico de cierre **128px Plus Jakarta Bold**, centrado, `line-height: 127px`, `#e4e1ee`, ancho 1231 — "El resto lo combina quien la use." como bloque propio | Última oración de `.routes__outro`, a 32px dentro del párrafo | Promover a bloque |
| C-02 | Chip de línea **46px** de alto, chip de disciplina **50px** | ~32px a 1440, ~31px en tablet | Decisión pendiente (P-2) |
| C-03 | Gap entre chips: **30px** líneas, **35px** disciplinas | 30px las dos filas | Aplicar 35px a disciplinas |
| C-04 | Botón `¿Y CÓMO SE VE EL FUTURO?`: filete `#9e3000`, tinta `#ffbda8`, 14px, tracking 1.4px | 12px, filete y tinta `#e4e1ee` | Aplicar — ata el botón a la familia salmón de FUTURO |
| C-05 | Marquesina Gantari **ExtraBold** (800); enunciado Gantari **Bold** (700) | 800 en los dos | Corregir §11 y el enunciado |
| C-06 | Etiqueta de horizonte **10px**, tracking 1.8px, `#908fa0` | 11px, tracking 1.98px, `#908fa1` | Aplicar |
| C-07 | Gap interno de la tarjeta FUTURO **12px**; HOY 8px | 8px las dos | Aplicar |
| C-08 | **Footer placeholder**: banda gris `#757575` a sangre, 1440×367, con `FOOTER` en Gantari Bold Italic 85px | El sitio termina en `</section>` | Solo registrar — es un placeholder, no un diseño |

### 0.3 · Los tres puntos dudosos, resueltos

Se llevaron al usuario y no hubo respuesta; se resolvieron con el vault y con
la medición, sin elegir ningún número a ojo.

- **P-1 · `.routes__venture`. Se queda.** `Spec - Nodo 5` §3.12 ya había
  registrado que el frame no dibuja el bloque y resolvió por la regla 1 de
  precedencias que el contenido manda. No es un descarte nuevo.
- **P-2 · Alto de chip. 50px.** Es el valor que declaran 3 de los 4 estados
  de chip del frame; el 46px del chip de línea sin seleccionar es un desliz
  —un chip no puede cambiar de alto al seleccionarse—. Registrado como D-21.
- **P-3 · Etiqueta → chips. 24px, sin cambio.** El `pt-87/97px` del frame es
  residuo de haberle fijado altura al contenedor en Figma; el spec ya lo
  había medido en 24px en su propia pasada.

### 0.4 · Salida de la fase — **hecha 2026-07-28**

1. `DESIGN.md` §11 reescrito: §11.1 escala (con los dos picos de 128px y los
   dos pesos de Gantari), §11.2 paleta (+ los dos hex del botón), **§11.3
   geometría del combinador** (nueva), **§11.4 qué cambió en la remedición**
   (nueva), §11.5 discrepancias. D-21 a D-25 agregadas a §9.
2. `styles.css` + `index.html`: C-01 a C-05 aplicados, `?v=26`.
3. Verificado a 1440 sobre el sitio renderizado — ver §0.5.

### 0.5 · Verificación a 1440

Medido con `getBoundingClientRect` / `getComputedStyle` sobre el sitio real
(ancho de layout 1425, la barra de scroll de §2):

| | Esperado | Medido |
|---|---|---|
| Chips de línea | 50px, gap 30 | 50 · 50 · 50 · 50 · 50, gap 30px |
| Chips de disciplina | 50px, gap 35 | 50 × 6, gap 35px |
| `EXPLORACIÓN DE RUTAS` | Gantari 700, 85px | Gantari, 700, 85.104px |
| Remate | 128px / 127px, Bold recto, centrado | 128.016 / 126.992, 700, `normal`, centrado, 1215px de ancho = `--page-col` |
| Botón | 14px, `#9e3000` / `#ffbda8` | 14.112px, `rgb(158,48,0)` / `rgb(255,189,168)` |
| Cierre | termina en *"la empieza."* | ✓ |
| Emprendimiento | sigue en el DOM | ✓ |
| Desborde horizontal | ninguno | `scrollWidth == clientWidth == 1425` |
| Consola | limpia | sin errores |

El remate parte en **2 renglones** a 1440 (254px de alto), igual que en el
frame — su caja de 1231px tampoco entra la oración en uno.

**Falso positivo descartado:** el barrido de desbordes marca ~120 nodos de
`.routes__matrix-table`. La matriz está en `position: absolute` con `clip` y
1px de ancho —el fallback accesible, oculto cuando el combinador arma—, así
que sus descendientes reportan un `right` que no existe en pantalla. Es el
mismo caso que los `span` del marquee (DESIGN.md §8.c).

**Sin captura.** El panel embebido no compositea si no está desplegado y el
screenshot expira; las mediciones de arriba no dependen del compositing, así
que el dato está, la foto no. Si se quiere la foto, va en Chrome real.

---

## Fase 1 · Responsive

**Alcance a elegir por el usuario antes de escribir CSS.** Son dos tareas de
tamaño muy distinto y no se mezclan.

**Alcance elegido por el usuario: (a) y después (b).**

### Rama (a) — Terminar el responsive de Rutas — **HECHA 2026-07-28**

Lo que se hizo, en `?v=28`:

1. **Los ocho saltos narrativos a `clamp()`.** 350 · 281 · 289 · 342 · 384 ·
   424 · 451 · 480 pasaron a tokens `--r-air-*` derivados con la fórmula de
   §2. Antes los dos `@media` los aplastaban a **96px planos**, lo que
   borraba la jerarquía entera del nodo que más respira del sitio.
2. **Los dos `@media` de márgenes se eliminaron.** Queda un solo bloque
   `≤767`, y es de estructura —la ficha de Emprendimiento de fila a
   columna—, que es el criterio de §7. Primera aplicación de la cascada
   invertida sobre ritmo vertical y no sobre tipografía.
3. **Bug encontrado de paso:** los `@media` pisaban `margin-top` pero no
   `margin-bottom`, así que el cierre y el remate conservaban **480px por
   debajo cada uno** en móvil — 960px de aire muerto al final del sitio en
   un teléfono. Resuelto al subir todo al tier base.
4. **Bug encontrado por el agente:** los cuatro bloques de 1159px
   (aterrizaje, matriz, Emprendimiento, cierre) usaban `max-width: 1159px`
   con `margin: auto`, y por debajo de 1159px de viewport el `auto` no
   reparte nada: **la prosa quedaba a sangre**, 390px de ancho en un
   viewport de 390, tocando los dos bordes. El combinador no lo tenía
   porque ya usaba `--page-col`. Pasaron a `min(1159px, var(--page-col))`.

**Verificación** — agente de medición sobre 1440 · 1024 · 768 · 390 · 375 ·
359, más recontrol propio después del punto 4:

| | Resultado |
|---|---|
| Chips | 50px en los seis anchos, ninguno bajo 40. Wrap de 1 → 2 → 3 renglones (líneas) y 1 → 2 → 5 (disciplinas). Nunca `<select>` |
| Ritmo vertical | monótono en los seis anchos, **cero inversiones** |
| Tarjeta | **0 de 60** combinaciones desbordan, en 1440 · 768 · 390 · 359. Padding 25px uniforme |
| Desborde dentro de `.routes` | ninguno, en los seis anchos |
| Prosa | mínimo 19px; ninguna bajo 16 |
| Medida de lectura | 66 a 1440 · **69 a 1024** (era 81, sobre el techo de ~77 de §7) · 32 a 390 |
| Consola | sin errores |

**No reproducido:** el margen interno de 16px de la tarjeta a 375px que
estaba anotado como pendiente. Medido da **25px uniforme en los cuatro
lados en los seis anchos**, y 0 desbordes. Puede venir de la auditoría del
prototipo aislado, antes de integrar.

### Rama (a) — plan original, para referencia

Punto de partida: hoy `styles.css` tiene solo dos bloques `@media` para
Rutas — `≤767` y `768–1023` — que aplastan todo el ritmo narrativo a
`--sp-6` (96px). Los saltos de 281 · 289 · 342 · 384 · 424 · 451 · 480px
están literales a 1440 y no derivan a nada intermedio.

No hay frame de móvil. **El único instrumento válido es §8.c**: inyectar
valores candidatos por JS sobre el sitio renderizado y medir. Nunca elegir
un número a ojo.

| Paso | Qué | Ancho de verificación |
|---|---|---|
| a.1 | Fijar el chip: alto y piso táctil coherentes en los cuatro tramos | 1440 → 768 → 390 → 359 |
| a.2 | Derivar los pisos del ritmo narrativo (los 7 saltos) por barrido de candidatos | 390 y 359 |
| a.3 | Margen interno de la tarjeta: 16px a 375 es el más ajustado de los anchos probados | 375 |
| a.4 | Wrap de chips a 2–3 renglones, nunca `<select>` (DESIGN.md §7) | 390 y 359 |
| a.5 | Auditoría de cierre: desbordes, medida de lectura, targets táctiles | los cuatro |

### Pista que dejó la verificación de (a), para (b)

A 390 · 375 · 359 el **documento** desborda: `scrollWidth` 413 contra
`clientWidth` 390/375/359. **No viene de Rutas** —su barrido interno da
limpio en los seis anchos—. El `right` máximo lo fijan tres elementos de
otros nodos:

- `.field-bg` — ancho fijo de **413px**, que es exactamente el número que
  manda. Es el que hay que mirar primero.
- `.threshold__sweep` (Umbral).
- `.territory__callout` — ya registrado como **D-11** en DESIGN.md §9,
  *"desborda en celular, bug real, sin tocar"*.

**Resuelto, y la atribución del agente era incorrecta.** Medido de nuevo:
`.field-bg` y `.threshold__sweep` están dentro de un ancestro con
`overflow: hidden` y no pueden generar scroll. El único culpable real era
`.territory__callout`, y no por falta de breakpoint sino por una colisión
de especificidad — **D-11, cerrada**, detalle en DESIGN.md §9. Al
arreglarla `scrollWidth` volvió a igualar `clientWidth` en los tres anchos
chicos.

Lección de método: `scrollWidth > clientWidth` con `body { overflow-x:
hidden }` no prueba que haya scroll horizontal. La prueba que decide es
`window.scrollTo(2000, y)` y leer `scrollX` — si no se mueve, el desborde
es fantasma y hay que buscar contenido **recortado**, no scroll.

### Estado de (b)

| Nodo | Estado |
|---|---|
| Territorio | **D-11 cerrada.** Falta la migración de sus `--sp-N` a `clamp()` |
| Método | Sin empezar. Arrastra D-01 (mide la mitad de ancho que Figma) y D-14 (cuatro celdas donde van cinco) |
| Voces | Sin empezar. Un bug visual abierto en la cita de Melisa |
| Umbral | Sin empezar. `script.js` lee 767/1023 para el radio de la órbita |
| Catálogo | Sin empezar. El más riesgoso: pin y frames por edge |

### Rama (b) — Migrar los otros nodos a la cascada de DESIGN.md

Umbral, Catálogo, Territorio, Método y Voces todavía usan el sistema viejo:
un `@media` por breakpoint con `--sp-N` fijos. Hay que pasarlos a `clamp()`
fluido anclado a 1440.

**Un nodo por vez, con su verificación antes de pasar al siguiente.** Orden
propuesto, de menor a mayor riesgo de romper mecánica:

1. **Método** — ya tiene la escala medida en DESIGN.md §5 y arrastra D-01
   (mide la mitad de ancho que Figma) y D-14 (cuatro celdas donde van cinco).
2. **Voces** — acordeón; un bug visual abierto en la cita de Melisa.
3. **Umbral** — cuidado: `script.js` lee los cortes 767/1023 para el radio
   de la órbita.
4. **Territorio** — cinco ScrollTrigger pineados; D-11 abierta.
5. **Catálogo** — el más riesgoso: scroll-jacking con pin y frames por edge,
   y `script.js` decide su modo por breakpoint.

Cada nodo cierra con: medición a 1440 contra su frame, barrido a 390/359, y
confirmación de que su mecánica de scroll sigue viva.

---

## Instrumentos: qué skill y qué agente, y por qué

Criterio: una skill o un agente entra solo si da un salto de calidad o un
ahorro de tokens que se pueda justificar. Todo lo demás se hace inline.

### Skills que sí

| Skill | Dónde | Por qué |
|---|---|---|
| `figma-design-to-code` | Fase 0 | Obligatoria antes de `get_design_context`. Ya usada. |
| `web-design-guidelines` | a.5 y cierre de cada nodo de (b) | Auditoría de targets táctiles, foco y contraste. Es exactamente el problema del chip. |

### Skills que no, y por qué no

`emil-design-eng`, `frontend-design`, `apple-design`, `microinteractions`,
`animation-vocabulary`, `find-animation-opportunities`, `improve-animations`,
`review-animations`, `impeccable`, `ui-ux-pro-max`.

Todas son de **dirección estética y de motion**. Este pedido no es de
dirección: es geometría derivada de medición, y el proyecto tiene una regla
dura que la contradice —*ningún valor de layout inventado a mano*
(CLAUDE.md / DESIGN.md §1). Una skill de taste empuja justo hacia ahí.

`gsap-scrolltrigger` queda fuera por una razón distinta: del Nodo 3 en
adelante el scroll-jacking está prohibido y Rutas revela con
`IntersectionObserver` + CSS.

El paquete de motion y acabado tiene su propia sesión, ya briefeada en el
vault (`Brief - Sesion de UX y Acabado Premium`) — ahí sí entran.

### Agentes

Máximo 2 en simultáneo, roles disjuntos, ninguno duplicando verificación.

| Agente | Rol | Justificación |
|---|---|---|
| **Medidor** | Levanta el sitio, fija el viewport, inyecta candidatos por JS y devuelve solo la tabla de números (desborde, medida de lectura, alto de target) | Es el trabajo más caro en contexto de toda la fase: decenas de mediciones por ancho. Devuelve datos, no prosa. |
| **Auditor de nodo** (solo rama b) | Por nodo: inventaria sus `@media` y sus `--sp-N` fijos, y los cruza contra su frame | Lectura ancha de CSS viejo que no hace falta traer entero al hilo principal. Uno por nodo, nunca dos a la vez. |

Quien decide y quien escribe el CSS es el hilo principal. Los agentes miden e
inventarían; no eligen valores.

---

## Verificación

- Chrome real vía `claude-in-chrome`, nunca el panel embebido: no compositea
  si está plegado y da falsos negativos (CLAUDE.md).
- `?static=1` para medir sin reveals en `opacity: 0`.
- Falsos positivos conocidos: los `span` del marquee reportan `right` fuera
  del viewport y está bien (DESIGN.md §8.c).
- `?v=N` en `index.html` en **cada** commit que toque `styles.css` o
  `script.js`.
