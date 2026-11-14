import { Platform } from 'react-native';
import { onValue, ref, remove, set } from 'firebase/database';

import { database } from '../firebaseconfig';
import type { PushTokens } from '../notifications';

export type TokenGuardado = {
  expoPushToken: string | null;
  fcmToken: string | null;
  plataforma: string;
  actualizadoEn: number | null;
};

const texto = (valor: unknown): string =>
  typeof valor === 'string' ? valor.trim() : '';

/**
 * Guarda los tokens del dispositivo en `tokens/{uid}` para que un script o
 * Cloud Function pueda enviar push a ese usuario. Requiere sesión iniciada.
 */
export async function guardarTokenPush(
  uid: string,
  tokens: PushTokens
): Promise<boolean> {
  const expoPushToken = tokens.expoPushToken?.trim() ?? '';
  const fcmToken = tokens.fcmToken?.trim() ?? '';

  if (!expoPushToken && !fcmToken) return false;

  await set(ref(database, `tokens/${uid}`), {
    expoPushToken: expoPushToken || null,
    fcmToken: fcmToken || null,
    plataforma: Platform.OS,
    actualizadoEn: Date.now(),
  });

  return true;
}

/** Escucha el token guardado del usuario (útil para la pestaña Push). */
export function subscribeTokenPush(
  uid: string,
  onData: (token: TokenGuardado | null) => void,
  onError?: (error: Error) => void
): () => void {
  return onValue(
    ref(database, `tokens/${uid}`),
    (snapshot) => {
      const raw = snapshot.val() as Record<string, unknown> | null;

      if (!raw) {
        onData(null);
        return;
      }

      onData({
        expoPushToken: texto(raw.expoPushToken) || null,
        fcmToken: texto(raw.fcmToken) || null,
        plataforma: texto(raw.plataforma),
        actualizadoEn:
          typeof raw.actualizadoEn === 'number' ? raw.actualizadoEn : null,
      });
    },
    (error) => onError?.(error as Error)
  );
}

/** Borra el token del usuario (al cerrar sesión o si el token ya no sirve). */
export async function borrarTokenPush(uid: string): Promise<void> {
  await remove(ref(database, `tokens/${uid}`));
}
