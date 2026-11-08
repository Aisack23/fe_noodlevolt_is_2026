# NoodleVolt — Design System

## 1. Objetivo

Este documento define el sistema visual oficial de NoodleVolt.

Su objetivo es garantizar que todas las interfaces desarrolladas mantengan una identidad visual consistente, respetando los colores, estados, jerarquías y reglas de utilización establecidos en Figma.

Este documento debe ser consultado antes de desarrollar o modificar cualquier componente o pantalla.

**Regla fundamental:** utilizar siempre los tokens de diseño definidos. Nunca utilizar códigos HEX directamente en los componentes cuando exista una variable equivalente.

## 2. Paleta de colores

La paleta oficial pertenece a la colección de variables:

`NoodleVolt / Color`

La paleta se divide en dos categorías:

- Colores de marca.
- Colores de estado.

### 2.1. Colores de marca

| Token | HEX de referencia | Utilización |
|---|---|---|
| `marca/crimson` | `#C0392B` | Color principal. Botones primarios, precios y elementos activos. |
| `marca/orange` | `#D86B2C` | Color secundario. Hover, chips y botones secundarios. |
| `marca/brown` | `#2C1810` | Texto principal, contornos y barra del personal. |
| `marca/cream` | `#F7EBD9` | Fondos de secciones y tarjetas del cliente. |
| `marca/gold` | `#F2B134` | Acentos, puntos y estrellas. Nunca utilizar como color de texto. |
| `marca/fondo` | `#FAFAF8` | Fondo base de las interfaces. |
| `marca/borde` | `#E8DED3` | Bordes, separadores y divisores. |
| `marca/texto-secundario` | `#6B5E55` | Textos secundarios. |
| `base/blanco` | `#FFFFFF` | Superficies y elementos sobre fondos. |

### 2.2. Reglas de utilización de los colores de marca

**Crimson (`marca/crimson`)**
- Debe representar la acción principal de la interfaz.
- Utilizar en botones primarios y elementos que requieren atención.
- Puede utilizarse para precios y elementos activos.
- No sustituirlo arbitrariamente por naranja.

**Orange (`marca/orange`)**
- Utilizar como color secundario.
- Aplicar en estados hover, chips y botones secundarios.
- No debe desplazar al crimson como color principal de las acciones.

**Brown (`marca/brown`)**
- Es el color principal para textos.
- Utilizar en títulos, encabezados y elementos de alta jerarquía.
- También puede utilizarse en contornos y elementos de navegación del personal.

**Cream (`marca/cream`)**
- Utilizar en secciones y tarjetas correspondientes a la experiencia del cliente.
- No confundir con el fondo base general.

**Gold (`marca/gold`)**
- Reservar para acentos visuales, puntos y estrellas.
- No utilizar como color de texto.
- Evitar su uso excesivo.

**Fondo (`marca/fondo`)**
- Es el fondo general de las interfaces.
- Utilizar como superficie base de las páginas cuando corresponda al diseño.

**Borde (`marca/borde`)**
- Utilizar para delimitar tarjetas, secciones, inputs y separadores.
- Evitar bordes excesivamente oscuros si el diseño establece este token.

**Texto secundario (`marca/texto-secundario`)**
- Utilizar para descripciones, información complementaria, etiquetas y metadatos.
- No sustituir el color principal de los títulos y textos importantes.

**Blanco (`base/blanco`)**
- Utilizar en superficies y elementos que necesiten contraste respecto al fondo.
- Puede utilizarse en tarjetas y superficies elevadas cuando corresponda al diseño.

---

## 3. Colores de estado

Los colores de estado pertenecen a la misma colección de variables y comunican información funcional al usuario.

| Token | HEX de referencia | Significado |
|---|---|---|
| `estado/success` | `#2E7D4F` | Disponible, Libre, PAGADO, CONFIRMADA, LISTO. |
| `estado/warning` | `#B7791F` | Por limpiar, Cobro en caja, EN_PREPARACION. |
| `estado/danger` | `#9B2C2C` | Agotado, Ocupada, CANCELADA y errores. |
| `estado/info` | `#2B6CB0` | PENDIENTE y avisos. |
| `estado/neutral` | `#9A8F87` | ENTREGADO y elementos deshabilitados. |

### 3.1. Reglas de utilización

**Success**
- Indica operaciones exitosas.
- Representa disponibilidad, confirmaciones y estados completados.
- No utilizar para acciones que todavía están pendientes.

**Warning**
- Indica operaciones que requieren atención.
- Representa preparación, limpieza y cobros pendientes de completar.
- No utilizar para comunicar errores definitivos.

**Danger**
- Indica errores, cancelaciones y situaciones negativas.
- Representa platillos agotados y estados ocupados cuando corresponda al diseño.
- Utilizar con moderación para conservar su significado visual.

**Info**
- Comunica información pendiente o avisos.
- Utilizar para estados informativos que no representan éxito ni error.

**Neutral**
- Representa estados neutrales o elementos deshabilitados.
- No utilizar para sustituir arbitrariamente los colores de los otros estados.

### 3.2. Consistencia semántica

Los colores de estado deben utilizarse de manera consistente en toda la aplicación.

Por ejemplo, un estado `PAGADO` debe conservar su representación visual mediante `estado/success`, independientemente de la pantalla en la que aparezca.

No debes asignar colores según preferencias visuales personales.

---

## 4. Reglas generales de diseño

1. Utilizar siempre las variables oficiales de color.
2. No escribir códigos HEX directamente en JSX, TSX o clases de Tailwind.
3. No crear colores alternativos cuando exista un token equivalente.
4. Mantener la jerarquía visual entre títulos, textos principales y textos secundarios.
5. Utilizar los colores de estado únicamente para comunicar estados funcionales.
6. Evitar combinaciones de colores que reduzcan la legibilidad.
7. Mantener consistencia entre las interfaces de clientes, meseros, gerentes y personal.
8. No utilizar `marca/gold` como color de texto.
9. Respetar las diferencias visuales definidas para cada perfil y dispositivo.
10. No modificar la paleta oficial sin autorización.

## 5. Implementación en React y Tailwind CSS

Los tokens definidos en Figma deben estar disponibles en el sistema de estilos del proyecto.

Antes de implementar una pantalla:

1. Inspeccionar la configuración actual de Tailwind CSS.
2. Comprobar si los tokens ya están registrados.
3. Identificar cómo se consumen actualmente las variables CSS.
4. Reutilizar la implementación existente.
5. Si todavía no están implementados, proponer su incorporación al sistema global de estilos.

### Reglas de implementación

Los componentes deben utilizar las clases semánticas o variables de diseño registradas en el proyecto.

Ejemplo conceptual de utilización:

- `bg-marca-crimson`
- `text-marca-brown`
- `border-marca-borde`
- `bg-estado-success`
- `text-marca-texto-secundario`

Estos nombres son referencias semánticas; deben coincidir con los nombres realmente configurados en Tailwind o CSS.

No debes asumir que estas clases existen antes de comprobar la configuración.

### Prohibiciones

No utilizar:

- Colores HEX directamente en componentes.
- Colores RGB o HSL arbitrarios.
- Clases de colores genéricos que contradigan los tokens oficiales.
- Variantes de colores inventadas.
- Colores de estado para usos decorativos sin justificación.

Si necesitas un color que no está definido, identifica la necesidad y solicita autorización antes de introducir un nuevo token.

## 6. Accesibilidad y contraste

La utilización de los colores debe mantener una buena legibilidad.

- Los textos principales deben utilizar `marca/brown`.
- Los textos secundarios deben utilizar `marca/texto-secundario`.
- Los estados no deben comunicarse exclusivamente mediante colores; deben incluir etiquetas o indicadores textuales cuando corresponda.
- Los botones deben conservar suficiente contraste entre texto y fondo.
- Los elementos interactivos deben tener estados visuales distinguibles.

No asumas que todas las combinaciones de la paleta cumplen automáticamente los requisitos de contraste. Comprueba las combinaciones utilizadas en cada componente.

## 7. Referencia visual oficial

La imagen de referencia de esta paleta se encuentra en:

`docs/design-assets/colores.png`

Esta imagen representa la paleta oficial de NoodleVolt y debe utilizarse como referencia visual cuando exista alguna duda sobre la distribución o clasificación de los colores.

Los valores HEX de las tablas sirven como referencia documental. La implementación debe utilizar los tokens correspondientes.

## 8. Instrucción para agentes de programación

Antes de implementar o modificar cualquier pantalla:

1. Consulta esta sección del Design System.
2. Identifica los colores necesarios.
3. Utiliza los tokens oficiales.
4. Comprueba que los tokens estén correctamente configurados en Tailwind CSS.
5. Evita introducir colores arbitrarios.
6. Verifica que los colores utilizados respeten su significado funcional.

Si encuentras una discrepancia entre el código existente y esta documentación, informa de ella antes de modificar globalmente el sistema de estilos.

**La identidad visual de NoodleVolt debe mantenerse consistente en todas las pantallas y componentes.**

# 9. Sistema tipográfico

## 9.1. Objetivo

La tipografía es un elemento fundamental de la identidad visual de NoodleVolt.

Todas las interfaces deben utilizar las familias tipográficas oficiales y respetar las jerarquías, tamaños, pesos y alturas de línea establecidos en este documento.

Se utilizan dos familias tipográficas:

- Antonio: títulos y encabezados.
- Inter: textos generales e interfaces.

No se deben sustituir estas familias por fuentes alternativas sin autorización.

## 9.2. Familias tipográficas

### Antonio

Utilización:
- Títulos principales.
- Encabezados de secciones.
- Subtítulos.
- Identificadores visuales de pantallas.
- Encabezados que requieren mayor jerarquía.

Configuración:
- Familia: Antonio.
- Peso principal: Bold.
- Transformación: uppercase.

Los títulos deben presentarse en mayúsculas, manteniendo la identidad visual definida en Figma.

### Inter

Utilización:
- Textos generales.
- Descripciones.
- Etiquetas.
- Formularios.
- Botones.
- Tablas.
- Datos de productos.
- Información secundaria.
- Elementos de navegación.

Configuración:
- Familia: Inter.
- Pesos utilizados:
  - Regular (400).
  - Semi Bold (600).

No utilizar Antonio para textos descriptivos o información general de la interfaz.

## 9.3. Jerarquía tipográfica

Los tamaños se expresan como:

`Tamaño de fuente / Altura de línea`

Todos los valores están expresados en píxeles.

| Elemento | Familia | Peso | Tamaño / Línea |
|---|---|---|---|
| H1 | Antonio | Bold | 48 / 56 px |
| H2 | Antonio | Bold | 36 / 44 px |
| H3 | Antonio | Bold | 24 / 32 px |
| Cuerpo | Inter | Regular | 16 / 24 px |
| Secundario | Inter | Regular | 14 / 20 px |
| Botón | Inter | Semi Bold | 16 / 24 px |
| Dato de tabla | Inter | Regular | 14 / 20 px |

### H1 — Título principal

- Familia: Antonio.
- Peso: Bold.
- Tamaño: 48 px.
- Altura de línea: 56 px.
- Transformación: mayúsculas.

Uso:
- Títulos principales de páginas.
- Encabezados de pantallas principales.

### H2 — Título de sección

- Familia: Antonio.
- Peso: Bold.
- Tamaño: 36 px.
- Altura de línea: 44 px.
- Transformación: mayúsculas.

Uso:
- Secciones principales.
- Categorías.
- Encabezados de bloques de contenido.

### H3 — Subtítulo

- Familia: Antonio.
- Peso: Bold.
- Tamaño: 24 px.
- Altura de línea: 32 px.
- Transformación: mayúsculas.

Uso:
- Subtítulos.
- Encabezados de componentes.
- Identificadores y referencias de secciones.

### Cuerpo

- Familia: Inter.
- Peso: Regular.
- Tamaño: 16 px.
- Altura de línea: 24 px.

Uso:
- Descripciones.
- Contenido principal.
- Información de productos.
- Textos de lectura general.

### Texto secundario

- Familia: Inter.
- Peso: Regular.
- Tamaño: 14 px.
- Altura de línea: 20 px.

Uso:
- Metadatos.
- Ubicaciones.
- Fechas y horarios.
- Información complementaria.
- Etiquetas descriptivas.

### Botones

- Familia: Inter.
- Peso: Semi Bold.
- Tamaño: 16 px.
- Altura de línea: 24 px.

Uso:
- Acciones principales.
- Acciones secundarias.
- Controles interactivos.

### Datos de tabla

- Familia: Inter.
- Peso: Regular.
- Tamaño: 14 px.
- Altura de línea: 20 px.

Uso:
- Filas de tablas.
- Cantidades.
- Datos de registros.
- Información administrativa.

## 9.4. Reglas especiales para la pantalla de cocina

La interfaz de cocina requiere una jerarquía tipográfica diferenciada debido a su contexto operativo.

Los números y nombres de platillos deben tener un tamaño mínimo de 24 px.

Esta regla es obligatoria para los elementos correspondientes a:
- Números de pedidos.
- Nombres de platillos.
- Información principal que el personal de cocina necesita identificar rápidamente.

No reducir estos elementos por debajo de 24 px para intentar introducir más información en pantalla.

La legibilidad y rapidez de identificación tienen prioridad sobre la densidad visual.

La distribución debe adaptarse a las dimensiones disponibles sin comprometer este tamaño mínimo.

## 9.5. Reglas de implementación

Antes de desarrollar cualquier componente:

1. Consulta la jerarquía tipográfica de este documento.
2. Identifica la familia tipográfica correspondiente.
3. Aplica el peso correcto.
4. Respeta el tamaño de fuente.
5. Respeta la altura de línea.
6. Mantén las transformaciones de texto establecidas.
7. Comprueba la legibilidad en los dispositivos correspondientes.

No utilices tamaños arbitrarios cuando exista un estilo tipográfico definido.

No reemplaces Antonio por Inter en los encabezados ni Inter por Antonio en los textos generales.

No simules pesos tipográficos que no estén disponibles.

## 9.6. Implementación en React y Tailwind CSS

Las familias tipográficas deben configurarse de manera centralizada en el sistema de estilos del proyecto.

Se recomienda disponer de nombres semánticos para las familias y jerarquías tipográficas.

Ejemplos conceptuales:

- `font-heading`: Antonio.
- `font-body`: Inter.
- `text-h1`: 48 px / 56 px.
- `text-h2`: 36 px / 44 px.
- `text-h3`: 24 px / 32 px.

Estos nombres son referencias semánticas y no deben asumirse como clases existentes hasta comprobar la configuración real de Tailwind CSS.

El agente debe:
- Revisar si las fuentes ya están instaladas o cargadas.
- Reutilizar la configuración existente.
- Evitar duplicar declaraciones de fuentes.
- Comprobar que los pesos necesarios estén disponibles.
- Utilizar las clases tipográficas centralizadas.
- Evitar estilos inline repetidos.

Si las fuentes no están disponibles, identificar los archivos necesarios y solicitar o localizar los recursos oficiales antes de sustituirlas por otras.

## 9.7. Responsive Design

La jerarquía tipográfica debe mantenerse en todas las versiones de la interfaz.

Cuando sea necesario adaptar los tamaños a dispositivos más pequeños:
- Mantener la jerarquía visual.
- Evitar títulos desproporcionados.
- Evitar textos cortados o desbordados.
- Respetar las especificaciones particulares de cada frame de Figma.
- No reducir los elementos principales de cocina por debajo de 24 px.

Los tamaños definidos en esta guía representan la referencia base. Si Figma contiene variantes específicas para tablet o móvil, se deben documentar y respetar.

## 9.8. Referencia visual oficial

La imagen de referencia tipográfica se encuentra en:

`docs/design-assets/tipografia.png`

Esta imagen es la referencia visual oficial para verificar las familias, jerarquías, tamaños y pesos tipográficos de NoodleVolt.

## 9.9. Instrucción para agentes de programación

Antes de implementar o modificar cualquier pantalla:

1. Consulta esta sección del Design System.
2. Identifica la jerarquía tipográfica correspondiente.
3. Utiliza Antonio Bold para títulos.
4. Utiliza Inter para textos e interfaces.
5. Respeta los tamaños y alturas de línea establecidos.
6. Aplica la regla especial de 24 px para cocina.
7. Comprueba que las fuentes estén correctamente configuradas.
8. Verifica la consistencia tipográfica entre componentes.

No inventes familias, pesos ni jerarquías tipográficas.

La tipografía debe mantener una identidad consistente en todas las interfaces de NoodleVolt.