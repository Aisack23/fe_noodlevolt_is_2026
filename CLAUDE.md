@AGENTS.md
 
# NoodleVolt — Proyecto 3: Plataforma de gestión de restaurantes (multi-sucursal)
 
Proyecto académico de Ingeniería de Software (UCA, ciclo 02/2026, Sección 02). **Equipo Elektro.**
Este repo es el **frontend**, un fork de `fe_boilerplate_is_2026`. El backend vive en un repo aparte
(fork de `be_boilerplate_is_2026`).
 
La fuente de verdad funcional es el documento final de historias de usuario
`docs/referencias/HU_FINAL.pdf` (29/10/2026; reemplaza a `HU_PLANTILLA_v3`): Parte 2 (decisiones
y reglas comunes), épicas 1–10 con historias H1–H34 y Anexo A (H35–H36). Las tasks siguen el
formato `TIPO-historia.número` (FE-1.1, FE-16.2…). Cada pantalla corresponde a una task FE; respeta
sus rutas, roles, estados, mensajes y criterios de aceptación tal como están redactados.
 
## Equipo y responsables (por historia; responsable de sus tasks FE)
- **Pamela Gómez:** H1, H2, H3, H4 (FE-1.1, FE-2.1, FE-3.1, FE-4.1), H19 (FE-19.1, FE-19.2) y H26 (FE-26.1).
- **Gabriela Maldonado:** H6–H10 (FE-6.1, FE-7.1, FE-8.1, FE-9.1, FE-10.1) y H15 (FE-15.1, FE-15.2).
- **Diego Iraheta:** H11, H12, H14 (FE-11.1, FE-14.1) y H16–H18 (FE-16.1, FE-16.2, FE-17.1, FE-18.1).
- **Isaac Tovar:** H20–H25 (FE-20.1 a FE-25.1) y Anexo A, H35–H36 (FE-35.1).
- **Abraham Flores:** H5 (FE-5.1), H13 (FE-13.1), H27–H31 (FE-31.1) y H32–H34 (FE-32.1, FE-33.1, FE-34.1).
## Reglas de la cátedra (no negociables)
- No crear repos nuevos; se trabaja sobre el fork. Ramas + Pull Requests internos con revisión cruzada.
- No romper el contrato de autenticación (cómo se identifica al usuario, su rol y su sucursal).
- Toda decisión técnica (librería de estado, patrones, endpoints consumidos) se documenta en `/docs`
  con su justificación (regla 2.2).
- El README lleva los nombres completos de los integrantes y el rol de cada uno.
- La definición de terminado de cada task FE incluye **"Revisión visual contra el diseño acordado"**.
  El diseño acordado es el archivo de Figma (ver más abajo).
## Roles (token: usuarioId, rol, sucursalId) — sección 2.1
`CLIENTE`, `MESERO`, `COCINA`, `GERENTE`, `GERENTE_GENERAL`. No hay cajero ni encargado de
inventario: el **Mesero** cobra (H16, H17) y el **Gerente** lleva el inventario (H13–H15).
- `CLIENTE` y `GERENTE_GENERAL` no tienen sucursal. El personal y el Gerente operan solo en su
  sucursal; el Gerente general opera en todas, pero solo en las funciones donde está permitido.
- Solo `CLIENTE` se registra solo (`/registro` → `POST /users`; el cuerpo no puede traer `rol`).
  El resto del personal se crea por script.
- La guarda de rutas usa la tabla de permisos de la sección 2.1: sin sesión redirige a `/login`;
  con un rol no permitido muestra «Acceso denegado». Ocultar opciones del menú es solo ayuda visual
  (el backend valida con 401/403). Ante un 401 se limpia la sesión y se redirige a `/login`.
- Sesión de 8 horas (S17). Tras el login cada rol va a su pantalla de inicio (FE-35.1; la HU no fija
  cuál, propuesta: CLIENTE `/menu`, MESERO `/mesero/salon`, COCINA `/cocina/tablero`,
  GERENTE `/gerente`, GERENTE_GENERAL `/reportes/ventas`).
 
## Stack
 
### Ya incluido en el boilerplate (no cambiar sin documentarlo)
- **Next.js 16 (App Router) + React 19 + TypeScript.** Leer `node_modules/next/dist/docs/` antes de
  escribir código (ver AGENTS.md). Ojo: el middleware se llama `proxy.ts` en esta versión.
- **Tailwind CSS v4**: los tokens se configuran con `@theme` en `app/globals.css`, no con `tailwind.config.js`.
- **Autenticación:** Server Action `app/actions/auth.ts` → `POST {API_URL}/auth/login` → token en una
  cookie httpOnly (`lib/session.ts`). `proxy.ts` protege las rutas privadas. Base de la API: `/api/v1`.
### Backend (otro repo)
- NestJS + Prisma + PostgreSQL, levantado con el docker-compose obligatorio. URL en `.env` → `API_URL`.
### Decisiones del documento final y propuestas (documentar en /docs)
- **Estado del frontend (sección 2.6, decisión de la HU):** contexto del propio framework, sin
  librería adicional. El estado global guarda solo la sesión (usuario, rol, sucursal) y el contador de
  notificaciones; todo lo demás vive en el estado local de cada pantalla.
- **Pendiente de resolver con el equipo:** la sección 2.1 dice que el token se guarda en
  `sessionStorage`, mientras que el boilerplate lo guarda en una cookie httpOnly; y la propuesta
  anterior de Zustand choca con la decisión de la 2.6. Decidir y documentar en `/docs` antes de programar.
- **Datos del servidor:** Server Components + Server Actions con `fetch` a `API_URL`, reenviando el token.
- **Clave de operación:** UUID por intento, reutilizada en reintentos (FE-4.1).
- **Polling:** tablero de cocina cada 5 s (S4, FE-6.1) y notificaciones cada 15 s (S5, FE-31.1),
  en componentes cliente.
- **Gráficas (reportes H32–H34):** Recharts.
- **Íconos:** `lucide-react`. **Fuentes:** `next/font/google` (reemplaza Geist).
## Reglas comunes de pantalla (sección 2.6 y supuestos)
- Toda pantalla maneja **6 estados**: vacío (con el texto exacto de la HU), cargando (skeleton y
  botones de acción deshabilitados), error de validación (campo señalado), error del servidor,
  éxito y sin permiso.
- **Error del servidor:** «No se pudo completar la operación. Intenta de nuevo» (salvo que la task pida
  un mensaje específico, p. ej. el platillo afectado ante 422).
- **Sin permiso:** pantalla «Acceso denegado» con el botón «Volver al inicio».
- **Acciones irreversibles** (cancelar una reservación, pagar) piden **confirmación** antes de ejecutarse.
- **Montos:** USD con **dos decimales** (`$12.50`). Fechas con hora en ISO 8601; sin hora `AAAA-MM-DD`.
- **Listados: 10 por página (S21)** si la task no indica otro. La API responde `datos`, `total`,
  `pagina`, `tamanoPagina`; los errores traen `codigo` y `mensaje`.
- Códigos: 400 datos inválidos, 401 sin sesión, 403 rol o sucursal, 404 no existe, 409 conflicto
  (duplicado, cupo lleno o estado no permitido). Validar en el cliente no sustituye al servidor.
- Supuestos que afectan la UI: cantidad por línea 1–20 (S1), nota ≤ 200 caracteres (S2), reservación
  de 90 min (S3), retiro estimado 20 min después de confirmar (S6), propina sugerida 10 % (S7),
  pago en mesa efectivo y tarjeta (S8), 1 punto por $1.00 (S10), código de canje vence a los 30 días
  (S11), DUI `00000000-0`, NIT `0000-000000-000-0`, NRC `0000000-0` (S12), reseñas más recientes
  primero (S13), top 10 platillos (S15), franjas de 1 h con 3 picos resaltados (S16), contraseña ≥ 8
  (S19), teléfono de 8 dígitos (S20).
## Pasarela de pago simulada (sección 2.3)
La usan el cobro con tarjeta de la cuenta de mesa (H16, FE-16.2) y el pago en línea (H18, FE-18.1).
- Tarjeta terminada en **4242**: siempre aprueba.
- Tarjeta terminada en **0002**: rechaza con «Fondos insuficientes (simulado)».
- Cualquier otra: rechaza con «Tarjeta no válida para la prueba».
- La respuesta tarda **2 s**; mientras tanto se muestra **«Procesando pago»** y el botón se deshabilita.
- Nunca se guardan el número completo ni el código de seguridad (ni en el navegador ni en logs);
  solo los últimos 4 dígitos en la referencia del pago.
- Un rechazo registra el pago como RECHAZADO (sin comprobante ni puntos), el pedido sigue en
  PENDIENTE_PAGO (o la cuenta en ABIERTA) y se muestra el motivo con opción de reintentar.
  Un pedido ya pagado responde 409 («el pedido ya fue pagado»).
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
- `success` #2E7D4F: Disponible, Libre, Pagado, Aprobado, Confirmada, Listo, Suficiente, código Disponible.
- `warning` #B7791F: Por limpiar, Cobro en caja pendiente, En preparación, Bajo mínimo.
- `danger` #9B2C2C: Agotado, Ocupada, Cancelada/Cancelado, Pago en línea pendiente - no preparar
  (Pendiente de pago), Rechazado, Sin stock, errores.
- `info` #2B6CB0: Pendiente, Abierta, avisos informativos.
- `neutral` #9A8F87: Entregado, Cerrada, Deshabilitado, código Usado o vencido.
Vocabulario fijo de estados (sección 2.2; cualquier transición fuera de la tabla responde 409):
- Pedido: PENDIENTE_PAGO → PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO; CANCELADO (sin historia).
- Línea de pedido: PENDIENTE → EN_PREPARACION → LISTO (Cocina) → ENTREGADO (Mesero).
- Cuenta: ABIERTA → CERRADA. Mesa: LIBRE → OCUPADA → POR_LIMPIAR → LIBRE.
- Reservación: CONFIRMADA → CANCELADA (Gerente). Platillo: DISPONIBLE, AGOTADO, DESHABILITADO.
- Pago: APROBADO o RECHAZADO. Código de canje: DISPONIBLE → USADO (vencido se calcula).
- Insumo (calculado): Sin stock, Bajo mínimo, Suficiente.
### Tipografía
- **Títulos:** Antonio (condensada, mayúsculas, eco de "NOODLE"). H1 48px, H2 36px, H3 24px.
- **Texto e interfaz:** Inter. Cuerpo 16px, secundario 14px, botones SemiBold 16px, datos de tabla 14px.
- **Cocina:** números de pedido y platillos ≥ 24px para leer a distancia.
### Componentes y estilo
- Radios: 16px tarjetas, 12px botones/inputs, pill para badges y chips.
- Borde de 2px brown en tarjetas destacadas del cliente; en el personal, borde de 1px #E8DED3.
- Espaciado en múltiplos de 8px. Íconos Lucide 24px, stroke 2.
- Áreas táctiles de 44px o más (mesero y cocina usan tableta). Contraste AA mínimo.
### Layouts
- **Cliente:** navbar superior con logo, selector de sucursal, saldo de puntos (FE-20.1),
  campana (FE-31.1) y carrito. Móvil primero (360px) y escritorio (1440px).
- **Personal:** barra lateral brown con las opciones de su rol + barra superior con sucursal, campana
  (FE-31.1) y usuario. Tableta (1024×768) y escritorio (1440px).
- **Cocina:** pantalla completa sin barra lateral, tablero horizontal.
## Mapa de pantallas (ruta · rol · task FE, según el documento final)
 
### Público y cliente
- `/login`, `/registro` · público · FE-35.1 (formularios, redirección por rol y guarda de rutas)
- `/menu` · público (Cliente, Mesero o sin sesión) · FE-2.1. Panel de insumos faltantes dentro de
  `/menu` al tocar un platillo agotado · Cocina, Mesero y Gerente (nunca al cliente) · FE-11.1
- `/pedidos/llevar` · Cliente · FE-4.1 (carrito, sucursal, modalidad de pago, hora de retiro, 409)
- `/pedidos/:pedidoId/pago` · Cliente · FE-18.1 (pago en línea y comprobante) + datos fiscales FE-19.1
- `/reservaciones/disponibilidad` · público · FE-8.1 → `/reservaciones/nueva` · Cliente · FE-9.1
- `/mis-pedidos` · Cliente · FE-24.1 (lista con estado + «Calificar» con estrellas y comentario)
- `/sucursales/resenas` · público · FE-25.1
- `/mis-puntos` · Cliente · FE-21.1 · `/canje` · Cliente · FE-22.1
- Barra superior del cliente: saldo de puntos · Cliente · FE-20.1
- Barra superior de todas las pantallas: campana y centro de notificaciones · todos con sesión · FE-31.1
- `/documentos-fiscales` · Cliente (los suyos), Mesero y Gerente (su sucursal) · FE-19.2
### Mesero — `/mesero/…`
- `/mesero/salon` · FE-5.1 (cuadrícula de mesas + «Marcar limpia»; componente compartido)
- `/mesero/comandas` · FE-3.1 (mesa → menú con cantidades y notas → resumen → número de pedido)
- `/mesero/listos` · FE-7.1 («Listos para entregar» + «Entregado»)
- `/mesero/cuentas` · FE-16.1 (cuenta de una mesa ocupada)
- `/mesero/cuentas/:cuentaId/cobro` · FE-16.2 (cobro dividido y ticket) + FE-19.1 (datos fiscales)
- `/mesero/pedidos-llevar` · FE-17.1 (cobro en caja, vuelto y «Marcar retirado»)
### Cocina
- `/cocina/tablero` · Cocina y Gerente · FE-6.1 (tablero, polling 5 s) + FE-7.1 («Iniciar»/«Listo», solo Cocina)
### Gerente (sucursal) — `/gerente/…`
- `/gerente` · widget de insumos críticos · FE-14.1
- `/gerente/catalogo` · FE-1.1 (tabla + modal crear/editar + estado)
- `/gerente/reservaciones` · FE-10.1 (listado por fecha, ocupación por franja, cancelar)
- `/gerente/inventario` · FE-13.1 · `/gerente/insumos-por-comprar` · FE-14.1
- `/gerente/compras/nueva` · FE-15.1 · `/gerente/compras` · FE-15.2
- `/gerente/calificaciones` · FE-26.1
- `/gerente/lealtad` · Gerente y Gerente general · FE-23.1
- También: `/cocina/tablero` (FE-6.1) y `/documentos-fiscales` (FE-19.2).
### Gerente general — `/reportes/…`
- `/reportes/ventas` · FE-32.1 · `/reportes/platillos` · FE-33.1 · `/reportes/horarios` · FE-34.1
- También: `/gerente/lealtad` (FE-23.1).
Historias sin task FE: H12 (descuento de insumos), H27–H30 (servicio y avisos de notificaciones) y H36
(middleware BE-36.1; la guarda de rutas del frontend está en FE-35.1).
## Componentes compartidos (diseñar y construir una sola vez)
- `SalonMesas` (FE-5.1): lo usan la comanda (FE-3.1) y la cuenta de mesa (FE-16.1).
- `MenuSucursal` (FE-2.1): lo usan el cliente, el mesero (FE-3.1) y la alerta de insumos (FE-11.1).
- `PasarelaPago` (sección 2.3): cobro con tarjeta (FE-16.2) y pago en línea (FE-18.1).
- `DatosFiscales` (FE-19.1): dentro del cobro del mesero y del pago en línea.
- `AccesoDenegado`, `TarjetaPlatillo`, `BadgeEstado`, `SelectorSucursal`, `Campana` (FE-31.1),
  `SaldoPuntos` (FE-20.1), `EstadoVacio`, `Modal` (incluida la confirmación), `Tabla` con paginación
  de 10 y filtros.
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
- Componentes en `components/` (UI genérica en `components/ui/`); cliente HTTP y tipos de la API en
  `lib/api/`.
- Textos de la interfaz en español; código e identificadores en inglés. Los valores de enum de la API
  se respetan tal cual (`EN_PREPARACION`, `POR_LIMPIAR`…) y se traducen a etiquetas solo en la UI.
- Cada pantalla trae sus pruebas de componente (éxito, error y carga), como pide la definición de terminado.
- Antes de un PR, `npm run lint` y `npm run build` deben pasar y no puede haber errores en consola.
