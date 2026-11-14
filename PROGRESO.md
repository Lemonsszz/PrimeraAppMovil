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
node scripts/seed-retos.mjs          # cargar/actualizar el banco de retos
node scripts/reglas-firebase.mjs     # publicar reglas (contenidos, retos, progreso)
```

---

## 3. Estado general

| Área | Estado |
| --- | --- |
| Login / registro con Firebase Auth | ✅ Funciona |
| Modelo unificado `contenidos` | ✅ Migrado y normalizado (2026-11-14) |
| Lectura de contenidos (Realtime DB) | ✅ Funciona |
| Notificaciones locales y tokens | ✅ Funciona |
| Navegación por pestañas | ✅ Funciona (Inicio, Push, Comandos, Retos, Buscar, Perfil) |
| Búsqueda real (título, resumen, categoría, tags) | ✅ Funciona |
| Inicio introductorio con accesos directos | ✅ Funciona |
| Comandos agrupados por categoría + buscador por categoría | ✅ Funciona |
| Reto diario (preguntas, puntos y racha) | ✅ Funciona (31 preguntas) |
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
- [ ] Pantalla de detalle `/contenido/[id]`: comando completo, explicación, plataforma, ejemplo, referencias y pasos (si es estrategia).
- [ ] Botón **copiar al portapapeles** (`expo-clipboard`).
- [ ] Crear contenido desde la app (hoy se carga con scripts).
- [ ] Editar y eliminar contenido.
- [x] **Búsqueda real en vivo** sobre título, resumen, categoría, plataforma y etiquetas.
- [x] **Comandos organizados por tarjetas de categoría** con contador y descripción.
- [x] **Pantalla de categoría** (`/categoria/[categoria]`) con su propio buscador.
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

