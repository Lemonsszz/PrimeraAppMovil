import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Registra el handler de notificaciones una sola vez al arrancar la app,
// para que los push se muestren aunque el usuario no abra la pestaña Push.
import '../notifications';

export default function RootLayout() {
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
      </Stack>
    </SafeAreaProvider>
  );
}
