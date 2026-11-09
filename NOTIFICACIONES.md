# Notificaciones push (FCM V1) + APK — PrimeraAppMovil

Todo lo que se podía dejar listo desde el código ya está hecho. Abajo está lo que
falta (depende de tu cuenta de Expo) y cómo comprobar que funciona.

---

## 0. Corrección de esta reconstrucción (importante)

El APK anterior se cerraba al entrar a **Sitemap** porque el último commit
renombró `src/app/index.tsx` → `src/app/inicio.tsx` y **la app quedó sin ruta
raíz `/`**. Expo Router mostraba la pantalla de "rutas no encontradas" (de ahí se
entraba a Sitemap) y esa pantalla no existe en el build de producción → crash.

Se corrigió así:

- `src/app/index.tsx` → redirige a `/login` (ya existe la ruta `/`).
- `src/app/+not-found.tsx` → cualquier ruta inválida vuelve al inicio (nunca más
  la pantalla de error/Sitemap).
- `src/app/_layout.tsx` → ahora es un **Stack** (login fuera de las pestañas).
- Las pestañas se movieron a `src/app/(tabs)/` con su propio `_layout.tsx`.
- `login.tsx` tiene un botón **ENTRAR COMO INVITADO** para poder probar las
  notificaciones sin crear cuenta.

---

## 1. Lo que ya quedó configurado

| Cosa | Estado |
| --- | --- |
| App Android creada en Firebase (`aplicaciones-mo-p`) | ✅ `PrimeraAppMovil` — package `com.primeraappmovil.lem` |
| `google-services.json` en la raíz | ✅ generado desde Firebase |
| `google-service-account.json` (clave FCM V1) | ✅ generado (secreto, ignorado por git) |
| Rol `Firebase Cloud Messaging API Admin` al service account | ✅ asignado |
| `app.json` → `android.package` + `googleServicesFile` | ✅ |
| Plugin `expo-notifications` en `app.json` | ✅ |
| `eas.json` con perfil `preview` que genera **APK** | ✅ |
| Pantalla **Notificaciones** con tokens y botón de prueba | ✅ `src/app/notificaciones.tsx` |
| Dependencias `expo-notifications`, `expo-constants`, `firebase` | ✅ declaradas en `package.json` |

> ⚠️ `google-service-account.json` contiene una **clave privada**. Ya está en
> `.gitignore`; no lo subas a GitHub ni lo compartas. Cuando termines de subirlo
> a EAS puedes borrarlo del disco.

---

## 2. Lo que falta (hazlo tú, son 4 comandos)

### 2.1 Iniciar sesión en Expo

```powershell
npx eas login
```

Usa la cuenta con la que vas a entregar el trabajo.

### 2.2 Crear/vincular el proyecto en EAS

```powershell
npx eas init
```

- Si pregunta **"Would you like to create a project?"** → `Yes`.
- Esto escribe `extra.eas.projectId` en `app.json`. **Sin ese dato el token de
  Expo no se genera.**

### 2.3 Subir la clave de Firebase a EAS (esto es lo del PDF)

```powershell
npx eas credentials
```

Responde exactamente así:

1. `Android`
2. `production`
3. `Google Service Account`
4. `Manage your Google Service Account Key for Push Notifications (FCM V1)`
5. `Set up a Google Service Account Key for Push Notifications (FCM V1)`
6. `Upload a new service account key`
7. Cuando detecte `google-service-account.json` → `Y`

Al final debe mostrar el **Project ID `aplicaciones-mo-p`** y el correo
`firebase-adminsdk-fbsvc@aplicaciones-mo-p.iam.gserviceaccount.com`.

> La clave FCM se guarda a nivel del proyecto (no del perfil), así que sirve
> para el build `preview`. Si el push no llega, repite este paso eligiendo el
> perfil `preview`.

### 2.4 Compilar el APK

```powershell
npx eas build -p android --profile preview
```

- Si pregunta por el keystore → `Yes` (que lo genere EAS).
- Tarda ~10–20 min.
- Al terminar te da un enlace de descarga `.apk`.

---

## 3. Cómo comprobarlo (en orden)

### Nivel 1 — Configuración (sin celular)

```powershell
npx expo config --type prebuild | Select-String "package|googleServicesFile"
npx expo-doctor
```

Debe aparecer `com.primeraappmovil.lem` y `./google-services.json`.

### Nivel 2 — Notificación local (no necesita internet ni FCM)

1. Instala el APK en el celular.
2. Abre la pestaña **Notificaciones**.
3. Acepta el permiso de notificaciones.
4. Toca **PROBAR NOTIFICACIÓN LOCAL**.
5. A los 3 segundos debe salir la notificación "¡Notificación de prueba!".

Si esto falla, el problema es de permisos/canal, no de Firebase.

### Nivel 3 — Tokens

En la misma pestaña deben aparecer:

- **EXPO PUSH TOKEN**: algo como `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`
- **FCM TOKEN (NATIVO)**: una cadena larga tipo `dK3...:APA91b...`
- Estado en verde: **CONECTADO**

Si el FCM token sale vacío, el `google-services.json` no entró en el build.

### Nivel 4 — Push real (la prueba de la clase)

1. Copia el **EXPO PUSH TOKEN**.
2. Entra a <https://expo.dev/notifications> con tu cuenta.
3. Pega el token, escribe título y mensaje, y envía.
4. Cierra la app (o mándala a segundo plano) para ver la notificación en la
   bandeja del celular.

También puedes hacerlo por consola:

```powershell
$body = @{
  to    = "ExponentPushToken[TU_TOKEN_AQUI]"
  title = "Prueba push"
  body  = "Notificación enviada desde Expo"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://exp.host/--/api/v2/push/send" `
  -Method Post -ContentType "application/json" -Body $body
```

Si responde `{"data":{"status":"ok"}}` el envío salió. Si responde
`DeviceNotRegistered` el token cambió (vuelve a abrir la app y copia el nuevo).

---

## 4. Problemas típicos

| Síntoma | Causa / solución |
| --- | --- |
| `Falta el projectId de EAS` | No corriste `npx eas init` o no recompilaste después. |
| FCM token vacío | `google-services.json` ausente o con otro package. |
| `403 PERMISSION_DENIED` al pedir token | La API key de `google-services.json` está restringida. Déjala sin restricción de apps o agrega el SHA-1 de EAS. |
| No llega el push pero el token existe | Falta subir la clave FCM V1 con `eas credentials` (paso 2.3). |
| En Expo Go no funciona | Es normal: los push remotos en Android requieren el APK compilado. |

---

## 5. Checklist de entrega

- [ ] `npx eas init` hecho (`extra.eas.projectId` en `app.json`)
- [ ] Clave FCM V1 subida con `eas credentials`
- [ ] `npx eas build -p android --profile preview` terminado
- [ ] APK instalado en el celular
- [ ] Notificación local probada
- [ ] Expo push token visible en la pestaña Notificaciones
- [ ] Push enviado desde expo.dev/notifications recibido
- [ ] APK subido a la plataforma del curso
