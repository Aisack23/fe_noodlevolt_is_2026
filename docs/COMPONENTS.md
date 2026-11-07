# NoodleVolt — Componentes de interfaz

## 1. Objetivo

Este documento establece las reglas para identificar, desarrollar, reutilizar y mantener los componentes frontend de NoodleVolt.

La referencia principal de los componentes visuales es Figma, mientras que el código fuente del proyecto representa la implementación existente.

El objetivo es mantener una biblioteca de componentes consistente, reutilizable y escalable utilizando React, TypeScript y Tailwind CSS.

**Regla fundamental: antes de crear un componente, debes comprobar si ya existe uno equivalente en el proyecto.**

## 2. Referencias

Las siguientes referencias deben consultarse antes de implementar componentes:

- `AGENTS.md`: instrucciones generales del agente.
- `docs/DESIGN_SYSTEM.md`: colores y tipografía oficial.
- `docs/figma/figma-manifest.json`: identificadores y referencias de componentes de Figma.
- `docs/design-assets/componentes.png`: referencia visual general de los componentes.
- Código fuente del frontend: implementación existente.

Archivo de diseño:

https://www.figma.com/design/pcJk904tbSTwfNlSRz8aRw/NoodleVolt

La imagen de componentes es una referencia visual general. No debe utilizarse como sustituto de la inspección individual de los componentes cuando se necesiten conocer sus dimensiones, propiedades o variantes.

## 3. Principios de desarrollo

Todos los componentes deben cumplir los siguientes principios:

### Reutilización

- Inspeccionar el proyecto antes de crear componentes.
- Reutilizar componentes existentes cuando cumplan con los requisitos.
- Evitar implementar varias versiones de un mismo elemento.
- Extender componentes existentes cuando sea apropiado.
- No crear abstracciones innecesarias.

### Responsabilidad

- Cada componente debe tener una responsabilidad claramente definida.
- Evitar componentes excesivamente grandes.
- Separar la lógica de negocio de la presentación cuando corresponda.
- Mantener las páginas organizadas mediante componentes más pequeños.

### Tipado

- Utilizar TypeScript.
- Definir interfaces o tipos para las propiedades.
- Evitar `any`.
- Establecer valores predeterminados cuando corresponda.
- Utilizar variantes tipadas para controlar los estados visuales.

### Consistencia

- Respetar `DESIGN_SYSTEM.md`.
- Utilizar los tokens de color oficiales.
- Respetar la jerarquía tipográfica.
- Mantener consistencia en espaciados, bordes y radios.
- Utilizar las mismas reglas visuales en componentes equivalentes.

## 4. Clasificación de componentes

Organiza los componentes según su responsabilidad.

Las siguientes categorías son una propuesta de clasificación y no implican que todos estos componentes ya estén implementados.

### 4.1. Componentes básicos

Elementos de interfaz utilizados como base para construir otros componentes.

Ejemplos:

- Button.
- Input.
- Textarea.
- Select.
- Checkbox.
- Radio.
- Badge.
- Icon.
- Divider.

### 4.2. Componentes compuestos

Elementos que agrupan varios componentes básicos para resolver una función visual o interactiva.

Ejemplos:

- SearchBar.
- Pagination.
- Modal.
- Alert.
- DropdownMenu.
- Tabs.
- FilterPanel.
- FormField.

### 4.3. Componentes de negocio

Componentes relacionados directamente con las funcionalidades de NoodleVolt.

Ejemplos:

- TarjetaPlatillo.
- BadgeEstado.
- TarjetaPedido.
- TarjetaCliente.
- TarjetaMesa.
- TarjetaProducto.
- ResumenVenta.
- PedidoItem.

Los nombres anteriores son ejemplos de clasificación. Antes de crearlos, comprueba si existen equivalentes en el proyecto.

### 4.4. Componentes estructurales

Elementos que organizan la distribución general de las interfaces.

Ejemplos:

- Header.
- Sidebar.
- Navbar.
- Footer.
- DashboardLayout.
- PageHeader.
- ContentContainer.

### 4.5. Componentes específicos por perfil

NoodleVolt dispone de interfaces para diferentes perfiles de usuario.

Los componentes deben organizarse teniendo en cuenta las necesidades de:

- Cliente.
- Mesero.
- Gerente.
- Personal.

No debes asumir que todos los perfiles comparten los mismos componentes o interacciones.

Cuando dos perfiles necesiten elementos visualmente similares, evalúa si pueden compartir un componente configurable mediante propiedades.

## 5. Componentes identificados en Figma

El manifiesto de Figma contiene referencias a los siguientes componentes:

| Componente | Identificador de nodo |
|---|---|
| Botón | `11:34` |
| Input | `11:59` |
| BadgeEstado | `11:140` |
| TarjetaPlatillo | `12:84` |
| Paginación | `153:1417` |

Estos identificadores permiten localizar los componentes originales en Figma.

No debes asumir que todos están implementados en el frontend ni que sus equivalentes tienen exactamente el mismo nombre.

Antes de modificarlos o implementarlos, compara su diseño con los componentes existentes.

## 6. Inventario de componentes del proyecto

Antes de comenzar una tarea de implementación, realiza un inventario de los componentes existentes.

Para cada componente identifica:

- Nombre.
- Ubicación del archivo.
- Responsabilidad.
- Props disponibles.
- Variantes.
- Estados.
- Dependencias.
- Pantallas donde se utiliza.
- Correspondencia con Figma, cuando exista.

Clasifica cada componente en una de estas categorías:

**Existente y reutilizable**

El componente ya existe y cumple con el diseño y comportamiento requerido.

**Existente, requiere ajustes**

El componente existe, pero necesita modificaciones visuales o funcionales.

**Existente, requiere refactorización**

El componente presenta problemas de organización, duplicación o mantenimiento que afectan la implementación.

**Pendiente de implementación**

No existe un componente equivalente y es necesario desarrollarlo.

**Pendiente de validación**

No hay suficiente información para determinar cómo debe implementarse.

No modifiques componentes existentes únicamente para adaptarlos a una pantalla si esto puede afectar otras funcionalidades.

## 7. Variantes y estados

Los componentes interactivos deben contemplar los estados necesarios.

Por ejemplo, un botón puede tener:

- Primary.
- Secondary.
- Outline.
- Disabled.
- Loading.

Un input puede tener:

- Default.
- Focus.
- Filled.
- Error.
- Disabled.

Un badge puede tener:

- Success.
- Warning.
- Danger.
- Info.
- Neutral.

Estos ejemplos no representan necesariamente todas las variantes oficiales de Figma. Debes comprobar las variantes reales antes de implementarlas.

Evita crear componentes separados para cada variante cuando puedan resolverse mediante propiedades tipadas.

## 8. Responsive Design

Los componentes deben funcionar correctamente en los dispositivos contemplados por el proyecto.

Debes considerar:

- Desktop.
- Tablet.
- Mobile.

No todos los componentes deben comportarse de la misma manera en cada dispositivo.

Respeta las variantes definidas en Figma y evita reducir automáticamente las dimensiones de un componente de escritorio para obtener su versión móvil.

## 9. Reglas de implementación

Antes de crear o modificar un componente:

1. Identifica su función.
2. Busca componentes equivalentes en el proyecto.
3. Comprueba si puede reutilizarse.
4. Consulta su referencia en Figma cuando esté disponible.
5. Identifica sus variantes y estados.
6. Comprueba los tokens del Design System.
7. Define sus propiedades TypeScript.
8. Implementa siguiendo la arquitectura existente.
9. Verifica su comportamiento y apariencia.
10. Documenta cualquier diferencia respecto al diseño.

No dupliques componentes por diferencias menores de color, tamaño o texto.

Utiliza propiedades configurables cuando exista una necesidad real de reutilización.

## 10. Criterios de calidad

Un componente se considera terminado cuando:

- Cumple su responsabilidad.
- Respeta el diseño de referencia.
- Utiliza los tokens oficiales.
- Tiene propiedades correctamente tipadas.
- Contempla los estados necesarios.
- Funciona correctamente en los dispositivos previstos.
- No genera duplicaciones innecesarias.
- No rompe otras pantallas.
- Ha sido probado en el contexto donde se utiliza.

## 11. Registro de componentes

Cuando se implemente un componente nuevo o se realice una modificación importante, actualiza el inventario.

Utiliza este formato:

| Componente | Estado | Ubicación | Referencia Figma | Observaciones |
|---|---|---|---|---|
| EjemploButton | Existente y reutilizable | src/components/ | 11:34 | Pendiente de validar variantes |

No inventes ubicaciones ni identificadores.

## 12. Instrucciones para el agente

Debes seguir estas reglas en todas las tareas frontend:

1. Analiza primero los componentes existentes.
2. No reconstruyas elementos que ya estén implementados correctamente.
3. Reutiliza los componentes disponibles.
4. Mantén una arquitectura coherente.
5. Evita duplicaciones.
6. Respeta el Design System.
7. No inventes variantes que no estén justificadas.
8. Comprueba el impacto de cualquier modificación en las pantallas existentes.
9. Documenta los componentes nuevos y las modificaciones importantes.
10. Prioriza la mantenibilidad y consistencia de NoodleVolt.

**El objetivo no es tener la mayor cantidad de componentes, sino una biblioteca coherente donde cada componente tenga una función clara y pueda reutilizarse correctamente.**