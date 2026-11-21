# NoodleVolt — Frontend

Interfaz web para una cadena de restaurantes chinos. Los clientes consultan el menú, hacen pedidos para llevar, reservan mesas y revisan sus puntos. El personal gestiona comandas, inventario, ventas y el estado operativo de las sucursales.

Proyecto 3 · Ingeniería de Software, UCA · Ciclo 02/2026, Sección 02 · Equipo Elektro.

## Ambiente desplegado

| Componente | URL |
| --- | --- |
| Frontend | [NoodleVolt](https://fe-noodlevolt-is-2026.onrender.com) |
| API | [Backend en Render](https://noodlevolt-api.onrender.com/api/v1) |
| Swagger | [Documentación de la API](https://noodlevolt-api.onrender.com/api/docs) |

Las cuentas de prueba se entregan por Moodle.

## Integrantes

| Nombre | Carnet | GitHub | Historias principales |
| --- | --- | --- | --- |
| Abraham Alejandro Flores Vásquez | 00067323 | [AlejandroFV74](https://github.com/AlejandroFV74) | HU-08, HU-10 |
| Pamela Alexandra Gómez Tenorio | 00139622 | [pamelalexndra](https://github.com/pamelalexndra) | HU-01, HU-05, HU-07, HU-11 |
| Diego Alejandro Iraheta Monterrosa | 00041923 | [DiegoIraheta00041923](https://github.com/DiegoIraheta00041923) | HU-04 |
| Gabriela Denise Maldonado Girón | 00133523 | [DeniseMaldonadoG](https://github.com/DeniseMaldonadoG) | HU-03 |
| César Isaac Tovar Jovel | 00016023 | [Aisack23](https://github.com/Aisack23) | HU-02, HU-06, HU-09 |

La asignación corresponde a la registrada en el proyecto. [Ficha del equipo](https://github.com/Aisack23/be_noodlevolt_is_2026#integrantes)

## Inicio rápido

Con Node.js 24 y la API local en el puerto `3000`, ejecuta estos comandos en la raíz del frontend.

```bash
npm ci
cp .env.example .env.local
npm run dev -- --port 3001
```

Abre `http://localhost:3001`. La plantilla configura `API_URL=http://localhost:3000/api/v1`. Para verificar la rama ejecuta `npm run lint`, `npm test` y `npm run build`. [Instalación local](docs/05-instalacion-local.md)

## Documentación

1. [Guía de uso](docs/01-guia-de-uso.md)
2. [Arquitectura](docs/02-arquitectura.md)
3. [Modelo de datos](docs/03-modelo-de-datos.md)
4. [API](docs/04-api.md)
5. [Instalación local](docs/05-instalacion-local.md)
6. [Despliegue](docs/06-despliegue.md)
7. [Forma de trabajo](docs/07-forma-de-trabajo.md)
8. [Historias por módulo](docs/08-historias.md)
9. [Problemas conocidos](docs/09-problemas-conocidos.md)

El backend conserva la documentación de todo el sistema, incluido el modelo de datos y los contratos de la API. [Repositorio del backend](https://github.com/Aisack23/be_noodlevolt_is_2026) · [Documentación central](https://github.com/Aisack23/be_noodlevolt_is_2026/tree/main/docs)
