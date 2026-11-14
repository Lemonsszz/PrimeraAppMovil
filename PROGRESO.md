# PROGRESO — CyberVault_ (PrimeraAppMovil)

> Documento vivo del proyecto. Aquí se registran las fases, lo que ya está hecho
> y lo que falta. Actualizar al final de cada sesión de trabajo.
>
> **Última actualización:** 2026-11-14
> **Rama de trabajo:** `main`
> **Meta final:** APK Android funcional (EAS Build, perfil `preview`).

---

## 1. Objetivo del proyecto

App móvil estilo terminal (estética CyberVault: negro + verde `#00FF88`) pensada
como un **"santuario" de conocimiento de ciberseguridad**: un lugar único donde
buscar, guardar y consultar **comandos, estrategias, tácticas y procedimientos**
(Linux, Windows, Redes, Seguridad, Recon, Kali...), con:

- Autenticación de usuarios con **Firebase Auth**.
- Comandos almacenados en **Firebase Realtime Database**.
- **Notificaciones push** (Expo + FCM V1) y notificaciones locales de prueba.
- Distribución como **APK** vía **EAS Build**.

---

## 2. Stack y herramientas

| Área | Herramienta | Versión |
| --- | --- | --- |
| Framework | Expo SDK | 57.0.12 |
| UI | React Native / React | 0.86.2 / 19.2.3 |
| Navegación | Expo Router (file-based, typed routes) | 57.0.12 |
| Lenguaje | TypeScript (`strict`) | 6.0.3 |
| Auth | Firebase Auth (JS SDK) | 13.2.0 |
| Datos | Firebase Realtime Database | 13.2.0 |
| Push | expo-notifications + FCM V1 | 57.0.25 |
| Componentes | react-native-paper + Ionicons | 5.15.3 / 15.0.2 |
| Build / entrega | EAS Build (APK perfil `preview`) | CLI ≥ 16 |
| Safe area | react-native-safe-area-context | 5.7.0 |

**Comandos útiles**

```powershell
npx expo start            # desarrollo (Expo Go / dev build)
npx expo start --android  # abrir en emulador Android
npx tsc --noEmit          # verificación de tipos
npx eas build -p android --profile preview   # genera APK

node scripts/migrar-contenidos.mjs   # migrar/actualizar datos a `contenidos`
node scripts/importar-contenidos.mjs # importar el lote de contenidos del usuario
node scripts/seed-retos.mjs          # cargar/actualizar el banco de retos
node scripts/reglas-firebase.mjs     # publicar reglas (contenidos, retos, progreso)
```

---

## 3. Estado general

| Área | Estado |
| --- | --- |
| Login / registro con Firebase Auth | ✅ Funciona |
| Modelo unificado `contenidos` | ✅ 57 contenidos en 10 categorías (2026-11-14) |
| Lectura de contenidos (Realtime DB) | ✅ Funciona |
| Notificaciones locales y tokens | ✅ Funciona |
| Navegación por pestañas | ✅ Funciona (Inicio, Push, Comandos, Retos, Buscar, Perfil) |
| Búsqueda real (título, resumen, categoría, tags) | ✅ Funciona |
| Inicio introductorio con accesos directos | ✅ Funciona |
| Comandos agrupados por categoría + buscador por categoría | ✅ Funciona |
| Reto diario (preguntas, puntos y racha) | ✅ Funciona (31 preguntas) |
| Paleta verde bosque en todos los tabs (excepto Push) | ✅ Aplicada (2026-11-14) |
| Crear / editar / borrar comandos | ⛔ No existe |
| Favoritos / perfil real | ⛔ Maqueta |
| Persistencia de sesión / logout | ⛔ No existe |
| Reglas de seguridad de Firebase | ✅ Aplicadas y verificadas (2026-11-14) |
| Prueba local sin APK | ✅ Expo Go / Metro |
| APK de entrega | 🟡 Configurado, pendiente de compilar |

---

## 4. Fases

### Fase 0 — Orden y estabilidad (✅ completada 2026-11-14)

- [x] **Git recuperado.** El commit final (`29bf916`) estaba en *detached HEAD* y
      `main` apuntaba a una rama vieja. Se creó la rama `final-notificaciones`,
      se fusionó el histórico de `main` conservando la versión final y `main`
      quedó al día.
- [x] **Reglas de Realtime Database aplicadas y verificadas.** La raíz y
      `Usuarios` responden `401` sin autenticación; `Comandos` sigue de lectura
      pública para el modo invitado; la escritura exige usuario autenticado.
- [x] **Crash de la pestaña Buscar corregido.** Había texto suelto fuera de
      `<Text>` (`search.tsx`), lo que rompía la pantalla en el APK. Ahora es una
      decoración de fondo válida.
- [x] **Safe area aplicada** (`SafeAreaProvider` en el layout raíz + insets en
      todas las pantallas y en la barra de pestañas). Evita solapes con notch y
      barra de gestos en el APK.
- [x] **Handler de notificaciones global.** Se registra al arrancar la app, no
      solo al abrir la pestaña Push.
- [x] Limpieza de `console.log` de depuración y de imports sin usar.
- [x] `.gitignore` para material de apoyo local (PDF, capturas).
- [x] Verificación de tipos (`npx tsc --noEmit`) sin errores.

### Fase 1 — Funcionalidad core del santuario (🔜 siguiente)

- [x] **Modelo de datos unificado** (`contenidos`) con tipos: comando, estrategia, payload, herramienta y cheatsheet.
- [x] Migrar los comandos actuales a la nueva estructura (sin perder datos; `Comandos` queda de respaldo).
- [x] Pantalla de detalle `/contenido/[id]`: comando completo, explicación, plataforma, ejemplo, referencias y pasos (si es estrategia).
- [x] Botón **copiar al portapapeles** (`expo-clipboard`) en comando, ejemplo y cada paso.
- [x] Crear contenido desde la app (formulario con validación; requiere sesión).
- [x] Editar y eliminar contenido (desde el detalle, con confirmación).
- [x] **Búsqueda real en vivo** sobre título, resumen, categoría, plataforma y etiquetas.
- [x] **Ampliación del banco de contenidos**: 51 entradas nuevas + Hydra actualizado
      (57 en total) en 10 categorías: LINUX, WINDOWS, NETWORKING, SECURITY, RECON,
      WEB, ACTIVE_DIRECTORY, PRIVESC, CRYPTO, FORENSE y CLOUD.
- [x] **Comandos organizados por tarjetas de categoría** con contador y descripción.
- [x] **Pantalla de categoría** (`/categoria/[categoria]`) con su propio buscador.
- [x] **Resultados de búsqueda y tarjetas abren el detalle** del contenido.
- [x] **Inicio introductorio** con accesos directos a las demás pestañas y CTA del reto diario (sustituye a "AGREGAR COMANDO").
- [ ] Filtros: tipo (comando/estrategia), plataforma y dificultad.
- [ ] Favoritos (`favoritos/{uid}/{id}`).
- [ ] Botón de reintento en los estados de error.
- [ ] Probar todo en **Expo Go** (sin APK) y solo compilar al final.

### Fase 1b — Reto diario estilo HTB (✅ completada 2026-11-14)

- [x] Pestaña **Retos** (sustituye a la antigua pestaña Notas).
- [x] Banco de **31 preguntas** en el nodo `retos` (`scripts/seed-retos.mjs`).
- [x] **5 preguntas por día** elegidas de forma determinista: todos ven el mismo
      reto y cambia automáticamente a medianoche (hash FNV-1a de fecha + id).
- [x] Flujo secuencial: responder → ver explicación → siguiente pregunta → resumen.
- [x] **Puntos**: 10 por acierto + 20 de bonus si se aciertan todas.
- [x] **Racha diaria**: +1 si se completa el reto y el anterior fue ayer.
- [x] Progreso guardado por usuario en `progreso/{uid}/retos`.
- [x] Modo invitado: se puede jugar, pero no se guardan puntos ni racha.
- [ ] Notificación/recordatorio push del reto diario.
- [ ] Ranking o comparación entre usuarios.
- [ ] Validación de respuestas en servidor (hoy el banco se lee desde el cliente).
- [ ] Ampliar el banco de preguntas por categoría.

### Fase 2 — Cuenta, datos y seguridad

- [ ] Persistencia de sesión (`onAuthStateChanged` + AsyncStorage) y guard de rutas.
- [ ] Cerrar sesión y borrar datos locales.
- [ ] Recuperar contraseña (`sendPasswordResetEmail`).
- [ ] Perfil real: email, nombre, estadísticas calculadas.
- [x] Reglas de Realtime Database: lectura pública de `Comandos`, `contenidos` y `retos`; escritura autenticada; `Usuarios` protegido; `progreso/$uid` solo para su dueño. Verificado 2026-11-14.
- [ ] Firebase App Check.
- [ ] Mover configuración de Firebase a variables de entorno (`EXPO_PUBLIC_*`).
- [x] `google-service-account.json`: se conserva en disco por decisión del usuario; está ignorado por git y no se comparte.

### Fase 3 — Push de verdad

- [ ] Guardar tokens en la base (`tokens/{uid}`) al iniciar sesión.
- [ ] Enviar push a un usuario concreto (script o Cloud Function).
- [ ] Abrir el comando al tocar la notificación (deep link con Expo Router).
- [ ] Notificación al publicar un comando nuevo.
- [ ] Canal/tema por categoría y recordatorio programado.

### Fase 4 — UX y preparación del APK

- [ ] `KeyboardAvoidingView` en login + mostrar/ocultar contraseña.
- [ ] Validación de email y mensajes de error claros.
- [ ] Imagen local o `expo-image` con caché en Inicio (hoy depende de Unsplash).
- [ ] Icono, splash y nombre visibles coherentes con CyberVault.
- [ ] Accesibilidad: etiquetas, tamaños táctiles y contraste.
- [ ] Skeleton loaders / animaciones de entrada.
- [ ] Revisar `expo-doctor` y permisos Android antes de compilar.

### Fase 5 — Calidad e ingeniería

- [ ] ESLint + Prettier (`npx expo lint`, hay script pero falta configuración).
- [ ] Tests unitarios (Jest + Testing Library) para login, parseo y búsqueda.
- [ ] CI en GitHub Actions: tipos + lint + tests.
- [ ] EAS Update para correcciones OTA.
- [ ] Monitoreo de errores (Sentry).
- [ ] README real del proyecto (hoy es el de la plantilla).

### Fase 6 — Extras que suman

- [ ] Importar/exportar contenido (JSON/Markdown) y compartir.
- [ ] Notas personales por contenido.
- [ ] Etiquetas y historial de vistos.
- [ ] Modo offline con `expo-sqlite`.
- [ ] Reto diario con push (recordatorio).
- [ ] Ranking del reto diario.
- [ ] Bloqueo con biometría (`expo-local-authentication`).
- [ ] i18n (es/en).

### Modelo de datos aplicado (✅ 2026-11-14)

Nodo unificado `contenidos` para que una sola búsqueda cubra comandos y
estrategias. Ya está en producción: los 6 comandos originales se migraron y el
nodo `Comandos` se conserva como respaldo. Script: `node scripts/migrar-contenidos.mjs`.

```json
{
  "contenidos": {
    "C001": {
      "tipo": "comando",
      "titulo": "ip addr",
      "resumen": "Lista interfaces de red y direcciones IP.",
      "categoria": "NETWORKING",
      "plataformas": ["linux"],
      "cuerpo": "ip addr show",
      "ejemplo": "ip addr show eth0",
      "dificultad": "basico",
      "tags": ["red", "ip"],
      "riesgo": "bajo",
      "creadoPor": "uid",
      "creadoEn": 0,
      "actualizadoEn": 0
    },
    "E001": {
      "tipo": "estrategia",
      "titulo": "Enumeración de red interna",
      "resumen": "Descubrir hosts y servicios antes de explotar.",
      "categoria": "RECON",
      "plataformas": ["linux"],
      "pasos": [
        { "titulo": "Descubrir hosts", "comando": "arp-scan -l", "detalle": "..." }
      ],
      "dificultad": "intermedio",
      "tags": ["recon", "pivoting"],
      "creadoPor": "uid",
      "creadoEn": 0,
      "actualizadoEn": 0
    }
  }
}
```

Otros nodos previstos: `favoritos/{uid}/{id}`, `tokens/{uid}/{instalacion}` y
`usuarios/{uid}`.

### Reto diario: modelo aplicado (✅ 2026-11-14)

Banco de preguntas en `retos/{id}`:

```json
{
  "pregunta": "¿Qué comando muestra la tabla ARP en Windows?",
  "opciones": ["arp -a", "netstat -an", "ipconfig /all", "route print"],
  "correcta": 0,
  "explicacion": "arp -a lista las direcciones IP y MAC...",
  "categoria": "NETWORKING",
  "dificultad": "basico",
  "puntos": 10
}
```

Progreso por usuario en `progreso/{uid}/retos`:

```json
{
  "puntosTotales": 120,
  "racha": 3,
  "ultimaFecha": "2026-11-14",
  "hoy": {
    "fecha": "2026-11-14",
    "completado": true,
    "correctas": 5,
    "total": 5,
    "puntos": 70
  }
}
```

Reglas publicadas: `retos` es de lectura pública (el invitado puede jugar) y
escritura autenticada; `progreso/$uid` solo es accesible por su dueño
(`auth.uid == $uid`).

**Problemas corregidos en la migración** (nodo antiguo `Comandos`):

| ID | Problema | Estado |
| --- | --- | --- |
| C002 | Campo `descripción` (con tilde) → la app lo mostraba como `undefined` | ✅ corregido |
| C003 | Campo `descripción` (con tilde) → `undefined` | ✅ corregido |
| C004 | Campo `categeoria` (mal escrito) → categoría `undefined` | ✅ corregido |
| C005 | Campo `descripcio` (mal escrito) → descripción `undefined` | ✅ corregido |
| C0006 | Categoría `KALI` (distro, no categoría) | ✅ pasó a `SECURITY` con tag `kali` |
| C004 | `nmap -p 192.168.#.#` no era una sintaxis válida de nmap | ✅ ahora `nmap -p 22,80,443 192.168.1.10` |

Además, a todos se les añadió: comando ejecutable separado del nombre, plataforma,
dificultad, etiquetas, ejemplo y advertencia cuando aplica.

---

## 5. Checklist de entrega del APK

- [ ] `extra.eas.projectId` correcto en `app.json` (ya presente).
- [ ] Clave FCM V1 subida con `eas credentials` (ver `NOTIFICACIONES.md`).
- [ ] `npx expo-doctor` sin errores críticos.
- [ ] `npx eas build -p android --profile preview` termina correctamente.
- [ ] Instalar el APK en un dispositivo real y probar:
  - [ ] login / registro / invitado,
  - [ ] pestaña Buscar (no debe crashear),
  - [ ] categorías de Comandos y su buscador,
  - [ ] reto diario completo (puntos y racha se guardan al iniciar sesión),
  - [ ] lectura de comandos desde Firebase,
  - [ ] notificación local,
  - [ ] push real recibido.

---

## 6. Registro de cambios

| Fecha | Cambio |
| --- | --- |
| 2026-11-14 | Fase 0: git recuperado (`main` con la versión final), crash de Buscar corregido, safe area en todas las pantallas, handler de push global, limpieza y verificación de tipos. |
| 2026-11-14 | Reglas de Firebase aplicadas y verificadas (raíz y `Usuarios` en 401, `Comandos` público para invitado). Detectados 4 campos mal escritos en la base y propuesto el modelo `contenidos`. |
| 2026-11-14 | Migración a `contenidos`: 6 comandos normalizados (typos, sintaxis de nmap, plataforma, dificultad, tags, riesgo). Regla pública de `contenidos` publicada. App leyendo `contenidos` y búsqueda real funcionando. |
| 2026-11-14 | Reto diario: 31 preguntas cargadas en `retos`, reglas de `retos` y `progreso/$uid` publicadas, pestaña Retos sustituye a Notas, inicio introductorio, comandos por categorías con buscador propio. |
| 2026-11-14 | Paleta verde bosque aplicada en Inicio, Comandos, Retos, Buscar, Perfil, detalle de categoría y login. Push queda intacto; rojo de error y ámbar de advertencia se mantienen por semántica. |
| 2026-11-14 | Importados 51 contenidos nuevos y actualizado Hydra: 57 contenidos en 10 categorías. Se corrigieron placeholders perdidos al pegar (`<IP>`, `<WORDLIST>`, etc.) y dos títulos inexactos (Gobuster y Curl). |
| 2026-11-14 | Pantalla de detalle `/contenido/[id]` con metadatos, pasos de estrategia, nota y referencias. Copiado al portapapeles (`expo-clipboard`) en comando, ejemplo y pasos. Las tarjetas de categoría y los resultados de búsqueda ahora abren el detalle. |
| 2026-11-14 | CRUD de contenidos: formulario `/contenido/editar` (crear y editar, con pasos para estrategias) y eliminación con confirmación desde el detalle. Botón `+` en Comandos. Escrituras solo con sesión iniciada (regla `auth != null`). |

---

## 7. Notas y decisiones

- **No cambiar el `slug` (`PrimeraAppMovil`)** de `app.json`: está vinculado al
  proyecto EAS y al package Android `com.primeraappmovil.lem`.
- El nombre visible sí puede cambiarse a "CyberVault" sin afectar el build.
- `google-services.json` debe seguir en la raíz (lo usa el build Android).
- `google-service-account.json` es **secreto**: nunca debe subirse al repo.
- La app está pensada **solo para móvil** (Android primero). La build web existe
  por defecto en Expo pero no es un objetivo del proyecto.
- **Flujo de trabajo:** probar siempre en local con **Expo Go** (`npx expo start`)
  y compilar el APK con EAS solo cuando la funcionalidad esté cerrada.
- En Expo Go **no** funcionan los push remotos de Android (es una limitación de
  Expo Go, no un fallo de la app); las notificaciones locales sí funcionan.
- El nodo `Comandos` se conserva como respaldo de la migración. Se puede borrar
  cuando la app lleve un tiempo funcionando con `contenidos`.
- El reto diario usa la **fecha local del dispositivo** (`YYYY-MM-DD`). Si el
  usuario cambia la hora del teléfono puede repetir el reto; para una versión
  seria habría que validar en servidor.
- La pestaña **Notas** se eliminó: su hueco lo ocupa **Retos**. Las notas
  personales quedan como extra futuro dentro del detalle de cada contenido.
- **Paleta oficial** (todos los tabs excepto Push): negro `#050805` como base,
  `#61CF5A` (acción primaria), `#63AD58` (texto secundario), `#50864C` (texto
  apagado), `#3E6A3D` (bordes) y `#3B4B33` (bordes suaves/fondos discretos).
  El rojo de error y el ámbar de advertencia se conservan por significado.
  Push mantiene su paleta anterior por decisión del usuario.

---

## 8. Reglas de trabajo

Estas reglas aplican a todas las fases del proyecto y están replicadas en
`AGENTS.md`.

1. **Aprobar antes de commit y merge.** Al terminar una fase o un cambio
   importante, el agente se detiene y **pregunta al usuario** antes de:
   - Hacer el commit en la rama correspondiente.
   - Fusionar (`merge`) a `main`.
   - Hacer `push` al remoto.

   No se asume la aprobación: se propone el mensaje de commit, la rama y el plan,
   y se espera confirmación explícita.

2. **Ramas.**
   - `main` siempre estable y compilable.
   - `feat/...`, `fix/...`, `docs/...`, `chore/...` según el tipo de cambio.
   - Antes de fusionar: `npx tsc --noEmit` debe pasar.

3. **Documentación viva.** Mantener este archivo actualizado al final de cada
   fase (qué se hizo, qué falta, decisiones y problemas).

4. **Contenido y datos.** El contenido lo aporta el usuario. Antes de cambiar o
   añadir datos en Firebase, consultar. El agente no inventa contenido.

5. **Verificación.** `npx tsc --noEmit` antes de cerrar una fase; probar en Expo
   Go antes de compilar el APK; nunca subir secretos.

6. **Estilo visual.** Paleta oficial en todos los tabs excepto Push.

---

## 9. Cómo mover el proyecto a otra computadora

El código está en GitHub y la configuración de Firebase/EAS necesaria para
compilar ya está versionada. La clave de servicio (`google-service-account.json`)
es secreta y **no** se versiona.

### Lo que viaja en el repositorio

| Archivo | ¿Versionado? | Para qué |
| --- | --- | --- |
| Todo `src/`, `scripts/`, configuración | ✅ | Código de la app y scripts de datos |
| `google-services.json` | ✅ | Build Android (Firebase) |
| `src/firebaseconfig.js` | ✅ | Config del cliente Firebase |
| `package-lock.json` | ✅ | Instalación reproducible (`npm ci`) |
| `google-service-account.json` | ❌ (ignorado) | Solo para scripts de admin de la BD |

### Pasos en la computadora nueva

1. **Instalar requisitos**
   - [Git](https://git-scm.com/downloads)
   - [Node.js LTS](https://nodejs.org/) (18, 20 o 22 LTS; se recomienda LTS, no la
     última versión de desarrollo)
   - App **Expo Go** en el teléfono (Android/iOS) para probar.

2. **Clonar el repositorio**

   ```powershell
   git clone https://github.com/Lemonsszz/PrimeraAppMovil.git
   cd PrimeraAppMovil
   ```

3. **Instalar dependencias exactas**

   ```powershell
   npm ci
   ```

4. **Verificar que compila**

   ```powershell
   npx tsc --noEmit
   ```

5. **Arrancar en desarrollo**

   ```powershell
   npx expo start
   ```

   Escanear el QR con Expo Go (el teléfono y la computadora deben estar en la
   misma red Wi-Fi). Si la red lo bloquea:

   ```powershell
   npx expo start --tunnel
   ```

6. **Probar la app.** Debe cargar los 57 contenidos y los retos desde Firebase
   sin pasos extra: la configuración pública ya está en el repo.

### Solo si se van a ejecutar los scripts de datos

Los scripts (`datos:importar`, `datos:retos`, `datos:reglas`, etc.) usan una
cuenta de servicio con permisos de administrador. En la computadora nueva hay que
crear `google-service-account.json` en la raíz con la clave descargada desde
Firebase Console → Configuración del proyecto → Cuentas de servicio. **Ese
archivo nunca se comparte ni se sube al repo.**

Sin ese archivo la app funciona igual; solo fallan los scripts que escriben en la
base de datos.

### Para compilar el APK en la computadora nueva

```powershell
npx eas-cli login
npx eas-cli build -p android --profile preview
```

Se necesita una cuenta con acceso al proyecto EAS
(`8cc98c1e-11e7-48f5-bc72-c97e08fe30f2`). El build se ejecuta en la nube de EAS,
así que no hace falta Android Studio.

### Si se copia la carpeta por USB en vez de clonar

Copiar todo **excepto** `node_modules/` y `.expo/` (se regeneran). Luego:

```powershell
npm ci
npx expo start
```

No copiar `google-service-account.json` a menos que sea necesario y de confianza.

