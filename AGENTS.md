# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Reglas de trabajo

### 1. Aprobar antes de commit y merge

Al terminar una **fase** o un **cambio importante**, el agente debe **detenerse y
preguntar al usuario** antes de:

- Hacer el commit en la rama correspondiente.
- Hacer la fusión (`merge`) a `main`.
- Hacer `push` al repositorio remoto.

No se asume la aprobación. Se propone el mensaje de commit, la rama y el plan de
fusión, y se espera la confirmación explícita del usuario.

### 2. Ramas

- `main` siempre debe quedar estable y compilable.
- El trabajo se hace en ramas descriptivas:
  - `feat/...` para funcionalidad nueva.
  - `fix/...` para correcciones.
  - `docs/...` para documentación.
  - `chore/...` para mantenimiento (dependencias, scripts, configuración).
- Antes de fusionar a `main`: `npx tsc --noEmit` debe pasar y el cambio debe
  haberse probado en local.

### 3. Documentación viva

- Mantener `PROGRESO.md` actualizado al final de cada fase: qué se hizo, qué
  falta, decisiones tomadas y problemas encontrados.
- `AGENTS.md` contiene las reglas permanentes de trabajo.

### 4. Contenido y datos

- El **contenido** (comandos, estrategias, retos) lo aporta el usuario.
- Antes de cambiar o añadir datos en Firebase, **consultar al usuario**.
- El agente implementa el formato acordado; no inventa contenido por su cuenta.

### 5. Verificación

- Ejecutar `npx tsc --noEmit` antes de cerrar una fase.
- Probar en local con Expo Go (`npx expo start`) antes de compilar el APK.
- No subir secretos: `google-service-account.json` está ignorado y nunca debe
  commitearse.

### 6. Estilo visual

- Paleta oficial (todos los tabs excepto Push): `#61CF5A`, `#63AD58`, `#50864C`,
  `#3E6A3D`, `#3B4B33`, con negro predominante.
- Push mantiene su paleta anterior por decisión del usuario.
