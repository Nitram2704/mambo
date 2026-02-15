# Guía de Contribución - Mambo Fitness

¡Bienvenido al equipo! Para mantener el código limpio y el desarrollo ágil, seguimos estas normas:

## 🌿 Estrategia de Ramas (Git Flow)

Usamos la rama `main` como nuestra fuente de verdad estable. Todo el desarrollo se hace en ramas de características (feature branches):

- **Características:** `feat/nombre-de-la-feature` (ej: `feat/nutrition-logs`)
- **Correcciones:** `fix/nombre-del-bug` (ej: `fix/auth-callback`)
- **Documentación:** `docs/nombre-del-cambio` (ej: `docs/api-reference`)
- **Refactorización:** `refactor/nombre-del-modulo`

### Ciclo de Trabajo
1. Crea una rama desde `main`.
2. Realiza tus cambios y haz commits descriptivos.
3. Abre un **Pull Request (PR)** hacia `main`.
4. Espera a que la **CI (GitHub Actions)** pase y **CodeRabbit** revise tu código.

## 📋 GitHub Projects

Usamos el tablero de proyecto para gestionar las tareas:
- **Todo:** Tareas pendientes del MVP.
- **In Progress:** Tareas en las que estamos trabajando.
- **In Review:** Pull Requests abiertos esperando revisión.
- **Done:** Tareas fusionadas a `main`.

> [!TIP]
> Al crear una rama, puedes vincularla automáticamente a una Issue de GitHub escribiendo `Closes #numero` en la descripción de tu PR.

## 🧪 Estándares de Código

- **Linting:** Ejecuta `npm run lint` antes de subir tus cambios.
- **Tests:** Si añades lógica nueva, intenta añadir un test en la carpeta `__tests__`. Verifica con `npm test`.
- **Types:** Este es un proyecto de TypeScript. Evita usar `any` en la medida de lo posible.

---

¡A darle duro! 💪
