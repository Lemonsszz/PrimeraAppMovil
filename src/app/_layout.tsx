import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#050805' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
