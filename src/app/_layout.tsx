import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  
  return (

    
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00FF88',
        tabBarInactiveTintColor: '#526158',
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
        name="Nombre"
        options={{
          title: 'Nombre',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="reels"
        options={{
          title: 'Carrera',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Semestre',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="clipboard"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Materia',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}