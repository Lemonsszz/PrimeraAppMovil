import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appbar } from 'react-native-paper';
export default function Categorias() {
  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />
      <Appbar.Header style={styles.categoria}>
        <Appbar.Content title="Semestre"></Appbar.Content>
      </Appbar.Header>
      <View style={styles.header}>
        <Text style={styles.logo}>SEMESTRE</Text>
        <Text style={styles.subtitulo}>6TO SEMESTRE</Text>
      </View>

      <TouchableOpacity style={styles.categoria}>
        <Ionicons style={styles.icono}
          name="logo-rss"
          size={40}
          color="#00FF88"
        />

        <View style={styles.informacion}>
          <Text style={styles.nombre}>PARALELO</Text>
          <Text style={styles.descripcion}>
            Perteneciente al Paralelo "B"
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
          <Text style={styles.nombre}>GESTION</Text>
          <Text style={styles.descripcion}>
            Gestión: 2026 - 2do Periodo Académico
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
          <Text style={styles.nombre}>TURNO</Text>
          <Text style={styles.descripcion}>
            Pasando clases en turno tarde
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
          <Text style={styles.nombre}>NÚMERO DE MATERIAS</Text>
          <Text style={styles.descripcion}>
            Cuenta con: 6         </Text>
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
    backgroundColor: '#49815f',
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
    color: '#02371b',
    fontSize: 12,
    marginTop: 4,
  },
});