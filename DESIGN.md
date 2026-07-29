# DESIGN.md — Sistema de diseño

> El `design.md` que `Spec - Nodo 2 Territorio (v2 - Figma)` §5 y
> `Spec - Nodo 3 Metodo` §5 citan como fuente de la paleta, las tres
> familias tipográficas y el criterio de forma. **Nunca existió** — las dos
> specs lo dieron por escrito. Este archivo salda esa deuda.
>
> Iniciado 2026-07-27. Hoy cubre **responsive**, la **paleta y tipografía
> de Método** y las de **Rutas** (§11), confirmadas contra Figma por MCP el
> 2026-07-28. §11 se **remidió el 2026-07-28 por la tarde**, después de que
> el frame de Rutas cambiara — ver §11.4.
>
> **Todo valor de acá salió de una medición o de una decisión explícita del
> usuario.** Lo que no, dice `PENDIENTE` y no se implementa.

---

## 1 · La regla base: 1440 mide, móvil decide

Los frames de `IMAGENES/frames figma/` están a **1440px de ancho exacto**,
así que la escala es **1:1** — 1px del PNG es 1px a 1440 de viewport, sin
conversión.

Pero el `Plan de Desarrollo` §4 declara **"diseño responsivo, mobile-first"**
como requisito mínimo del proyecto, y §5 insiste: *"cada mecánica compleja
necesita su propia variante mobile-first, no una adaptación tardía del
diseño de escritorio"*. El `Spec - Nodo 3` §2 agrega que el lector está
*"probablemente en celular"*.

**Los dos conviven así** (decisión del usuario, 2026-07-27):

- **1440 es la fuente de las medidas** — proporciones, jerarquía, ritmo
  vertical, escala tipográfica. De ahí salen los números.
- **Móvil manda en las decisiones** — cuando una medida de 1440 no funciona
  en pantalla chica, gana móvil. Ninguna mecánica se resuelve reescalando el
  layout de escritorio.

Un valor de layout es legítimo solo si sale de una de estas tres fuentes:

1. **Medido en un frame de Figma** — el caso normal.
2. **Derivado por la fórmula** (§2) desde un valor medido.
3. **Decidido explícitamente con el usuario** y anotado en §9.

Un `max-width: 38rem` elegido a ojo no es ninguna de las tres.

---

## 2 · La fórmula

```
clamp( piso, slope, techo )

slope = (valor_figma / 1440) × 100 vw,  SIEMPRE redondeado hacia arriba
techo = valor_figma × 4/3               (lo alcanza a 1920 y ahí congela)
piso  = 2.7 × valor_figma^0.57          (mínimo 16px prosa · 11px etiquetas)
```

| Figma a 1440 | Piso (celular) | Slope | Techo (a 1920) |
|---|---|---|---|
| 128px | 43px | `8.89vw` | 170.67px |
| 96px | 36px | `6.67vw` | 128px |
| 85px | 33px | `5.91vw` | 113.33px |
| 48px | 25px | `3.34vw` | 64px |
| 32px | 19px | `2.23vw` | 42.67px |
| 26px | 17px | `1.81vw` | 34.67px |
| 24px | 17px | `1.67vw` | 32px |
| 20px | 15px | `1.39vw` | 26.67px |
| 18px | 14px | `1.25vw` | 24px |
| 16px | 13px | `1.12vw` | 21.33px |
| 12px | 11px | `0.84vw` | 16px |
| 11px | 11px | `0.77vw` | 14.67px |

### El slope

**Redondeo siempre hacia arriba** (decisión del usuario; hoy Método lo hace
y Territorio no). Garantiza que la curva alcance el valor de Figma **en o
antes** de 1440, nunca después, así que a 1440 el `clamp()` devuelve el
literal del dato sin arrastre de punto flotante.

### El techo

**Se alcanza a 1920 y ahí congela** (decisión del usuario). Como el slope se
calculó desde 1440, `slope × 1920 / 100` da exactamente `valor × 4/3` — el
sistema cierra solo, sin un segundo número que mantener. Por encima de 1920
nada crece: crecen los márgenes.

### El piso

**No sale de Figma** — no hay frame de móvil, y el usuario decidió
(2026-07-28) calcularlo priorizando legibilidad y corregirlo después contra
el sitio real. La curva es una potencia ajustada a cinco anclas, y cumple
tres condiciones que los pisos anteriores violaban:

1. **Comprime más lo grande que lo chico.** 128px baja a 43 (×0.34); 12px
   baja solo a 11 (×0.92). Un título tiene margen para encoger; una etiqueta
   ya está contra el mínimo de legibilidad.
2. **Nunca invierte la jerarquía.** La función es monótona: si A es mayor
   que B a 1440, lo sigue siendo en celular.
3. **Mismo tamaño de Figma → mismo piso.** Antes no era así: cinco elementos
   del "tier 48px" de Método tenían pisos de 28, 28, 28, **20** y 28.

**Conserva el contraste de escala**, que `Spec - Nodo 2` §5 declara *"la
firma visual del sitio"*: en desktop el rango va de 11 a 128px (11.6:1) y en
celular de 11 a 43px (3.9:1). Comprimido, pero sigue siendo un salto.

**Verificado en pantalla** a 390px y a 359px sobre Método: ningún desborde
real, ninguna prosa bajo 19px, medida de lectura de 33–36 caracteres. Ningún
valor necesitó recorte por los mínimos duros — la curva sola ya los respeta,
señal de que las anclas están bien puestas.

### Cuidado con `vw` y la barra de scroll

A una ventana de 1440, Chrome reporta `innerWidth` 1440 pero el ancho de
layout es **1425** (15px de barra). `vw` resuelve contra 1440, así que la
tipografía da el valor correcto — pero `100vw` desborda. **Para anchos de
columna, `min()` con techo en px, nunca `vw` puro.**

---

## 3 · Cascada y breakpoints

**El tier base, sin `@media`, es el diseño de Figma a 1440.** Invierte la
convención anterior, que declaraba *"laptop 1024–1439 (tier base, sin
@media)"*.

```
≤ 359px        móvil chico    escalonado
360 – 767px    móvil          escalonado
768 – 1023px   tablet         escalonado
1024 – 1439px  laptop         cae solo de la curva, sin bloque propio
1440px         BASE           el diseño de Figma, sin @media
≥ 1920px       grandes        acá congela el techo (§2)
```

Decisión del usuario (2026-07-28): se conservan los cinco cortes que el
sitio ya usaba y se agrega el de 359px, que Método tenía suelto para el
Diagrama 02.

**Dos reglas que se siguen de esto:**

- **1024–1439 no lleva bloque propio.** Con `clamp()` anclado a 1440 ese
  rango sale solo de la curva. Si un nodo necesita un bloque ahí, su fórmula
  está mal, no falta un breakpoint.
- **Ningún `@media (min-width: 1440px)`. Se escribe `1441px`.** Un query que
  dispara *en* 1440 sobrescribe el diseño exactamente en el ancho donde el
  diseño es ley. **Verificado en vivo:** a 1440 de ventana `.method` ya
  computa `padding-left: 64px`, que es el override de desktop, no el base.

**Cuidado:** los cortes de 767 y 1023 están también en `script.js`, que los
usa para decidir el modo del Catálogo y el radio de la órbita del Umbral.
Moverlos obliga a tocar JS — por eso se conservan.

---

## 4 · Layout de página

Confirmado por MCP sobre el frame de Método (`236:3`):

| | Valor |
|---|---|
| Margen lateral | **105px** |
| Ancho de columna | **1234px** |
| Margen derecho resultante | ~101px |
| Filete de acento de cita | cuelga a **100px**, 5px fuera de la columna |

El escaneo por tinta de cinco frames independientes había dado un mínimo de
99–110px, consistente con 105.

```css
--page-margin: clamp(24px, 7.3vw, 140px);   /* 105px a 1440 */
--page-col:    min(100% - 2 * var(--page-margin), 1645px);  /* 1234px a 1440 */
```

El piso de 24px en móvil es decisión de legibilidad, no de Figma.

---

## 5 · Tipografía

**Tres familias** (decisión del usuario, 2026-07-27, confirmando
`Plan de Desarrollo` §2 como verdad definitiva):

| Familia | Para qué |
|---|---|
| **Gantari** | Marquee, enunciado del término, teaser de tarjeta |
| **Fraunces** | Serif de storytelling — apertura, definición, citas |
| **Plus Jakarta Sans** | Registro técnico y prosa: aterrizaje, bisagra, remate, etiquetas, chips, atribuciones |

**Sin monoespaciada** — decisión del usuario, **migrada el 2026-07-28**. Los
18 usos de `--f-mono` (IBM Plex Mono) y `--t-f-mono` (Martian Mono) pasaron
a `--f-sans`: coordenadas del HUD, registro de placa del Catálogo, eyebrows
y sellos de Territorio, flechas y atribución de Método, y las siete
etiquetas de Voces. Ambos tokens se eliminaron y Martian Mono salió del
`<link>`.

El registro técnico ahora se marca con **uppercase + tracking amplio**, no
con el ancho fijo de la mono.

> **Excepción — IBM Plex Mono sobrevive, pero no como tipografía.** El
> efecto ASCII de "Digital" (Nodo 0) es una **grilla**: depende del ancho
> fijo de carácter. `initAsciiText()` pide la fuente por nombre desde
> `script.js` y `CanvasTxt` no declara cadena de respaldo, así que sin el
> `<link>` caería a la sans por defecto y la grilla se desalinearía — el
> mismo desfase que ya documenta el comentario de `initAsciiText()`. Se
> conserva acotada a los dos pesos que el script carga (400 y 600), y
> **ningún selector de CSS la usa**. Verificado: `i` y `M` miden ambos 24px
> a 40px de tamaño.

**El Umbral y el Catálogo migran de Archivo al trío.** `Plan de Desarrollo`
§2 lo dejaba *"pendiente de confirmación explícita antes de tocar código ya
construido en Nodo 0/1"*; esta es la confirmación.

**Regla que no se toca** (`Spec - Nodo 2` §5): *"no normalizar hacia un
tamaño intermedio — el salto entre el titular enorme y la caption diminuta
pero espaciada es la firma visual del sitio; achatarlo lo desarma"*.

### Escala de Método, confirmada por MCP

| Bloque | Familia y corte | Tamaño | Interlineado |
|---|---|---|---|
| Marquee `EL MÉTODO.` | Gantari Bold Italic | 128px | normal |
| Apertura narrativa | Fraunces SemiBold Italic | 48px | **normal** (≈59.5px) |
| "No lo leíste…" / "Eso tiene nombre técnico:" | Fraunces SemiBold Italic | 96px | normal |
| `INVESTIGACIÓN-CREACIÓN.` | Gantari Bold Italic, uppercase | **85px** | normal |
| Bloque de definición | Fraunces **Italic** (regular) | 48px | **52.8px** |
| La inversión | Plus Jakarta SemiBold Italic | 48px | normal |
| `EMERGE DE ÉL` | **Plus Jakarta** SemiBold Italic | 96px | normal |
| Aterrizaje (prosa) | Plus Jakarta Medium | 32px | **52.8px** |
| Pregunta bisagra | Plus Jakarta SemiBold | 48px | 52.8px |
| Etiqueta `DIAGRAMA 01` | Plus Jakarta Bold, tracking 1.98px | **32px** | 13.2px |
| Etiquetas `SECUENCIA A/B` | Plus Jakarta Bold, tracking 1.98px | 20px | 13.2px |
| Chips del diagrama | Plus Jakarta SemiBold, tracking 1.98px | 16px | 13.2px |
| Eyebrow `CRITERIO N` | Plus Jakarta Medium, tracking 2px | **11px** | 16px |
| Término de criterio | Plus Jakarta SemiBold | 24px | 32px |
| Teaser de Makro | **Gantari** Regular | 18px | 28.8px |
| Cita destacada | Fraunces Italic | 48px | **52.8px** |
| Atribución | Plus Jakarta Regular, tracking 1.1px, uppercase | 12px | 13.2px |
| Remate | Plus Jakarta Medium Italic | 48px | normal |

**Dos interlineados distintos, no uno.** `52.8px` es un valor **absoluto**,
no un ratio: se aplica igual a texto de 48px (ratio 1.1) y de 32px (ratio
1.65). La apertura en cambio usa `normal`. El sitio hoy usa 1.4 y 1.45 en
esos bloques — ambos incorrectos.

Fraunces lleva `font-variation-settings: "SOFT" 0, "WONK" 1` en todos sus
usos.

---

## 6 · Paleta de Método, confirmada por MCP

| Uso | Hex |
|---|---|
| Fondo del nodo | `#000000` (negro puro, no `#050507`) |
| Marquee y término | `#e1dfff` |
| Tinta de cuerpo | `#e4e1ee` |
| Tinta secundaria (cita de Makro) | `#c6c4d8` |
| Tinta apagada (eyebrows, atribución) | `#908fa1` |
| Filete de panel y chip | `#464555` · `#464554` |
| Fondo de chip | `#13131c` |
| Filete de chip | `#ede9e2` |
| Chip `CONOCIMIENTO` — fondo | `#3d3ae0` |
| Chip `CONOCIMIENTO` — filete y tinta | `#c1c1ff` · `#c8c8ff` |
| Filete de acento (cita, definición) | `#c1c1ff` |
| Panel expandido de Makro | `#1f1f28` |

El fondo es **negro puro**, no el `#050507` que el `Spec - Nodo 3` §5
declara. Ver §9, D-13.

---

## 7 · Responsive por elemento

Esto **no lo fija este documento**: `Plan de Desarrollo` §1.3 ya especifica
el comportamiento de cada elemento de contenido, y manda. Se transcribe acá
para no tener que abrir el vault.

| Elemento | Comportamiento en móvil |
|---|---|
| Párrafo narrativo | Ancho de lectura cómodo, **sin variación por breakpoint** |
| Cita destacada | **Ancho completo**, sin perder jerarquía tipográfica |
| Ficha técnica | Tabla → **tarjetas apiladas**: una fila, una tarjeta |
| Secuencia | Conectores horizontales → **columna vertical apilada** |
| Dato clave | **Tipografía fluida**, nunca se corta ni pierde jerarquía |
| Nota de campo | Igual que párrafo narrativo |
| Tarjeta desplegable | Teaser de una línea igual que desktop; al expandir **empuja**, no se superpone |
| Acordeón de perfil | Cabecera apilada: avatar arriba, texto debajo |
| Combinador de rutas | Chips a wrap de 2-3 líneas, **nunca un dropdown** |

**El criterio general:** si el cambio es de *cantidad*, es fluido. Si es de
*estructura* — algo cambia de posición, de eje o de existencia — es
escalonado.

**Medida de lectura: hasta ~77 caracteres.** El `Spec - Nodo 3` §5 decía
~68; Figma pone la prosa en 1234px, que a 32px dan ~77. Gana Figma
(decisión del usuario) y el spec se actualiza. Diagramas, enunciados y cita
pueden exceder — eso el spec ya lo autorizaba.

---

## 8 · Protocolo de medición

Medir a ojo sobre el PNG no sirve: una imagen de 1440×8079 se reescala a
~1/5.8 al leerla. **Hay tres instrumentos, y se cruzan.**

### a · El MCP de Figma — el que da los valores exactos

`get_design_context` sobre el node-id de un frame devuelve tamaños, familias,
interlineados, colores y posiciones literales. **Es la fuente preferente.**

- El node-id se saca con clic derecho sobre el frame → *Copy link to
  selection*. El de la página completa no sirve.
- `get_metadata` **falla siempre** en este entorno (error de parseo de SSE,
  reproducible en tres intentos con nodos distintos). No insistir: ir
  directo a `get_design_context`.
- `get_variable_defs` devuelve `{}` — **el archivo no usa variables de
  Figma**, todo está con estilos directos. No hay tokens que extraer.
- Requiere cargar antes la skill `figma-design-to-code`.

### b · Escanear el frame exportado

`tools/escanear-frame.ps1` recorre el PNG fila por fila y reporta bandas de
tinta y gaps con coordenadas exactas:

```bash
powershell -File tools/escanear-frame.ps1 -Path "../../IMAGENES/frames figma/nodo 3 metodo.png"
```

De la salida se leen **alineación** (`centro ≈ 719` es centrado), **márgenes
y ancho de columna**, **interlineado** (delta entre inicios de bandas
consecutivas de un párrafo) y **ritmo vertical** (los `GAP`).

Tres límites:

- **La tinta subestima la caja.** El sidebearing de la primera letra, y
  sobre todo el voladizo de una itálica, corren el extremo medido. Los `x`
  son **cotas**, no el valor exacto.
- **No sirve sobre fondo a sangre.** El Catálogo devuelve una sola banda del
  alto completo, porque su ilustración va de borde a borde.
- **No todo frame es una página vertical.** El Catálogo son **seis placas de
  1440 × 1053 concatenadas** (8639px de ancho); se corta en vertical, una
  placa por pantalla, antes de medir. El 1053 es la altura de viewport
  contra la que se diseñó.

### c · Medir el sitio renderizado

Viewport al ancho que toque y `getBoundingClientRect` sobre los mismos
bloques. `?static=1` evita que los reveals dejen elementos en `opacity: 0`.

**Para los pisos, que no salen de Figma, este es el único instrumento.** Se
prueban inyectando los valores candidatos por JS a 390px y 359px —sin tocar
el CSS— y midiendo tres cosas: que nada desborde, que ninguna prosa quede
bajo 16px, y la medida de lectura en caracteres.

**Falsos positivos de desborde:** los `span` del marquee reportan `right`
muy por fuera del viewport, y está bien — son una cinta que se desplaza
dentro de un riel con `overflow: hidden`. Un desborde solo cuenta si el
elemento está en flujo normal.

### Lo que este protocolo NO reemplaza

Para un **bug visual reportado con captura**, la verificación sigue siendo
otra captura en Chrome real (`docs/flujo-de-trabajo.md` §5). Medir sirve
para *derivar* el sistema, no para cerrar un bug que el usuario está viendo.

---

## 9 · Discrepancias y pendientes

| | Qué | Estado |
|---|---|---|
| D-01 | Método mide la mitad de ancho que Figma | **Cerrada 2026-07-28: implementada** |
| D-26 | Los tamaños de `.method__line` y `.method__term` chocan con §5, y el código invoca una decisión del usuario | **Abierta — necesita decisión** |
| D-02 | Interlineado | **Cerrada por MCP** |
| D-03 | Margen lateral | **Cerrada por MCP: 105px** |
| D-04 | `get_metadata` falla | Cerrada: se usa `get_design_context` |
| D-05 | Pisos de los `clamp()` | Cerrada: §2 |
| D-06 | Juego de breakpoints | Cerrada: §3 |
| D-07 | La mono se elimina | **Cerrada: migrada** |
| D-08 | Medida de lectura a ~77 caracteres | Decidida, falta actualizar el spec |
| D-11 | `.territory__callout` desborda en celular | **Cerrada 2026-07-28: era una colisión de especificidad** (ver abajo) |
| D-12 | Tres convenciones de `clamp()` | A corregir al implementar |
| D-13 | El fondo de Método es negro puro, no `#050507` | Nueva |
| D-14 | Son 5 condiciones de Frascati, el sitio tiene 4 | **Falta la quinta** |
| D-15 | La línea `REF:` del Figma no coincide con el vault | Nueva |
| D-16 | `EMERGE DE ÉL` es Plus Jakarta en Figma, Gantari en el spec | Nueva |
| D-21 | El chip de línea sin seleccionar mide 46px y todo el resto 50px | Cerrada: se toma 50 (§11.4) |
| D-22 | La etiqueta de horizonte cae a 10px, bajo el mínimo de §2 | Cerrada: se conserva 11px (§11.4) |
| D-23 | La tarjeta `FUTURO` abre su gap interno a 12px contra los 8px de `HOY` | Cerrada: se conserva 8px (§11.4) |
| D-24 | El frame dibuja un footer placeholder gris que no es diseño | Abierta: falta el footer real |
| D-25 | El gap de la fila de disciplinas sube a 35px contra los 30px de líneas | Aplicada, candidata a normalizar |

### D-01 · Método mide ~la mitad de ancho que en Figma

Los `max-width` de Método (46rem / 42rem / 40rem / 38rem) no salieron de
ninguna medición. Medido a 1440:

| Bloque | Figma | Sitio | Δ |
|---|---|---|---|
| Apertura serif | **1229px** | 736px | −493 |
| Registro medio / pequeño / bisagra | **1159px** | 608px | −551 |
| Cita | 896px (max-width) | 672px | −224 |
| Margen izq. de bloque | **105px** | 64px | −41 |

**Consecuencia medida:** los dos párrafos de apertura rompen en **5 y 4
líneas** en el sitio, donde Figma tiene **3 y 3**. La tipografía coincide
exacto (48px); el problema es solo de contenedor.

**Cerrada 2026-07-28.** Las cuatro filas implementadas: `.method` pasa a
`--page-margin` (105px), apertura a 1229px, registro medio/pequeño/bisagra
a 1159px, cita a 896px. **La apertura ahora rompe en 3 líneas**, como
Figma. Se eliminaron además el `@media 1440–1919` —el query que §3 prohíbe,
y de donde salían los 64px de la cuarta fila— y el bloque de tablet, que
solo contenía un `max-width` que ahora cae solo.

**Los anchos van en px pelado, no en `min(Npx, --page-col)` como en Rutas.**
Los dos nodos resuelven el margen en lugares opuestos: `.routes` es
full-bleed y cada bloque pone el suyo; `.method` lo pone la sección con
`padding: 0 var(--page-margin)`. Meter `--page-col` en los hijos de Método
restaría el margen dos veces —a 1440 daba 1020px en vez de 1229—, que es
el mismo bug que el comentario de `.routes` advierte, con los papeles
cambiados.

### D-02 · Interlineado — implementado en Método 2026-07-28

Los cuatro bloques que §5 fija en **52.8px absolutos** estaban como ratio:
1.3 (bisagra) · 1.35 (cita) · 1.45 (definición) · 1.5 (aterrizaje). Pasan a
un token `--m-lh-528` derivado con la fórmula de §2, para que el valor siga
siendo absoluto en cada ancho en vez de un número clavado.

**Lleva un `max(..., 1.1em)`, y el 1.1 es medido, no elegido:** es la
relación de §5 a 1440 (52.8 / 48). Sin él, el piso del interlineado (26px)
baja más rápido que el piso de fuente del tier 48px (28px), y a 390 la
bisagra quedaba con **28px de cuerpo y 26px de interlínea** — los renglones
encimados. Donde el absoluto es mayor sigue ganando él: el aterrizaje a
390 devuelve 26px, no 19.8.

**Verificado:** a 1440 los cuatro dan 52.848px y la apertura rompe en 3
líneas; a 390 el tier 48 conserva la relación 1.1 y el aterrizaje el
absoluto. Sin desborde en ninguno de los dos.

### D-26 · Los dos enunciados grandes de Método — **sin resolver**

Aparece al migrar Método y **no se tocó**, porque enfrenta dos fuentes que
§1 considera legítimas:

| | Qué dice §5 (medido por MCP) | Qué dice el código |
|---|---|---|
| `.method__line` (las 3 líneas) | **96px** | **85px**, con un comentario que lo atribuye a *"dato explícito del usuario, no un descuido"* |
| `.method__term` · `INVESTIGACIÓN-CREACIÓN.` | **85px** | 96px |
| `.method__term` · `EMERGE DE ÉL` | **96px** | 96px |

Dos problemas distintos:

1. **Los valores parecen cruzados** — los deltas son ±11px exactos y
   simétricos. Pero el comentario del código invoca una decisión del
   usuario, así que darlo vuelta sin preguntar sería pisar §1, fuente 3.
2. **`.method__term` es una sola clase para dos bloques que §5 mide
   distinto** (85 y 96). No puede estar bien para los dos: hace falta
   partirla, y al partirla hay que resolver también **D-16** (si
   `EMERGE DE ÉL` va en Gantari como pide el spec o en Plus Jakarta como
   mide el Figma).

Queda pendiente además confirmar el **peso** de Gantari en el enunciado de
85px: el sitio usa 800 y §5 solo dice "Bold" sin número, pero el frame de
Rutas midió 700 para su elemento del mismo escalón (§11, C-05). El frame de
Método (`236:3`) se puede remedir para cerrarlo.

### D-11 · El callout de Territorio — **cerrada 2026-07-28**

No faltaba un breakpoint: **`body:not(.enhanced) .territory__page`** pesa
(0,2,1) y le pisaba el `display: grid` a `.territory__card` y
`.territory__note`, que pesan (0,1,0). En modo no enhanced —o sea móvil y
tablet, justo donde se veía el bug— las dos variantes se volvían una fila
flex de tres hijos sin wrap.

Dos consecuencias, y la segunda es la que se veía:

1. El `grid-template-columns: 1fr` del bloque `≤767` **no hacía nada**,
   porque no había grid. Llevaba ahí sin efecto desde que se escribió.
2. `.territory__callout`, tercer hijo de la fila, terminaba en **412px con
   el viewport en 390**, y el `overflow-x: hidden` del `body` le cortaba
   22px de contenido.

Arreglado reafirmando el grid con la misma especificidad. El centrado
vertical no se perdió: las dos ya declaraban `align-content: center`,
escrito esperando ser grid — de hecho el comentario de `.territory__card`
ya nombraba *"el bug de display:flex"* y lo había parcheado por ahí.

**Verificado** a 390 (callout 24→366, antes 253→412), a 768 (grid de
210/252/210, sin desborde) y a 1440 en modo enhanced (405/486/405, sin
cambio). `scrollWidth == clientWidth` en los tres.

**De paso desmiente un falso positivo:** el desborde de documento de 413px
que aparecía a ≤390 no venía de `.field-bg` ni de `.threshold__sweep` —los
dos están dentro de un ancestro con `overflow: hidden`— sino de este
callout. Al cerrarlo, `scrollWidth` volvió a igualar `clientWidth`.

### D-07 · La mono se elimina — **cerrada 2026-07-28**

Migrados los 18 usos a `--f-sans`, tokens eliminados, Martian Mono fuera del
`<link>`. Ver §5, incluida la excepción del efecto ASCII.

**Queda una divergencia contra Figma, aceptada:** el frame todavía dibuja en
Martian Mono la línea `REF:` y los corchetes `[ ]` de la tarjeta Makro. La
decisión del usuario prevalece; **hay que actualizar el Figma** para que
coincida.

### D-13 · El fondo es negro puro

El frame usa `#000000`. El `Spec - Nodo 3` §5 declara `#050507`, y el CSS
usa `var(--depth)` = `#050507`. Diferencia mínima pero real; el spec dice
además que *"el contraste del texto está calculado contra ese color"*.

### D-14 · Son cinco condiciones, no cuatro — **el sitio está desactualizado**

Resuelto por el usuario (2026-07-28): el Manual de Frascati exige **cinco**
condiciones y el contenido de Método ya se corrigió. El texto del frame era
el correcto; el error estaba del otro lado.

**Lo que falta cambiar, y no es solo copy:**

| | Hoy | Debe ser |
|---|---|---|
| `.method__cells` | `repeat(4, 1fr)` | 5 columnas |
| Celdas en el HTML | 4 (`ORIGINAL`, `NOVEDOSO`, `SISTEMÁTICO`, `TRANSFERIBLE`) | 5 |
| Móvil ≤767 | 2×2 | replantear con 5 |
| Móvil ≤359 | 1 columna | sigue sirviendo |
| `Spec - Nodo 3` §3.10 y §3.9 | dicen cuatro | actualizar en el vault |

**Falta el nombre de la quinta condición** — no se inventa acá. Cinco
columnas a 1440 dan celdas de ~247px contra los ~297px de hoy, así que
además hay que revisar que el término más largo (`SISTEMÁTICO`) siga
entrando en una línea.

### D-16 · Los dos enunciados grandes no son de la misma familia

`Spec - Nodo 3` §5 pide **Gantari bold itálica uppercase** para los dos
enunciados grandes, nombrándolos: `INVESTIGACIÓN-CREACIÓN.` y `EMERGE DE ÉL`.
El Figma solo cumple con el primero:

| | Spec | Figma |
|---|---|---|
| `INVESTIGACIÓN-CREACIÓN.` | Gantari Bold Italic | Gantari Bold Italic, **85px** |
| `EMERGE DE ÉL` | Gantari Bold Italic | **Plus Jakarta** SemiBold Italic, **96px** |

Distinta familia y distinto tamaño, cuando el spec los declara como el mismo
pico. Además el spec ya registraba que el Figma escribe `EMERGE DE EL` sin
tilde, y sigue así.

### D-15 · La línea de referencia no coincide

El Figma dice `REF: ESTUDIO_CASO_04 // AGENCIA: GREY`. El
`docs/nodo-3-metodo.md` registra `ESTUDIOS_ENSE_04 // ACERBIS - 2023`. Como
la tarjeta está en `PRÓXIMAMENTE` no bloquea, pero hay que resolver cuál es
el dato bueno antes de activarla.

---

## 10 · Secciones sin escribir

Alcance elegido por el usuario: responsive primero.

- **Paleta del resto del sitio** — §6 cubre Método y §11 cubre Rutas. Faltan
  Umbral, Catálogo, Territorio y Voces, hoy dispersos entre `:root` y los
  tokens `--t-*`.
- **Criterio de forma** — radio 0, sin sombras, sin degradados, filetes de
  1px. Está en las dos specs; falta consolidarlo acá.
- **Escala de espaciado** — `Spec - Nodo 3` §5 la fija (8/16/24/40/64/96,
  96px alrededor de los picos, 24px entre bloques de registro pequeño,
  respiro de 40–50vh). Falta verificar que aplique a todos los nodos.
- **Motion** — easings y duraciones conviven sin unificar (`power2.out`,
  `power1.out`, `sine.inOut`, `--m-ease-out`, el easing de Lenis). Es el
  encargo de `Brief - Sesion de UX y Acabado Premium` §5.

---

## 11 · Rutas (Nodo 5), confirmado por MCP

Frame `Desktop - 17`, node-id **`270:563`**, fileKey **`ml7agEUFaiqNyknGicfH5B`**.
Medido el 2026-07-28 con `get_design_context` y **remedido el mismo día por
la tarde**, después de que el frame cambiara — el node-id es el mismo, el
contenido no. **Construido e integrado 2026-07-28** — primer nodo del sitio
bajo la cascada invertida (§1/§3): `--page-margin`/`--page-col` viven ahora
en el `:root` de sitio en `styles.css`, no solo acá. Detalle completo en
`Spec - Nodo 5 Rutas.md` §5 del vault.

### 11.1 · Escala

| Bloque | Tamaño | Familia y corte | Interlineado |
|---|---|---|---|
| Marquesina `RUTAS.` | 128px | Gantari **ExtraBold** Italic | normal |
| Remate `El resto lo combina quien la use.` | **128px** | Plus Jakarta **Bold, recto** | **127px** |
| `EXPLORACIÓN DE RUTAS` | **85px** | Gantari **Bold** Italic, uppercase | normal |
| Las tres líneas | **80px** | Fraunces SemiBold Italic, centrado | normal |
| Bisagra | 48px | Fraunces SemiBold Italic | normal |
| Aterrizaje y cierre | 32px | Plus Jakarta Medium | 52.8px |
| Rol de la tarjeta | 48px | Plus Jakarta Bold Italic | 32px |
| Descripción de la tarjeta | 32px | Plus Jakarta Regular | 32px |
| Chip | 12px, tracking 1.98px | Plus Jakarta Medium, uppercase | 13.2px |
| Etiqueta de selector | 11px, tracking 1.1px | Plus Jakarta Regular, uppercase | 13.2px |
| Eyebrow de combinación | 11px, tracking 2.42px | Plus Jakarta SemiBold, uppercase | 16px |
| Botón `¿Y CÓMO SE VE EL FUTURO?` | **14px**, tracking 1.4px | Plus Jakarta, uppercase | 21px |

**`85px` y `52.8px` coinciden exactos con Método** (§5): `EXPLORACIÓN DE
RUTAS` e `INVESTIGACIÓN-CREACIÓN.` son el mismo escalón, y la prosa de los
dos nodos comparte interlineado absoluto. **`80px` es un tier nuevo**, no
tabulado en §2 → `clamp(33px, 5.56vw, 106.67px)`. El de 14px del botón
tampoco estaba tabulado → `clamp(12px, 0.98vw, 18.67px)`.

**Los dos picos de 128px no son el mismo tipo de pico.** La marquesina es
Gantari ExtraBold itálica y corre; el remate es Plus Jakarta Bold **recto**,
centrado y quieto — el único bloque del nodo sin itálica. Comparten tamaño
para cerrar el arco, no familia.

**Gantari se usa en dos pesos, no en uno.** ExtraBold (800) en la marquesina,
Bold (700) en el enunciado. El `<link>` ya carga los dos en itálica.

### 11.2 · Paleta

Idéntica a la de Método (§6) salvo los cuatro tonos de la tarjeta de
resultado, que son nuevos y **codifican tiempo, no disciplina**:

| | Estado `HOY` | Estado `FUTURO` |
|---|---|---|
| Fondo | `rgba(18,20,17,0.5)` | `rgba(111,17,0,0.1)` |
| Filete | `rgba(70,69,84,0.3)` | `rgba(255,180,164,0.3)` |
| Cuadrado y eyebrow | `#c0c1ff` | `#ffb4a4` |

Los chips de disciplina usan los `--spec-1..6` de `:root` **sin una sola
variación de hex** — primer nodo del sitio que no agrega ningún token de
color propio. Los `--spec-N-deep` no se usan.

**El botón del futuro tampoco era neutro.** El frame lo dibuja en la familia
salmón de la tarjeta que dispara, no en la tinta de prosa:

| | Hex |
|---|---|
| Filete del botón | `#9e3000` |
| Tinta del botón | `#ffbda8` |

### 11.3 · Geometría del combinador

| | Valor a 1440 |
|---|---|
| Entre las tres secciones | 48px |
| Filete de sección → etiqueta | 10px |
| Etiqueta → fila de chips | **24px** |
| Gap entre chips — líneas | 30px |
| Gap entre chips — disciplinas | **35px** |
| Alto de chip | **50px** |
| Padding de chip | 24px horizontal, filete de 2px |
| Fila de disciplinas → tarjeta | 32px |
| Tarjeta | alto 347px, padding 25px, gap interno 8px, `blur(2px)` |
| Corchetes de esquina | 8px |
| Tarjeta → botón | 424px |
| Padding del botón | 49px horizontal, 25px vertical |

**El alto de chip es el hallazgo de la remedición.** El spec lo había
*derivado* del padding (7 + 13.2 + 8.19 + 4 ≈ 30px) y de ahí salía que no
llegaba al área tocable de 40px, con un parche `min-height: 40px` acotado a
≤767. Pero la caja de Figma tiene **altura fija declarada**, y mide 50px: el
chip nunca estuvo bajo el mínimo en el diseño, estaba mal derivado en el
código. Con 50px desde el tier base el parche sobra y el hueco de tablet
—donde caía a ~31px— se cierra solo.

### 11.3.b · El ritmo narrativo, en `clamp()`

Los ocho saltos grandes del nodo viven en tokens `--r-air-*`, derivados con
la fórmula de §2 desde el valor medido. Es la primera aplicación de la
cascada invertida sobre **ritmo vertical** y no sobre tipografía:

| Figma | Piso | Slope | Techo | @768 | @390 | @359 |
|---|---|---|---|---|---|---|
| 281 | 67px | 19.52vw | 374.67px | 150 | 76 | 70 |
| 289 | 68px | 20.07vw | 385.33px | 154 | 78 | 72 |
| 342 | 75px | 23.75vw | 456px | 182 | 93 | 85 |
| 350 | 76px | 24.31vw | 466.67px | 187 | 95 | 87 |
| 384 | 80px | 26.67vw | 512px | 205 | 104 | 96 |
| 424 | 85px | 29.45vw | 565.33px | 226 | 115 | 106 |
| 451 | 88px | 31.32vw | 601.33px | 241 | 122 | 112 |
| 480 | 91px | 33.34vw | 640px | 256 | 130 | 120 |

**En este rango el piso casi no actúa: manda el slope.** Para 281 el piso
recién gana por debajo de ~343px de viewport. La curva de §2 estaba ajustada
para tipografía y resulta que también ordena bien el aire — su propiedad 1,
*comprime más lo grande que lo chico*, es justo lo que hace falta acá.

Antes de esto los dos `@media` del nodo aplastaban los ocho saltos a **96px
planos** en móvil y tablet, lo que borraba la jerarquía completa. Verificado
en seis anchos: cero inversiones de orden.

**Los bloques de prosa llevan `min(1159px, var(--page-col))`.** Con `1159px`
pelado y `margin: auto`, por debajo de ese viewport el `auto` no reparte nada
y la prosa quedaba a sangre — 390px de ancho a 390 de viewport. La medida de
lectura a 1024 bajaba de 81 caracteres a 69, dentro del techo de ~77 de §7.

**`24px` entre etiqueta y chips, no 87/97.** El frame declara `pt-87px` y
`pt-97px` en esos contenedores, pero es residuo de haberles fijado altura en
Figma; el spec ya lo había medido en 24px y esa medición sigue valiendo.

### 11.4 · Qué cambió en la remedición del 2026-07-28

**El ritmo vertical no cambió.** Todo lo que está por encima del combinador
coincide al píxel con la medición anterior — 164 · 440→676 · 558 · 907.5 ·
1188.5 · 1477.5 · 1819 · 2270 · 2619, y los saltos de 281 · 289 · 341.5 ·
451px siguen idénticos.

Por debajo, el botón y el cierre bajaron **exactamente +326px los dos**: no
es ritmo nuevo, es que el frame ahora dibuja las **dos** tarjetas de estado
apiladas donde antes había una. El Δ de 424px entre el fin del combinador y
el botón se conserva exacto, que es el valor que el sitio implementa.

Lo genuinamente nuevo:

| | Qué | Aplicado al sitio |
|---|---|---|
| C-01 | El remate pasa a pico propio de 128px | Sí — sale del párrafo de cierre a `.routes__closer` |
| C-02 | Alto de chip 50px (era ~32 en el sitio) | Sí — y se retira el parche de ≤767 |
| C-03 | Gap de disciplinas 35px | Sí |
| C-04 | Botón en `#9e3000` / `#ffbda8`, 14px | Sí |
| C-05 | Gantari ExtraBold marquesina / Bold enunciado | Sí — el enunciado bajó de 800 a 700 |
| C-06 | Horizonte a 10px / `#908fa0` | **No** — ver D-22 |
| C-07 | Gap interno de 12px en la tarjeta `FUTURO` | **No** — ver D-23 |
| C-08 | Footer placeholder gris | **No** — ver D-24 |

**Lo que el frame sigue sin dibujar:** la ruta transversal de Emprendimiento
(`.routes__venture`). No es un descarte — `Spec - Nodo 5` §3.12 ya registró
esa ausencia y resolvió por la regla 1 de precedencias que **el contenido
manda y el bloque va**. Se queda en el sitio.

### 11.5 · Discrepancias que abre este frame

| | Qué | Estado |
|---|---|---|
| D-17 | El frame usa **Archivo Narrow** (etiqueta de horizonte) y **JetBrains Mono** (botón), dos familias fuera del trío de §5 — y la segunda es monoespaciada, justo lo que D-07 eliminó del sitio | Resuelta en el spec: las dos migran a Plus Jakarta con uppercase + tracking. **Falta corregir el Figma** |
| D-18 | Tres márgenes distintos en un mismo frame: 106px (combinador), 118px (bisagra, enunciado), 120px (prosa), contra los **105px** de §4 | Normalizar a `--page-margin`. Deriva de diagramación, no sistema |
| D-19 | El filete de acento de la bisagra mide **4px**; en Método el equivalente es fino | Sin decidir — es el único elemento del sitio con filete grueso |
| D-20 | La tarjeta de estado `FUTURO` repite la etiqueta `A DIA DE HOY`, y sus corchetes de esquina quedaron en el lavanda de la otra tarjeta | Deslices del frame. Falta el copy del horizonte de 2031 |
| D-21 | El chip de línea **sin seleccionar** mide 46px con filete de 2px; el seleccionado 50px con filete de 1px; los seis de disciplina, 50px con filete de 2px | **Cerrada: se toma 50px y filete de 2px para todos.** Que un chip cambie de alto al seleccionarse es un salto de layout, no un estado. Corregir el frame |
| D-22 | La etiqueta de horizonte baja a **10px** y a `#908fa0` | **Cerrada: se conserva 11px y `#908fa1`.** §2 fija 11px como mínimo de etiqueta, y el hex es un desvío de una unidad contra el token que ya comparte con Método |
| D-23 | La tarjeta `FUTURO` abre su gap interno a 12px contra los 8px de `HOY` | **Cerrada: se conserva 8px.** El sitio tiene una sola tarjeta que cambia de estado; un gap por estado la haría saltar, que es justo lo que `Spec - Nodo 5` §4.2 prohíbe |
| D-24 | Banda de footer `#757575` a sangre, 1440×367, con la palabra `FOOTER` en Gantari Bold Italic 85px | **Abierta.** Es placeholder, no diseño: el gris no pertenece a la paleta y el contenido es el nombre del componente. Falta el footer real |
| D-25 | El gap de disciplinas sube a 35px contra los 30px de líneas | **Aplicada tal cual**, porque esa fila dejó de estar en absoluto y ahora declara el valor. Candidata a normalizar a 30 en la sesión de responsive |

Faltas de tilde en el frame, ya registradas en el spec: `exploracion de
rutas` y `A DIA DE HOY`.

**Divergencias de copy contra el sitio, no aplicadas** — el copy vive en el
vault, no en el frame: el frame dice *"las seis disciplinas que ya viste en
el nodo 1"* donde el sitio dice *"en el Catálogo"* (el sitio no numera nodos
para el lector), y arranca la descripción de la tarjeta `HOY` en mayúscula.
