import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#00FF88',
        tabBarInactiveTintColor: '#526158',
        tabBarLabelStyle: { fontSize: 10 },

        tabBarStyle: {
          height: 70,
          paddingTop: 5,
          paddingBottom: 5,
          backgroundColor: '#080D0A',
          borderTopColor: '#123D29',
        },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="terminal-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="notificaciones"
        options={{
          title: 'Push',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="comandos"
        options={{
          title: 'Comandos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="code-slash-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="notas"
        options={{
          title: 'Notas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
