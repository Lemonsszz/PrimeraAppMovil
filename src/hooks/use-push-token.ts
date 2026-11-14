import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import {
  getPushTokensAsync,
  pushRemotoDisponible,
} from '../notifications';
import { useUsuario } from '../services/auth';
import { guardarTokenPush } from '../services/tokens';

/**
 * Registra el token de push del dispositivo en `tokens/{uid}` al iniciar
 * sesión y lo vuelve a guardar si el servicio de push lo renueva.
 *
 * En Expo Go (Android) el push remoto no está disponible: se omite en silencio.
 */
export function usePushToken() {
  const { uid } = useUsuario();

  useEffect(() => {
    if (!uid) return;

    const { disponible } = pushRemotoDisponible();
    if (!disponible) return;

    let cancelado = false;

    const registrar = async () => {
      try {
        const tokens = await getPushTokensAsync();
        if (cancelado) return;
        if (tokens.expoPushToken || tokens.fcmToken) {
          await guardarTokenPush(uid, tokens);
        }
      } catch {
        // Sin conexión o sin permisos: no bloquea el arranque de la app.
      }
    };

    registrar();

    const suscripcion = Notifications.addPushTokenListener(async (token) => {
      if (cancelado) return;

      try {
        await guardarTokenPush(uid, {
          expoPushToken: null,
          fcmToken: String(token.data),
          error: null,
        });
      } catch {
        // Se reintentará en el próximo arranque.
      }
    });

    return () => {
      cancelado = true;
      suscripcion.remove();
    };
  }, [uid]);
}
