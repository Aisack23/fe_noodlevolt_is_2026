@AGENTS.md
 
# NoodleVolt — Proyecto 3: Plataforma de gestión de restaurantes (multi-sucursal)
 
Proyecto académico de Ingeniería de Software (UCA, ciclo 02/2026, Sección 02). **Equipo Elektro.**
Este repo es el **frontend**, un fork de `fe_boilerplate_is_2026`. El backend vive en un repo aparte
(fork de `be_boilerplate_is_2026`).
 
La fuente de verdad funcional es el documento de historias de usuario `HU_PLANTILLA_v3`
(épicas 1–10 y Anexo A). Cada pantalla corresponde a una task FE-x.x.x; respeta sus estados, sus
mensajes y sus criterios de aceptación tal como están redactados.
 
## Equipo y responsables
- **Pamela Gómez:** Épica 1 (Menú digital y catálogo) y Épica 2 (Toma de pedidos).
- **Gabriela Maldonado:** Épica 3 (Cocina / Comandas) y Épica 4 (Reservaciones de mesa).
- **Diego Iraheta:** Épica 5 (Inventario de insumos) y Épica 6 (Pagos y facturación).
- **Isaac Tovar:** Épica 7 (Lealtad / puntos), Épica 8 (Reseñas) y Anexo A (Acceso y datos base).
- **Abraham Flores:** Épica 9 (Notificaciones) y Épica 10 (Reportes por sucursal).
## Reglas de la cátedra (no negociables)
- No crear repos nuevos; se trabaja sobre el fork. Ramas + Pull Requests internos con revisión cruzada.
- No romper el contrato de autenticación (cómo se identifica al usuario, su rol y su sucursal).
- Toda decisión técnica (librería de estado, patrones, endpoints consumidos) se documenta en `/docs`
  con su justificación (regla 2.2).
- El README lleva los nombres completos de los integrantes y el rol de cada uno.
- La definición de terminado de cada task FE incluye **"Revisión visual contra el diseño acordado"**.
  El diseño acordado es el archivo de Figma (ver más abajo).
## Roles (token: usuarioId, rol, sucursalId)
`CLIENTE`, `MESERO`, `COCINA`, `CAJERO`, `ENCARGADO_INVENTARIO`, `GERENTE`, `GERENTE_GENERAL`.
`CLIENTE` y `GERENTE_GENERAL` no tienen sucursal; el resto del personal solo ve su sucursal.
Después del login, cada rol se redirige a su pantalla de inicio (FE-A.1.1).
 
## Stack
 
### Ya incluido en el boilerplate (no cambiar sin documentarlo)
- **Next.js 16 (App Router) + React 19 + TypeScript.** Leer `node_modules/next/dist/docs/` antes de
  escribir código (ver AGENTS.md). Ojo: el middleware se llama `proxy.ts` en esta versión.
- **Tailwind CSS v4**: los tokens se configuran con `@theme` en `app/globals.css`, no con `tailwind.config.js`.
- **Autenticación:** Server Action `app/actions/auth.ts` → `POST {API_URL}/auth/login` → token en una
  cookie httpOnly (`lib/session.ts`). `proxy.ts` protege las rutas privadas. Base de la API: `/api/v1`.
### Backend (otro repo)
- NestJS + Prisma + PostgreSQL, levantado con el docker-compose obligatorio. URL en `.env` → `API_URL`.
### Propuesta del equipo (pendiente de aprobar y documentar en /docs)
- **Estado del cliente:** Zustand, solo para estado de UI: el carrito para llevar, la comanda en curso
  del mesero, la sucursal seleccionada y la clave de operación (UUID) de reintentos.
- **Datos del servidor:** Server Components + Server Actions con `fetch` a `API_URL`, reenviando el
  token de la cookie. No se guardan datos del backend en Zustand.
- **Polling:** tablero de cocina cada 5 s (FE-3.1.1) y campana de notificaciones cada 15 s (FE-9.4.1),
  en componentes cliente.
- **Gráficas (Épica 10):** Recharts.
- **Íconos:** `lucide-react`. **Fuentes:** `next/font/google` (reemplaza Geist).
## Línea de diseño (marca NoodleVolt)
 
### Concepto
Comida asiática rápida y con energía: una caja de noodles que corre. Ilustración plana con contorno
grueso marrón oscuro, formas redondeadas, líneas de velocidad y mucho espacio en blanco. Moderno,
ágil y amigable; no de lujo. Las pantallas del cliente llevan más marca; las del personal son más
sobrias y funcionales (densidad de datos, legibilidad, rapidez).
 
### Logos (archivos en `public/brand/` y componentes en Figma)
- `logo-horizontal.png` / `Logo/Horizontal`: mascota + "NOODLE VOLT". Navbar del cliente (escritorio), login y registro.
- `logo-wordmark.png` / `Logo/Wordmark`: solo el texto. Navbar móvil del cliente, footer y comprobantes/tickets.
- `mascota.png` / `Logo/Mascota`: solo la caja corriendo. Favicon, barra del personal, estados vacíos, carga y "pedido enviado".
- No deformar ni recolorear. Los PNG actuales tienen fondo gris claro (#FAFAF8); usarlos sobre ese mismo fondo
  hasta tener versiones transparentes o SVG.
### Colores de marca (usar siempre los tokens, nunca hex sueltos)
- `crimson` #C0392B: principal. Botones primarios, precios, elemento activo de la navegación.
- `orange` #D86B2C: secundario. Hover, chips de categoría, botones secundarios.
- `brown` #2C1810: texto principal, contornos, barra lateral del personal.
- `cream` #F7EBD9: fondo de secciones y tarjetas del cliente.
- `gold` #F2B134: acento puntual. Puntos de lealtad, estrellas de reseñas, "Nuevo", destacados.
  Nunca para texto sobre fondo claro (no tiene contraste suficiente).
- Fondo base: #FAFAF8. Bordes y divisores: #E8DED3. Texto secundario: #6B5E55.
### Colores de estado (semánticos; son distintos de los de marca)
Todo estado se muestra con **badge = color + ícono + texto**, nunca solo con color.
- `success` #2E7D4F: Disponible, Libre, PAGADO, CONFIRMADA, LISTO.
- `warning` #B7791F: Por limpiar, Cobro en caja pendiente, EN_PREPARACION, insumo crítico.
- `danger` #9B2C2C: Agotado, Ocupada, CANCELADA, Pago en línea pendiente (no preparar), errores.
- `info` #2B6CB0: PENDIENTE, avisos informativos.
- `neutral` #9A8F87: ENTREGADO, deshabilitado.
Vocabulario fijo de estados (igual que en las HU):
- Mesa: LIBRE, OCUPADA, POR_LIMPIAR.
- Línea/pedido: PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO.
- Reservación: CONFIRMADA, CANCELADA.
- Platillo: Disponible / Agotado.
### Tipografía
- **Títulos:** Antonio (condensada, mayúsculas, eco de "NOODLE"). H1 48px, H2 36px, H3 24px.
- **Texto e interfaz:** Inter. Cuerpo 16px, secundario 14px, botones SemiBold 16px, datos de tabla 14px.
- **Cocina:** números de pedido y platillos ≥ 24px para leer a distancia.
### Componentes y estilo
- Radios: 16px tarjetas, 12px botones/inputs, pill para badges y chips.
- Borde de 2px brown en tarjetas destacadas del cliente; en el personal, borde de 1px #E8DED3.
- Espaciado en múltiplos de 8px. Íconos Lucide 24px, stroke 2.
- Áreas táctiles de 44px o más (mesero, cajero y cocina usan tableta). Contraste AA mínimo.
- Toda pantalla con datos diseña sus **4 estados**: inicial, cargando (skeleton y botón deshabilitado),
  éxito y error (mensaje del servidor). También el **estado vacío** con el texto exacto de la HU.
### Layouts
- **Cliente:** navbar superior con logo, selector de sucursal, saldo de puntos (FE-7.1.1),
  campana (FE-9.4.1) y carrito. Móvil primero (360px) y escritorio (1440px).
- **Personal:** barra lateral brown con las opciones de su rol + barra superior con sucursal, campana
  y usuario. Tableta (1024×768) y escritorio (1440px).
- **Cocina:** pantalla completa sin barra lateral, tablero horizontal.
## Mapa de pantallas (rutas → task FE)
 
### Público / Cliente — `app/(cliente)/`
- `/login`, `/registro` — FE-A.1.1
- `/menu` — Menú por sucursal con Disponible/Agotado — FE-1.2.1 (la reutiliza el mesero)
- `/carrito` — Carrito, modalidad de pago, hora de retiro y pago simulado — FE-2.2.1
- `/reservar` — Buscador de disponibilidad — FE-4.1.1 → formulario y confirmación — FE-4.2.1
- `/mis-pedidos` — Pedidos con estado + "Calificar" — FE-8.1.1
- `/resenas` — Promedio y reseñas por sucursal — FE-8.2.1
- `/mis-puntos` — Saldo, historial y canje — FE-7.2.1, FE-7.3.1
- `/notificaciones` — Centro de avisos — FE-9.4.1
### Mesero — `app/(staff)/mesero/`
- `/salon` — Cuadrícula de mesas por estado + "Marcar limpia" — FE-A.3.1 (componente compartido)
- `/comanda` — Mesa → menú con cantidades y notas → resumen → número de pedido — FE-2.1.1
- `/listos` — "Listos para entregar" + "Entregado" — FE-3.2.1
### Cocina — `app/(staff)/cocina/`
- `/` — Tablero de comandas, Iniciar/Listo por platillo, notas resaltadas — FE-3.1.1, FE-3.2.1
- Panel de insumos faltantes al tocar un platillo agotado — FE-5.1.1
### Cajero — `app/(staff)/caja/`
- `/mesas` — Cuenta de la mesa — FE-6.1.1 → cobro dividido, ticket y datos fiscales — FE-6.1.2, FE-6.3.1
- `/para-llevar` — Pedidos para llevar, vuelto y "Marcar retirado" — FE-6.2.1
- `/documentos` — Consulta y reimpresión de documentos fiscales — FE-6.3.2
### Encargado de inventario — `app/(staff)/inventario/`
- `/compras/nueva` — Registro de compras — FE-5.3.1
- `/compras` — Historial de entradas — FE-5.3.2
- `/por-comprar` — Insumos por comprar — FE-5.2.1
### Gerente (sucursal) — `app/(staff)/gerente/`
- `/` — Panel con widget de insumos críticos — FE-5.2.1
- `/catalogo` — Tabla de platillos + modal crear/editar + estado — FE-1.1.1
- `/reservaciones` — Listado + cuadrícula de ocupación + cancelar — FE-4.3.1
- `/lealtad` — Configuración del programa — FE-7.4.1
- También accede a `/caja/documentos` y a `/inventario/por-comprar`.
### Gerente general — `app/(staff)/reportes/`
- `/ventas` — Ventas y comparación por sucursal — FE-10.1.1
- `/mas-vendidos` — Platillos más vendidos — FE-10.2.1
- `/horarios-pico` — Horarios pico — FE-10.3.1
## Componentes compartidos (diseñar y construir una sola vez)
- `SalonMesas` (FE-A.3.1): lo usan la comanda (FE-2.1.1) y la cuenta de mesa (FE-6.1.1).
- `MenuSucursal` (FE-1.2.1): lo usan el cliente, el mesero y la alerta de insumos (FE-5.1.1).
- `TarjetaPlatillo`, `BadgeEstado`, `SelectorSucursal`, `Campana` (FE-9.4.1), `SaldoPuntos` (FE-7.1.1),
  `EstadoVacio`, `Modal`, `Tabla` con paginación y filtros.
## Figma
- Archivo: https://www.figma.com/design/pcJk904tbSTwfNlSRz8aRw/NoodleVolt?t=JeYJetuKxZ7tCo5v-1
- Páginas: `Design System` · `Layouts` · `E1 Menú` · `E2 Pedidos` · `E3 Cocina` ·
  `E4 Reservaciones` · `E5 Inventario` · `E6 Pagos` · `E7 Lealtad` · `E8 Reseñas` ·
  `E9 Notificaciones` · `E10 Reportes` · `A Acceso y salón`. Cada frame va en la página de su épica.
- El archivo pertenece al equipo Elektra (plan Student). Los IDs de páginas, variables, estilos y
  componentes están en `docs/figma/ds-state.json`.
- Cada frame se nombra `Rol / Pantalla / Tamaño / Estado`, por ejemplo
  `Mesero / Comanda / Tablet / Error 422`. Indicar la task FE en la descripción del frame.
- Las pantallas solo usan variables, estilos y componentes del Design System. Auto-layout en todo.
- Usar textos realistas: platillos asiáticos (ramen, yakisoba, gyozas, bao, pad thai), precios en USD,
  sucursales de El Salvador (p. ej. "San Salvador – Centro", "Santa Tecla").
- Primero se diseña y el equipo aprueba en Figma; después se programa a partir de los frames aprobados.
## Convenciones de código
- Componentes en `components/` (UI genérica en `components/ui/`); stores de Zustand en `stores/`;
  cliente HTTP y tipos de la API en `lib/api/`.
- Textos de la interfaz en español; código e identificadores en inglés. Los valores de enum de la API
  se respetan tal cual (`EN_PREPARACION`, `POR_LIMPIAR`…) y se traducen a etiquetas solo en la UI.
- Cada pantalla trae sus pruebas de componente (éxito, error y carga), como pide la definición de terminado.
- Antes de un PR, `npm run lint` y `npm run build` deben pasar y no puede haber errores en consola.
 