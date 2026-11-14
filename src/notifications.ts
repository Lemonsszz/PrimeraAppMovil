import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Canal por defecto para Android. Debe coincidir con el `defaultChannel`
 * configurado en el plugin de expo-notifications dentro de app.json.
 */
export const NOTIFICATION_CHANNEL_ID = 'default';

/** Clave local donde se guarda el ID del recordatorio diario programado. */
const CLAVE_RECORDATORIO = 'cybervault:recordatorioDiario';

/** Hora por defecto del recordatorio del reto diario (19:00 local). */
export const HORA_RECORDATORIO = 19;

/**
 * Mientras la app esta abierta (foreground), las notificaciones no se muestran
 * solas: este handler decide que hacer cuando llega una.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushTokens = {
  expoPushToken: string | null;
  fcmToken: string | null;
  error: string | null;
};

/**
 * El projectId de EAS es obligatorio para pedir el ExpoPushToken.
 * Lo escribe `eas init` en app.json -> expo.extra.eas.projectId.
 */
export function getProjectId(): string | undefined {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as { easConfig?: { projectId?: string } })?.easConfig?.projectId
  );
}

/**
 * Indica si el push remoto puede funcionar en este entorno. En Expo Go para
 * Android no hay soporte de push remoto desde SDK 53; hace falta el APK o un
 * development build.
 */
export function pushRemotoDisponible(): { disponible: boolean; motivo: string | null } {
  if (Platform.OS === 'web') {
    return {
      disponible: false,
      motivo: 'Las notificaciones push solo funcionan en Android/iOS.',
    };
  }

  const esExpoGo = Constants.executionEnvironment === 'storeClient';

  if (Platform.OS === 'android' && esExpoGo) {
    return {
      disponible: false,
      motivo:
        'Expo Go no admite push remoto en Android. Instala el APK o un development build para probarlo.',
    };
  }

  return { disponible: true, motivo: null };
}

/**
 * Crea el canal (necesario en Android 13+ para que salga el dialogo de
 * permisos), pide permisos y devuelve si fueron concedidos.
 */
export async function ensureNotificationPermissionsAsync(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Notificaciones',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00FF88',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let status = existingStatus;

  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }

  return status === 'granted';
}

/**
 * Obtiene los dos tokens:
 *  - expoPushToken: se usa con el servicio de push de Expo (el mas facil de probar).
 *  - fcmToken: token nativo de Firebase Cloud Messaging.
 */
export async function getPushTokensAsync(): Promise<PushTokens> {
  if (Platform.OS === 'web') {
    return {
      expoPushToken: null,
      fcmToken: null,
      error: 'Las notificaciones push solo funcionan en Android/iOS.',
    };
  }

  const granted = await ensureNotificationPermissionsAsync();
  if (!granted) {
    return {
      expoPushToken: null,
      fcmToken: null,
      error: 'Permiso de notificaciones denegado. Actívalo en los ajustes del sistema.',
    };
  }

  let expoPushToken: string | null = null;
  let fcmToken: string | null = null;
  const errors: string[] = [];

  const projectId = getProjectId();

  try {
    if (!projectId) {
      throw new Error(
        'Falta el projectId de EAS. Ejecuta "eas init" y vuelve a compilar.'
      );
    }
    expoPushToken = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;
  } catch (error) {
    errors.push(`Expo token: ${String(error)}`);
  }

  try {
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    fcmToken = String(deviceToken.data);
  } catch (error) {
    errors.push(`FCM token: ${String(error)}`);
  }

  return {
    expoPushToken,
    fcmToken,
    error: errors.length > 0 ? errors.join('\n') : null,
  };
}

/** Notificacion local para comprobar que el permiso y el canal funcionan. */
export async function scheduleLocalTestNotificationAsync(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Notificación de prueba!',
      body: 'Si ves esto, las notificaciones de PrimeraAppMovil funcionan.',
      data: { url: '/notificaciones', pantalla: 'notificaciones', origen: 'local' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: NOTIFICATION_CHANNEL_ID,
    },
  });
}

/**
 * Programa un recordatorio diario para el reto. Solo puede haber uno activo:
 * se cancela el anterior antes de programar el nuevo.
 */
export async function programarRecordatorioDiarioAsync(
  hora: number = HORA_RECORDATORIO,
  minuto: number = 0
): Promise<string> {
  const concedido = await ensureNotificationPermissionsAsync();

  if (!concedido) {
    throw new Error('Permiso de notificaciones denegado.');
  }

  await cancelarRecordatorioDiarioAsync();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Tu reto diario te espera',
      body: 'Completa las 5 preguntas de hoy y mantén tu racha.',
      data: { url: '/retos', pantalla: 'retos', origen: 'recordatorio' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hora,
      minute: minuto,
      channelId: NOTIFICATION_CHANNEL_ID,
    },
  });

  await AsyncStorage.setItem(CLAVE_RECORDATORIO, id);
  return id;
}

/** Cancela el recordatorio diario si estaba programado. */
export async function cancelarRecordatorioDiarioAsync(): Promise<void> {
  const id = await AsyncStorage.getItem(CLAVE_RECORDATORIO);

  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await AsyncStorage.removeItem(CLAVE_RECORDATORIO);
  }
}

/** True si el recordatorio diario está programado en este dispositivo. */
export async function recordatorioDiarioActivo(): Promise<boolean> {
  const id = await AsyncStorage.getItem(CLAVE_RECORDATORIO);

  if (!id) return false;

  const programadas = await Notifications.getAllScheduledNotificationsAsync();
  return programadas.some((notificacion) => notificacion.identifier === id);
}

/** Extrae la ruta interna (`data.url`) de una notificación. */
export function urlDeNotificacion(
  notificacion: Notifications.Notification
): string | null {
  const data = notificacion.request.content.data;
  const url = data && typeof data.url === 'string' ? data.url : '';
  return url.startsWith('/') ? url : null;
}
