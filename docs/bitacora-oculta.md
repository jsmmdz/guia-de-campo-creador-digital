# Bitácora Oculta (pendiente global)

> Componente reutilizable de Fase 0 que todavía no existe. Lo necesitan los 5 nodos.
> Extraído literal de CLAUDE.md el 2026-07-26. Fuente de verdad de contenido y narrativa: el vault en DOCUMENTOS/.

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

