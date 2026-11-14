# PROGRESO — CyberVault_ (PrimeraAppMovil)

> Documento vivo del proyecto. Aquí se registran las fases, lo que ya está hecho
> y lo que falta. Actualizar al final de cada sesión de trabajo.
>
> **Última actualización:** 2026-11-14
> **Rama de trabajo:** `main`
> **Meta final:** APK Android funcional (EAS Build, perfil `preview`).

---

## 1. Objetivo del proyecto

App móvil estilo terminal (estética CyberVault: negro + verde `#00FF88`) para
**guardar, organizar, buscar y consultar comandos de ciberseguridad**
(Linux, Windows, Redes, Seguridad, Recon), con:

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
```

---

## 3. Estado general

| Área | Estado |
| --- | --- |
| Login / registro con Firebase Auth | ✅ Funciona |
| Lectura de comandos (Realtime DB) | ✅ Funciona |
| Notificaciones locales y tokens | ✅ Funciona |
| Navegación por pestañas | ✅ Funciona |
| Búsqueda real de comandos | 🟡 UI lista, falta lógica |
| Crear / editar / borrar comandos | ⛔ No existe |
| Favoritos / perfil real | ⛔ Maqueta |
| Persistencia de sesión / logout | ⛔ No existe |
| Reglas de seguridad de Firebase | ⚠️ Pendiente de verificar |
| APK de entrega | 🟡 Configurado, pendiente de compilar |

---

## 4. Fases

### Fase 0 — Orden y estabilidad (✅ completada 2026-11-14)

- [x] **Git recuperado.** El commit final (`29bf916`) estaba en *detached HEAD* y
      `main` apuntaba a una rama vieja. Se creó la rama `final-notificaciones`,
      se fusionó el histórico de `main` conservando la versión final y `main`
      quedó al día.
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

### Fase 1 — Funcionalidad core de comandos (🔜 siguiente)

- [ ] Modelo de datos tipado: `Comando { id, nombre, categoria, descripcion, comando, plataforma, tags }`.
- [ ] Pantalla de detalle `/comando/[id]` (comando completo, explicación, plataforma).
- [ ] Botón **copiar al portapapeles** (`expo-clipboard`).
- [ ] Crear comando desde Inicio (el botón hoy no hace nada).
- [ ] Editar y eliminar comandos.
- [ ] Búsqueda real en vivo (nombre, categoría, descripción).
- [ ] Filtro por categoría desde la pestaña Categorías/Notas.
- [ ] Favoritos (`favoritos/{uid}/{comandoId}`).
- [ ] Estados de UI: cargando, vacío, error y reintento.

### Fase 2 — Cuenta, datos y seguridad

- [ ] Persistencia de sesión (`onAuthStateChanged` + AsyncStorage) y guard de rutas.
- [ ] Cerrar sesión y borrar datos locales.
- [ ] Recuperar contraseña (`sendPasswordResetEmail`).
- [ ] Perfil real: email, nombre, estadísticas calculadas.
- [ ] Reglas de Realtime Database (lectura pública, escritura solo autenticada, validación de campos).
- [ ] Firebase App Check.
- [ ] Mover configuración de Firebase a variables de entorno (`EXPO_PUBLIC_*`).
- [ ] Rotar/eliminar `google-service-account.json` del disco (ya subido a EAS).

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

- [ ] Importar/exportar comandos (JSON/Markdown) y compartir.
- [ ] Notas personales por comando.
- [ ] Etiquetas y historial de vistos.
- [ ] Modo offline con `expo-sqlite`.
- [ ] Reto diario con push.
- [ ] Bloqueo con biometría (`expo-local-authentication`).
- [ ] i18n (es/en).

---

## 5. Checklist de entrega del APK

- [ ] `extra.eas.projectId` correcto en `app.json` (ya presente).
- [ ] Clave FCM V1 subida con `eas credentials` (ver `NOTIFICACIONES.md`).
- [ ] `npx expo-doctor` sin errores críticos.
- [ ] `npx eas build -p android --profile preview` termina correctamente.
- [ ] Instalar el APK en un dispositivo real y probar:
  - [ ] login / registro / invitado,
  - [ ] pestaña Buscar (no debe crashear),
  - [ ] lectura de comandos desde Firebase,
  - [ ] notificación local,
  - [ ] push real recibido.

---

## 6. Registro de cambios

| Fecha | Cambio |
| --- | --- |
| 2026-11-14 | Fase 0: git recuperado (`main` con la versión final), crash de Buscar corregido, safe area en todas las pantallas, handler de push global, limpieza y verificación de tipos. |

---

## 7. Notas y decisiones

- **No cambiar el `slug` (`PrimeraAppMovil`)** de `app.json`: está vinculado al
  proyecto EAS y al package Android `com.primeraappmovil.lem`.
- El nombre visible sí puede cambiarse a "CyberVault" sin afectar el build.
- `google-services.json` debe seguir en la raíz (lo usa el build Android).
- `google-service-account.json` es **secreto**: nunca debe subirse al repo.
- La app está pensada **solo para móvil** (Android primero). La build web existe
  por defecto en Expo pero no es un objetivo del proyecto.
