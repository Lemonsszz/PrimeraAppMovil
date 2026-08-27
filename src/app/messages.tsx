import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Categorias() {
  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>$ CATEGORIES_</Text>
        <Text style={styles.subtitulo}>ORGANIZA TUS COMANDOS</Text>
      </View>

      <TouchableOpacity style={styles.categoria}>
        <Ionicons style={styles.icono}
          name="logo-rss"
          size={40}
          color="#00FF88"
        />

        <View style={styles.informacion}>
          <Text style={styles.nombre}>NETWORKING</Text>
          <Text style={styles.descripcion}>
            Redes y administración de conexiones
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.categoria}>
        <Ionicons style={styles.icono}
          name="logo-tux"
          size={40}
          color="#00FF88"
        />
        <View style={styles.informacion}>
          <Text style={styles.nombre}>LINUX</Text>
          <Text style={styles.descripcion}>
            Comandos y herramientas de Linux
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.categoria}>
        <Ionicons style={styles.icono}
          name="logo-windows"
          size={40}
          color="#00FF88"
        />

        <View style={styles.informacion}>
          <Text style={styles.nombre}>WINDOWS</Text>
          <Text style={styles.descripcion}>
            Administración del sistema Windows
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.categoria}>
        <Ionicons style={styles.icono}
          name="lock-closed"
          size={40}
          color="#00FF88"
        />

        <View style={styles.informacion}>
          <Text style={styles.nombre}>SECURITY</Text>
          <Text style={styles.descripcion}>
            Comandos relacionados con seguridad
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.categoria}>
        <Ionicons style={styles.icono}
          name="shield-checkmark"
          size={40}
          color="#00FF88"
        />

        <View style={styles.informacion}>
          <Text style={styles.nombre}>RECON</Text>
          <Text style={styles.descripcion}>
            Información y reconocimiento de sistemas
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  header: {
    marginBottom: 25,
  },

  logo: {
    color: '#00FF88',
    fontSize: 26,
    fontWeight: '900',
  },

  subtitulo: {
    color: '#526158',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 5,
  },

  categoria: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },

  icono: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '900',
    marginRight: 15,
  },

  informacion: {
    flex: 1,
  },

  nombre: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },

  descripcion: {
    color: '#718078',
    fontSize: 12,
    marginTop: 4,
  },
});