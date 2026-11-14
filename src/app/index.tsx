import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useUsuario } from '../services/auth';

/**
 * Ruta raíz "/": si ya hay sesión iniciada entra directo a Inicio; si no,
 * al login. Mientras Firebase confirma el estado de sesión se muestra un
 * indicador para evitar el parpadeo login → inicio.
 */
export default function Index() {
  const { uid, cargando } = useUsuario();

  if (cargando) {
    return (
      <View style={styles.contenedor}>
        <ActivityIndicator color="#61CF5A" size="large" />
      </View>
    );
  }

  return <Redirect href={uid ? '/inicio' : '/login'} />;
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
