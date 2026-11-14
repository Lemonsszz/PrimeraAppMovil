import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Registra el handler de notificaciones una sola vez al arrancar la app,
// para que los push se muestren aunque el usuario no abra la pestaña Push.
import '../notifications';
import { urlDeNotificacion } from '../notifications';
import { usePushToken } from '../hooks/use-push-token';

/**
 * Abre la pantalla indicada en `data.url` cuando el usuario toca una
 * notificación (con la app cerrada, en segundo plano o abierta).
 */
function useNotificacionAbierta() {
  useEffect(() => {
    const abrir = (notificacion: Notifications.Notification) => {
      const url = urlDeNotificacion(notificacion);
      if (url) router.push(url as never);
    };

    // Notificación que abrió la app desde cero.
    Notifications.getLastNotificationResponseAsync()
      .then((respuesta) => {
        if (!respuesta?.notification) return;
        abrir(respuesta.notification);
        return Notifications.clearLastNotificationResponseAsync();
      })
      .catch(() => {});

    // Notificación tocada con la app viva.
    const suscripcion = Notifications.addNotificationResponseReceivedListener(
      (respuesta) => abrir(respuesta.notification)
    );

    return () => suscripcion.remove();
  }, []);
}

export default function RootLayout() {
  useNotificacionAbierta();
  usePushToken();

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#050805' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="categoria/[categoria]" />
        <Stack.Screen name="contenido/[id]" />
        <Stack.Screen name="contenido/editar" />
      </Stack>
    </SafeAreaProvider>
  );
}
