# Plan — Reconciliación de Rutas y migración responsive

> Abierto 2026-07-28. **Documento de continuidad**: si la sesión se corta, se
> retoma desde acá sin volver a medir.

## Definiciones cerradas con el usuario — 2026-07-28

Respuestas al cuestionario. Mandan sobre cualquier cosa que este documento
dijera antes.

| | Decisión |
|---|---|
| **Entrega** | **Mañana.** Todos los nodos deben quedar impecables |
| **Qué es "perfecto"** | No alcanza con que sea correcto: la **composición** de cada ancho tiene que verse diagramada, no solo sin defectos |
| **Cómo se adapta** | **Rediseñando el bloque**, no escalando la proporción de 1440. En móvil, casi todo a **una sola columna** |
| **Qué se toca** | **Todo.** Los seis nodos están como el prototipo y hay que rediseñarlos en cada breakpoint |
| **Rango** | **320 → 1920.** Piso 320 por iPhone SE y Android viejo |
| **2560** | **Fuera del set de verificación** (decisión 2026-07-28). Un 4K real casi nunca reporta 2560px de CSS: con escalado de 150–200% un 27" 4K le da al navegador ~1920. Igual se conserva que cada nodo **tope y centre** su contenido, que cuesta una línea y evita que se estire en una proyección grande |
| **Barra de calidad** | **90%.** No alcanza con que ande sin defectos; tampoco hace falta perfección absoluta en cada ancho |
| **Crecimiento** | Todas las tipografías y elementos **crecen hasta 1920**. De 1920 a 2560 no crece nada: crecen los márgenes |
| **Horizontal en móvil** | Fuera de alcance |
| **Quién cierra un nodo** | El usuario mira y aprueba. Yo entrego verificado por números |
| **Commits** | **Solo dos**: mitad de las fases en uno, mitad en el otro |

### Discrepancias resueltas acá

| | Estaba | Queda |
|---|---|---|
| **D-26** | Las tres líneas a 85px vs 96 del Figma | **96px, gana el Figma** |
| **D-16** | `EMERGE DE ÉL` en Gantari 96 vs Plus Jakarta | **Plus Jakarta Bold 128** |
| **D-14** | "Falta la quinta condición de Frascati" | **Estaba mal el diagnóstico: faltaba la tercera, y es `INCIERTO`.** Ya corregida en el contenido y en el frame. Las cinco son original · novedoso · incierto · sistemático · transferible |
| **D-12** | Tres convenciones de `clamp()` conviviendo | **Unificar: todo crece hasta 1920** (techo = valor × 4/3). Método hoy congela en el valor de 1440 y hay que subirlo |

### Consecuencia: las fases 0 a 3 se reabren

Se habían cerrado con criterio numérico y **sin rediseño por breakpoint**.
Bajo la definición de arriba eso ya no alcanza: Rutas y Método tienen que
volver a pasar por el rediseño a una columna, por 2560 y por el techo nuevo
de crecimiento. Lo hecho no se tira —los anchos, los interlineados y el ritmo
medidos siguen siendo válidos—, pero **ninguna fase está cerrada hasta que
pase el rediseño y tu aprobación visual**.

## Regla de corte: 90% y seguir

**Cuando un nodo pasa los criterios de aceptación y se ve bien diagramado,
se cierra y se pasa al siguiente.** No se pule.

El motivo es económico, no estético: el último 10% de un nodo cuesta más
tokens que el 90% anterior, y con seis nodos por delante ese 10% se paga seis
veces. Un nodo al 90% terminado vale más que uno al 100% y dos sin empezar.

Señales de que estás gastando en el 10% que no rinde:
- Ajustar un valor por segunda vez sin que ningún criterio lo pida.
- Medir un ancho que ya dio bien para "confirmar".
- Discutir con vos mismo entre dos valores que ambos pasan.
- Reescribir un comentario que ya explicaba lo mismo.

Si aparece cualquiera de esas, cerrá el nodo y seguí.

## Protocolo de tokens

Vale tanto como el criterio de diseño. Con la fecha encima, los tokens
gastados de más en un nodo son nodos sin empezar.

**Leer**
- Solo lo que este plan te mande. `DESIGN.md` **no se lee entero** — se
  entra por la sección que corresponde.
- `grep` con `-A`/`-B` antes que `Read` de un archivo completo. El bloque de
  Método son 580 líneas; nunca hizo falta traerlas todas.
- Nada de releer un archivo después de editarlo: si el `Edit` no falló, quedó.

**Medir**
- **Una** llamada de `javascript_tool` por ancho, devolviendo un objeto
  compacto con todo lo del ancho. No una llamada por dato.
- Nada de capturas: el panel embebido falla siempre por timeout y cada
  intento es un turno perdido.
- No remedir lo que ya está anotado acá con su número.

**Delegar**
- Un agente entra solo si ahorra una lectura ancha o un barrido largo.
  Pedile **tablas, no prosa**, y prohibile explícitamente recomendar.
- Nunca dos agentes sobre lo mismo.

**Operar**
- Llamadas independientes en paralelo, en un solo mensaje.
- Un `Edit` con `replace_all` antes que ocho iguales — pero verificá después
  que no haya tocado otro nodo.

## Dónde está el contexto

| Documento | Qué tiene | Cuándo abrirlo |
|---|---|---|
| `CLAUDE.md` | Índice del repo y **reglas duras** | Siempre, primero |
| `docs/plan-reconciliacion-y-responsive.md` | **Este archivo.** Misión, criterios, estado, orden de trabajo, decisiones cerradas | Siempre, segundo. Entero |
| `DESIGN.md` §1 | La regla base: 1440 mide, móvil decide, y las tres fuentes legítimas de un valor | Antes de elegir cualquier valor |
| `DESIGN.md` §2 | **La fórmula** del `clamp()`: piso, slope, techo | Cada vez que derivés un valor |
| `DESIGN.md` §3 | Breakpoints y la cascada invertida | Al tocar un `@media` |
| `DESIGN.md` §4 | `--page-margin` y `--page-col` | Al tocar márgenes o anchos de columna |
| `DESIGN.md` §5 y §6 | Escala y paleta de **Método**, medidas por MCP | Al trabajar Método |
| `DESIGN.md` §7 | Comportamiento responsive **por tipo de elemento** — qué es cantidad y qué es estructura | Al decidir cómo adapta un bloque |
| `DESIGN.md` §8 | Protocolo de medición y sus falsos positivos | Al verificar |
| `DESIGN.md` §9 | Las discrepancias abiertas, D-01 a D-26 | Al toparte con algo que no cuadra |
| `DESIGN.md` §11 | **Rutas** completo, medido por MCP | Al trabajar Rutas |
| `docs/errores-corregidos.md` | Los 26 bugs ya resueltos, cada uno con su regla | Antes de tocar CSS o JS |
| `docs/nodo-0-umbral.md` … `nodo-4-voces.md` | Un archivo por nodo | Al empezar ese nodo |
| `DOCUMENTOS/Vault - Guía de Campo/00 - Indice.md` | **Fuera del repo.** Fuente de verdad de contenido, narrativa y mecánica. Resuelve precedencias cuando dos specs se contradicen | Solo si hay duda de contenido. Entrar por el índice, nunca a un documento suelto |

## Estado al abrir la sesión definitiva — 2026-07-28

**HEAD:** `9240b13`. **Sin commitear:** `DESIGN.md`, `styles.css`,
`index.html`, este plan. **`?v=33`.**

### Hecho y verificado a 1440 (sin commitear)

- **Método · D-01** — anchos a los valores medidos: `.method` a
  `--page-margin` (105px), apertura 1229, registro 1159, cita 896. La
  apertura pasa de romper en 5 líneas a **3**, como Figma.
- **Método · D-02** — los cuatro interlineados de 52.8px salen del token
  `--m-lh-528`, con piso relativo `1.1em` para que la interlínea nunca caiga
  por debajo del cuerpo.
- **Método · D-26** — las tres líneas a **96px** (gana el Figma).
- **Método · D-16** — `EMERGE DE ÉL` a **Plus Jakarta Bold 128px, recto**,
  con clase propia `.method__term--emerge`. `INVESTIGACIÓN-CREACIÓN.` queda
  en Gantari 85px.
- **Método · D-14** — cinco condiciones con `INCIERTO` en tercer lugar,
  cinco columnas de 242px. Verificado: ninguna parte en dos líneas.
- **Método** — diagrama de condiciones a **una columna en todo el tramo
  móvil**, no 2×2.

### Lo que falta, en orden de visibilidad

1. **Rediseño a una columna en móvil** de Umbral, Catálogo, Territorio y
   Voces. Es el grueso y lo que más se ve.
2. **Destrabar el crecimiento hasta 1920** (D-12) en todos los nodos: hoy
   solo Rutas lo hace; a Método le faltan ~15 techos de tipografía; los
   otros cuatro congelan en el valor de 1440.
3. **Revisar Rutas y Método bajo la barra de calidad nueva** — se cerraron
   con criterio numérico y sin rediseño por breakpoint.
4. Los deltas chicos de §5 en Método: trackings de 1.98/2px que no existen,
   chip 18→16, eyebrow 12→11, seq-label 24→20, cell-term 26→24, atribución
   11→12, teaser a Gantari 18px.

### Lo que se sacrifica primero si no alcanza el tiempo

En este orden, de lo primero que se tira a lo último:

1. **Los deltas chicos de §5** (punto 4). Son de conformidad, no se ven.
2. **Revisar Rutas y Método bajo la barra nueva** (punto 3). Se cerraron con
   criterio numérico antes de que la barra subiera, así que técnicamente
   están por debajo — pero son los dos que mejor están hoy.
3. **Medir los frames de Figma pendientes.** Es trabajo de conformidad y
   compite con el rediseño móvil, que es lo que sí se ve.

**Nunca se sacrifica el punto 1**, el rediseño a una columna. Es lo único
que un jurado con un teléfono en la mano va a notar.

### Node-id de Figma disponibles

`ml7agEUFaiqNyknGicfH5B` · Método `236:3` · Rutas `270:563` · y tres que pasó
el usuario, **sin identificar a qué nodo corresponde cada uno**: `47:4`,
`202:4`, `234:2820`.

**No los midas salvo que sobre tiempo al final.** Identificarlos cuesta una
llamada de MCP cada uno y sirve para conformidad, no para el objetivo.

## Misión

**Que el sitio se lea y se diagrame bien en todo ancho, derivándolo del
prototipo de 1440.**

Ese es el objetivo, y conviene ser preciso sobre el papel de 1440: no es una
meta, es el **origen**. El prototipo de baja fidelidad se construyó ahí y las
capturas de `IMAGENES/frames figma/` son de ahí, así que 1440 es de dónde
salen los números — pero el resultado que importa es la legibilidad y la
diagramación en los anchos donde el prototipo no existe.

De acá se sigue el criterio que ordena todo lo demás: **la conformidad con
Figma es el método, no el fin.** Un valor se copia del frame porque es la
única forma honesta de saber qué proporción quiso el diseño, no porque
parecerse al frame sea el objetivo. Cuando el frame y la legibilidad chocan
—como en la etiqueta de 10px de D-22— gana la legibilidad, que es lo que ya
decía §1 con *"móvil manda en las decisiones"*.

## Criterios de aceptación

Ninguna fase se cierra por opinión. Estos son los números que la cierran, y
son los que se miden en cada ancho:

| | Criterio | Umbral |
|---|---|---|
| L-1 | Ninguna prosa por debajo del mínimo legible | ≥ 16px |
| L-2 | Medida de lectura | ≤ ~77 caracteres (§7) |
| L-3 | Interlínea nunca por debajo del cuerpo | ratio ≥ 1.1 (el medido a 1440) |
| L-4 | Todo bloque de texto con margen lateral | nunca a sangre |
| D-1 | Jerarquía de tamaños monótona | cero inversiones entre anchos |
| D-2 | Jerarquía del ritmo vertical monótona | cero inversiones entre anchos |
| D-3 | Sin desborde ni contenido recortado | `scrollWidth == clientWidth`, y nada cortado por un `overflow: hidden` |
| D-4 | Cambio de cantidad fluido, cambio de estructura escalonado | §7 |
| T-1 | Área tocable | ≥ 40px |
| V-1 | Composición | **no lo cierra ningún número — ver abajo** |

### Los anchos donde se mide

**320 · 359 · 390 · 768 · 1024 · 1440 · 1600 · 1920.**

Los dos extremos se agregaron el 2026-07-28 porque faltaban y son justo los
que el objetivo nombra —*"desde móviles hasta pantallas de 1920"*—:

- **1920** es donde aterrizan **todos** los techos de los `clamp()`
  (`valor × 4/3`) y donde `--page-margin` congela en 140px. Es el ancho con
  más probabilidad de romper y no se había medido nunca.
- **1600** entra para tener un punto entre 1440 y 1920, que es el tramo donde
  todo está creciendo a la vez.
- **320** porque el tier `≤359` existía sin evidencia: nunca se probó un
  teléfono chico de verdad.

**Y un tier de alto, no solo de ancho:** 390×640 en horizontal. El sitio tiene
`min-height: 60vh` en Territorio, un respiro de `clamp(40vh, 46vh, 50vh)` en
Método y varios `100vh`; en viewport bajo eso se comporta distinto y hasta
ahora nadie lo miró.

### V-1 · Lo que los números no cierran

Los ocho criterios de arriba detectan desborde, ilegibilidad, recorte e
inversiones de jerarquía. **No detectan mala diagramación.** Un titular puede
no desbordar y aun así partir en cuatro renglones feos; una tarjeta puede
cumplir los ocho y estar mal compuesta.

El panel embebido **no puede sacar capturas** —falla por timeout porque no
compositea si no está desplegado—, así que todo lo verificado hasta hoy lo fue
por medición, nunca mirando.

**Mientras eso siga así, cada fase se cierra como "verificada por números, sin
pase visual"**, y V-1 queda pendiente para todas. Cerrarlo requiere una de dos
cosas: manejar el Chrome real del usuario con la extensión, o que el usuario
mire y reporte. Es una decisión suya, no técnica.

L-3 y D-3 salieron de bugs reales de esta sesión, no de una lista teórica: la
bisagra de Método quedaba con 28px de cuerpo y 26px de interlínea, y el
callout de Territorio perdía 22px recortados sin generar scroll.

## Tablero

| # | Fase | Estado |
|---|---|---|
| 0 | Reconciliar el Figma remedido de Rutas | **Cerrada** · `660d5e8` |
| 1 | Responsive de Rutas | **Cerrada** · `660d5e8` |
| 2 | Territorio · D-11, el callout recortado | **Cerrada** · `9240b13` |
| 3 | Método · D-01 anchos y D-02 interlineados | **Hecha, sin commitear** · `?v=31` |
| 4 | Voces · responsive | **Lista para empezar** |
| 5 | Umbral · responsive | **Lista para empezar** |
| 6 | Catálogo · responsive | **Lista para empezar** — la más riesgosa |
| 7 | Territorio · responsive | Bloqueada — falta node-id **y** medición |
| 8 | Método · el resto de §5 | Bloqueada — decisión de D-26 |
| 9 | Footer real de Rutas | Sin empezar — no es responsive |

### Por qué las fases 4, 5 y 6 ya no están bloqueadas

Estaban marcadas como "falta node-id" cuando el encuadre era conformidad con
Figma. Con la misión de arriba, **no hace falta el frame**: esos tres nodos ya
renderizan a 1440 el diseño aprobado, y ese renderizado es una medición
legítima (§8.c). La migración se vuelve mecánica — se leen sus valores
computados a 1440 y se derivan las curvas que reproducen ese mismo valor ahí y
se comportan hacia abajo.

**Territorio es la excepción, y por un motivo concreto:** es el único que el
repo marca *"sin confirmar contra Figma"*. Anclar su 1440 actual en una curva
petrificaría el error si lo hubiera — que es exactamente lo que habría pasado
con Método, donde el 1440 estaba mal (D-01, la apertura medía 736px donde
Figma pide 1229) y congelarlo habría fijado la mitad del ancho para siempre.

**Regla que sale de esto:** el sitio renderizado sirve como ancla solo cuando
hay razón para creer que su 1440 es correcto. Donde no la hay, hace falta el
frame.

### Los dos bloqueos vivos

1. **Faltan node-id y medición de Territorio** → frena la fase 7.
2. **D-26 sin decidir**, y con ella D-16 y el nombre de la quinta condición
   de Frascati (D-14) → frenan la fase 8.

Ninguno de los dos frena las fases 4, 5 y 6, que es donde está el grueso.

---

## Fase 0 · Reconciliar el Figma remedido de Rutas

**Cerrada.** Frame `Desktop - 17` (`270:563`, fileKey `ml7agEUFaiqNyknGicfH5B`),
medido con `get_design_context`. El node-id no cambió, el contenido sí:
`cf3c261` es de las 13:26 y el PNG se reexportó a las 13:43.

### Lo que quedó confirmado sin cambio

Escala completa (128 · 85 · 80 · 48 · 32/52.8 · 48/32 · 12/1.98 · 11/1.1 ·
11/2.42) · paleta de la tarjeta · los seis `--spec-N` hex por hex · ritmo de
281 y 289px · tarjeta de 347px con padding 25 y `blur(2px)` · filete de 4px ·
los tres márgenes de D-18 (106/118/120). D-17 y D-20 siguen sin corregir en
el Figma.

### Lo que cambió

| | Frame hoy | Sitio | Resultado |
|---|---|---|---|
| C-01 | Remate como pico propio de **128px** Plus Jakarta Bold recto, leading 127, ancho 1231 | última oración del párrafo de cierre, a 32px | Aplicado |
| C-02 | chip de línea **46px**, de disciplina **50px** | ~32px a 1440, ~31 en tablet | Aplicado a **50px** (D-21) |
| C-03 | gap 30px líneas / **35px** disciplinas | 30px las dos | Aplicado |
| C-04 | botón filete `#9e3000`, tinta `#ffbda8`, 14px | 12px, todo `#e4e1ee` | Aplicado |
| C-05 | marquesina **ExtraBold**, enunciado **Bold** | 800 los dos | Aplicado |
| C-06 | horizonte 10px / `#908fa0` | 11px / `#908fa1` | **No** — 10px cae bajo el mínimo de etiqueta de §2 (D-22) |
| C-07 | gap interno 12px en la tarjeta FUTURO | 8px las dos | **No** — un gap por estado haría saltar una tarjeta que Spec §4.2 manda quieta (D-23) |
| C-08 | footer placeholder gris a sangre | termina en `</section>` | **No** — es placeholder, no diseño (D-24) |

### Los tres puntos dudosos

Se llevaron al usuario, no hubo respuesta, y se resolvieron con el vault y con
la medición — sin elegir ningún número a ojo.

- ~~**`.routes__venture` se queda.** `Spec - Nodo 5` §3.12 ya había registrado
  que el frame no lo dibuja y resuelto que el contenido manda.~~
  **Revertido el 2026-07-29: la ruta transversal de Emprendimiento se eliminó
  del sitio.** El usuario confirmó que ya estaba descartada del contenido
  hacía tiempo y solo faltaba quitarla del HTML; su texto venía del Spec, no
  de `Contenido - Nodo 5 Rutas.md`. Se borraron también sus reglas de CSS.
- **Chip a 50px.** Es lo que declaran 3 de los 4 estados del frame; el 46px
  del chip sin seleccionar es un desliz — un chip no cambia de alto al
  seleccionarse.
- **Etiqueta → chips, 24px.** El `pt-87/97px` del frame es residuo de
  haberle fijado altura al contenedor; el spec ya lo había medido en 24px.

### Verificación a 1440

Chips 50px con gaps 30/35 · `EXPLORACIÓN DE RUTAS` en Gantari 700 a 85.104px ·
remate 128.016/126.992 recto y centrado en 1215px · botón 14.112px en
`rgb(158,48,0)`/`rgb(255,189,168)` · Emprendimiento en el DOM ·
`scrollWidth == clientWidth` · consola limpia.

El remate parte en **2 renglones**, igual que en el frame.

**Falso positivo descartado:** el barrido marca ~120 nodos de
`.routes__matrix-table`. La matriz está en `position: absolute` con `clip` y
1px de ancho — es el fallback accesible oculto. Mismo caso que los `span` del
marquee (§8.c).

---

## Fase 1 · Responsive de Rutas

**Cerrada.** El nodo tenía sus ocho saltos narrativos literales a 1440 y dos
`@media` que los aplastaban a 96px planos.

1. **Los ocho saltos a `clamp()`** — 350 · 281 · 289 · 342 · 384 · 424 · 451 ·
   480 pasaron a tokens `--r-air-*` derivados con la fórmula de §2. Es la
   primera aplicación de la cascada invertida sobre **ritmo vertical** y no
   sobre tipografía. En este rango manda el slope: el piso recién actúa por
   debajo de ~343px de viewport.
2. **Los dos `@media` de márgenes se eliminaron.** Queda uno solo, `≤767`, y
   es de estructura —la ficha de Emprendimiento de fila a columna—, que es el
   criterio de §7.
3. **Bug: 960px de aire muerto.** Los `@media` pisaban `margin-top` pero no
   `margin-bottom`, así que el cierre y el remate conservaban 480px por debajo
   cada uno en móvil.
4. **Bug: la prosa a sangre.** Los cuatro bloques de 1159px usaban
   `margin: auto` sin `--page-col`; por debajo de 1159px de viewport el `auto`
   no reparte nada y el párrafo medía 390px en un viewport de 390, tocando los
   dos bordes. Pasaron a `min(1159px, var(--page-col))`.

### Verificación — 1440 · 1024 · 768 · 390 · 375 · 359

| | Resultado |
|---|---|
| Chips | 50px en los seis anchos. Wrap 1→2→3 (líneas) y 1→2→5 (disciplinas). Nunca `<select>` |
| Ritmo vertical | monótono en los seis, **cero inversiones** |
| Tarjeta | **0 de 60** combinaciones desbordan, en 1440 · 768 · 390 · 359 |
| Desborde en `.routes` | ninguno |
| Prosa | mínimo 19px |
| Medida de lectura | 66 a 1440 · **69 a 1024** (era 81, sobre el techo de ~77 de §7) · 32 a 390 |

**No reproducido:** el margen interno de 16px de la tarjeta a 375px que estaba
anotado como pendiente. Mide **25px uniforme en los cuatro lados en los seis
anchos**, con 0 desbordes. Probablemente venga de la auditoría del prototipo
aislado, antes de integrar.

---

## Fase 2 · Territorio · D-11

**Cerrada.** D-11 estaba fichada como *"desborda en celular, bug real, sin
tocar"*. No faltaba un breakpoint: era una **colisión de especificidad**.

`body:not(.enhanced) .territory__page` pesa (0,2,1) y le pisaba el
`display: grid` a `.territory__card` y `.territory__note`, que pesan (0,1,0).
En modo no enhanced —móvil y tablet, justo donde se veía— las dos se volvían
una fila flex de tres hijos sin wrap.

- El `grid-template-columns: 1fr` del bloque `≤767` **no hacía nada** desde
  que se escribió.
- `.territory__callout` terminaba en 412px con el viewport en 390, y el
  `overflow-x: hidden` del body le cortaba 22px de contenido.

Arreglado reafirmando el grid con la misma especificidad. El comentario de
`.territory__card` ya nombraba *"el bug de display:flex"* y lo había parcheado
con `align-content`, que en un contenedor flex tampoco hace lo esperado.

**Verificado:** 390 → callout 24→366 (antes 253→412) · 768 → grid 210/252/210
· 1440 en enhanced → 405/486/405, sin cambio. `scrollWidth == clientWidth` en
los tres.

### Lección de método

`scrollWidth > clientWidth` con `body { overflow-x: hidden }` **no prueba que
haya scroll horizontal**. La prueba que decide es `window.scrollTo(2000, y)` y
leer `scrollX`: si no se mueve, el desborde es fantasma y hay que buscar
contenido **recortado**, no scroll.

De paso quedó desmentida una atribución del agente medidor: el desborde de
413px no venía de `.field-bg` ni de `.threshold__sweep` —los dos dentro de un
ancestro con `overflow: hidden`— sino de este callout.

---

## Fase 3 · Método · D-01 y D-02

**Hecha, sin commitear.** `?v=31`.

**D-01 cerrada**, las cuatro filas: `.method` a `--page-margin` (105px
medidos, eran 64) · apertura a 1229px (eran 736) · registro
medio/pequeño/bisagra a 1159px (eran 608) · cita a 896px (eran 672).
**La apertura ahora rompe en 3 líneas**, como Figma; hacía 5.

Se eliminaron el `@media 1440–1919` —el query que §3 prohíbe, y de donde
salían los 64px— y el bloque de tablet, que solo tenía un `max-width` que
ahora cae solo de la curva. Y salió del `@media` móvil un grupo
`max-width: 100%` que era la misma clase de regla muerta que mantuvo D-11
abierta todo su ciclo de vida.

**D-02 cerrada en Método**: los cuatro interlineados de 52.8px estaban como
ratio (1.3 · 1.35 · 1.45 · 1.5). Ahora salen del token `--m-lh-528`.

### Dos trampas que aparecieron acá

- **Los anchos van en px pelado, no en `min(Npx, --page-col)`.** Copiar el
  patrón de Rutas estaba mal: los dos nodos resuelven el margen en lugares
  opuestos. `.routes` es full-bleed y cada bloque pone el suyo; `.method` lo
  pone la sección con su padding, así que un hijo con `--page-col` lo restaría
  dos veces — a 1440 la apertura daba 1020px en vez de 1229.
- **El interlineado necesitaba un piso relativo.** El piso absoluto (26px)
  baja más rápido que el piso de fuente del tier 48px (28px), y a 390 la
  bisagra quedaba con 28px de cuerpo y 26px de interlínea, renglones
  encimados. Se le puso `max(..., 1.1em)`, y el 1.1 es **medido**: es la
  relación de §5 a 1440 (52.8/48).

**Verificado:** a 1440 los cuatro dan 52.848px, padding 105.12px, apertura en
3 líneas, sin desborde. A 390 el tier 48 conserva la relación 1.1 y el
aterrizaje el absoluto (26px), sin desborde.

---

## Fases 4, 5 y 6 · Voces, Umbral, Catálogo

**Listas para empezar.** Mismo procedimiento las tres, sin frame de Figma
porque no hace falta (ver el tablero):

1. **Leer el 1440 actual.** Valores computados de cada bloque del nodo —
   tipografía, interlineado, anchos, márgenes, ritmo vertical. Ese es el
   ancla, y es lo que hay que reproducir exacto al terminar.
2. **Derivar las curvas** con la fórmula de §2 desde esos valores.
3. **Vaciar los `@media` de cantidad.** Lo que queda en un `@media` es solo
   estructura: cambio de eje, de posición o de existencia (§7 / criterio D-4).
4. **Verificar contra los criterios de aceptación** en los ocho anchos, más
   el tier de alto. El de 1440 es de no-regresión: tiene que dar idéntico a
   lo leído en el paso 1. V-1 queda pendiente hasta que haya pase visual.

Riesgo propio de cada una, que es lo único que las diferencia:

| # | Nodo | Cuidado |
|---|---|---|
| 4 | **Voces** | Acordeón — es el primer botón real del sitio, T-1 aplica. Hay un bug visual abierto en la cita de Melisa, que **no** es parte de esta fase |
| 5 | **Umbral** | `script.js` lee los cortes 767/1023 para el radio de la órbita. Los cortes no se mueven; si una curva los necesitara distintos, la curva está mal |
| 6 | **Catálogo** | La más riesgosa: scroll-jacking con pin, frames por edge, y `script.js` decide su modo por breakpoint. Además su fondo va a sangre, así que el escaneo por tinta no sirve (§8.b) |

---

## Fase 7 · Territorio · responsive

**Bloqueada: falta node-id y medición.** Es el único nodo donde no se puede
usar el 1440 renderizado como ancla, porque el repo lo marca *"sin confirmar
contra Figma"* y hay tres frames sin medir (`nodo 2 (1)/(2)/(3).png`).

Cuando se destrabe, el procedimiento suma un paso 0: medir los tres frames
con `get_design_context` y escribir su escala en `DESIGN.md`, como se hizo con
Método (§5) y Rutas (§11). Recién ahí se puede derivar.

Riesgo propio: cinco ScrollTrigger pineados. Verificar que la mecánica de
scroll sigue viva es parte del cierre, no un extra.

---

## Fase 8 · Método · el resto de §5

**Bloqueada por D-26.** Es la única fase que sigue siendo de conformidad y no
de responsive: son deltas contra el frame ya medido, no comportamiento entre
anchos. Por eso quedó al final. Pendiente:

- Las deltas chicas de §5: trackings de 1.98/2px que hoy no existen, chip
  18→16, eyebrow 12→11, seq-label 24→20, cell-term 26→24, atribución 11→12,
  teaser a Gantari Regular 18px/28.8 (hoy Plus Jakarta 32px, la mayor delta
  de la tabla).
- **D-26** — `.method__line` está a 85px donde §5 mide 96, y `.method__term` a
  96 donde §5 mide 85 para `INVESTIGACIÓN-CREACIÓN.`. Deltas de ±11px exactos
  y simétricos, o sea que parecen cruzados. Pero el código atribuye los 85px a
  *"dato explícito del usuario, no un descuido"*, que es la fuente 3 de §1.
  Además `.method__term` es una sola clase para dos bloques que §5 mide
  distinto: hay que partirla, y al partirla cae también **D-16** (si
  `EMERGE DE ÉL` va en Gantari o en Plus Jakarta).
- Confirmar el **peso** de Gantari en el enunciado de 85px: el sitio usa 800,
  §5 dice "Bold" sin número, y el frame de Rutas midió 700 para su elemento
  del mismo escalón. El frame de Método (`236:3`) se puede remedir.
- **D-14** — cinco condiciones de Frascati donde el sitio tiene cuatro. No es
  solo copy: `.method__cells` va de `repeat(4, 1fr)` a 5 columnas y hay que
  replantear el móvil. **Falta el nombre de la quinta condición**, que no se
  inventa acá.

---

---

## Fase 9 · Footer real de Rutas

Sin empezar, y **no es trabajo de responsive**. El sitio termina hoy en el
`</section>` de Rutas. El frame dibuja una banda gris de 1440×367 con la
palabra `FOOTER`, que es placeholder y no diseño (D-24): el gris no pertenece
a la paleta y el contenido es el nombre del componente. Hace falta diseño, no
implementación.

---

## Instrumentos: qué skill y qué agente, y por qué

Criterio: una skill o un agente entra solo si da un salto de calidad o un
ahorro de tokens justificable. Todo lo demás se hace inline.

### Skills que sí

| Skill | Dónde | Por qué |
|---|---|---|
| `figma-design-to-code` | Fases 0 y 7 | Obligatoria antes de `get_design_context`. Solo esas dos: las demás no miden Figma |
| `web-design-guidelines` | Cierre de cada fase de nodo | Criterios T-1 y parte de L-1 — es exactamente el problema que tuvo el chip |

### Skills que no, y por qué no

`emil-design-eng`, `frontend-design`, `apple-design`, `microinteractions`,
`animation-vocabulary`, `find-animation-opportunities`, `improve-animations`,
`review-animations`, `impeccable`, `ui-ux-pro-max`.

Todas son de **dirección estética y de motion**. Este pedido no es de
dirección: es geometría derivada de medición, y el proyecto tiene una regla
dura que la contradice —*ningún valor de layout inventado a mano*—. Una skill
de taste empuja justo hacia ahí.

`gsap-scrolltrigger` queda fuera por otra razón: del Nodo 3 en adelante el
scroll-jacking está prohibido.

El paquete de motion y acabado tiene su propia sesión ya briefeada en el vault
(`Brief - Sesion de UX y Acabado Premium`) — ahí sí entran.

### Agentes

Máximo 2 en simultáneo, roles disjuntos, ninguno duplicando verificación.
**Quien decide y quien escribe el CSS es el hilo principal; los agentes miden
e inventarían, no eligen valores.**

| Agente | Rol | Rendimiento real |
|---|---|---|
| **Medidor** | Fija viewport, inyecta candidatos por JS y devuelve la tabla de números | Usado en la fase 1. Las 60 combinaciones × 4 anchos habrían sido inviables inline. Encontró el bug de la prosa a sangre. **Erró una atribución** (el desborde de 413px), así que sus conclusiones causales se verifican; sus números no |
| **Auditor de nodo** | Inventaria los `@media` y los valores fijos de un nodo y los cruza contra §5 | Usado en la fase 3 sobre 580 líneas. Encontró los tamaños cruzados de D-26 |

---

## Verificación — cómo se mide en este proyecto

- **El panel embebido sirve para medir, no para ver.** No compositea si está
  plegado, así que `screenshot` falla siempre con timeout; pero
  `getBoundingClientRect` y `getComputedStyle` vía `javascript_tool` no
  dependen del compositing y son el instrumento real. Para un bug visual
  reportado con captura sigue haciendo falta Chrome real.
- `?static=1` para medir sin reveals en `opacity: 0`.
- Falsos positivos conocidos: los `span` del marquee y los descendientes de
  `.routes__matrix-table` reportan un `right` que no existe en pantalla.
- **`?v=N` en `index.html` en cada cambio** de `styles.css` o `script.js`.
- Antes de commitear: mostrar mensaje y archivos, y esperar confirmación.
