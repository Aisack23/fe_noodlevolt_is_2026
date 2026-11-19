# Problemas y limitaciones conocidos

| Problema o limitación | Cómo se manifiesta | Impacto | Referencia |
|---|---|---|---|
| Modalidad de pago y hora de retiro no consistentes en backend local | Al crear un pedido, la API puede devolver `ONLINE` y `pickupAt: null` aunque se solicite pago en caja. | Medio: la confirmación muestra «Por confirmar». | FE-04 |
| Flujos de mesero sin pantalla | Entradas como salón, cuentas, pedidos para llevar y documentos fiscales no tienen ruta implementada. | Medio: navegan a 404. | FE-03 |
| Mesas reservadas o fuera de servicio no se muestran en comanda | La adaptación de estados de mesa solo muestra disponible, ocupada o por limpiar. | Bajo: el usuario no ve dichos estados en esa vista. | `lib/api/tables.ts` |
| Lectura de notificaciones limitada | Solo se consulta la primera página de 20 y solo esos avisos se marcan al cerrar la campana. | Bajo. | FE-09 |
| Pago no productivo | El flujo usa tokens de tarjeta de prueba `test_4242` y `test_0002`. | Medio: no procesa cobros reales. | `lib/api/payments.ts` |
| Reseñas sin verificación visual formal | No hay manifiesto de Figma ni capturas FE-08 disponibles en el repositorio. | Bajo para funcionamiento; pendiente de fidelidad visual. | FE-08 |
| Lealtad sin historial ni canje | Solo se expone y muestra el saldo. | Bajo: funcionalidad fuera del alcance actual. | FE-07 |

No se registran problemas de instalación propios del frontend. Las integraciones requieren que `API_URL` apunte a una API NoodleVolt compatible.
