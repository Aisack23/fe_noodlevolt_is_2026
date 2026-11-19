# Forma de trabajo

## Convenciones observadas

El repositorio usa Git y mantiene `main` y `develop`, además de ramas con prefijos `feature/`, `fix/`, `bugfix/`, `chore/` y `docs/`. Los commits siguen mayoritariamente Conventional Commits, con alcance opcional, por ejemplo `feat(FE-10): ...`, `fix(FE-03): ...` y `docs(FE-03): ...`.

## Flujo recomendado para este repositorio

1. Crear una rama desde la rama de integración acordada por el equipo.
2. Nombrarla con el tipo y el identificador de la historia cuando exista: `feature/FE-XX-descripcion` o `fix/FE-XX-descripcion`.
3. Implementar el cambio junto con sus pruebas y la documentación de la historia en `docs/FE/` cuando corresponda.
4. Ejecutar `npm run lint`, `npm test` y `npm run build` antes de abrir la solicitud de cambio.
5. Abrir una pull request hacia la rama de integración acordada y fusionarla después de revisión.

El repositorio no contiene un tablero, responsables, regla formal de aprobaciones ni una política de releases. Esas decisiones deben ser acordadas por el equipo antes de declararlas como proceso oficial.

## Documentación por pantalla

Los documentos de `docs/FE/` registran el alcance de cada pantalla, rutas, contratos, decisiones de interfaz, diferencias con Figma, pruebas y pendientes. Al modificar un flujo cubierto, se debe actualizar el documento de su identificador FE y evitar marcar como verificado algo que no se haya comprobado.
