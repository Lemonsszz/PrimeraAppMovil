import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Comandos() {


  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>$ COMMANDS_</Text>
        <Text style={styles.subtitulo}>COMANDOS GUARDADOS</Text>
      </View>

      <View style={styles.comando}>
        <Text style={styles.categoria}>NETWORKING</Text>

        <Text style={styles.nombre}>ip addr</Text>

        <Text style={styles.descripcion}>
          Muestra información de las interfaces de red del sistema.
        </Text>

        <TouchableOpacity style={styles.boton}>
          <Text style={styles.textoBoton}>VER COMANDO</Text>
                  <Ionicons style={styles.icono}
                    name="return-down-forward-outline"
                    size={50}
                    color="#00FF88"
                  />
        </TouchableOpacity>
      </View>

      <View style={styles.comando}>
        <Text style={styles.categoria}>LINUX</Text>

        <Text style={styles.nombre}>ls -la</Text>

        <Text style={styles.descripcion}>
          Lista archivos y directorios incluyendo archivos ocultos.
        </Text>

        <TouchableOpacity style={styles.boton}>
          <Text style={styles.textoBoton}>VER COMANDO</Text>
              <Ionicons style={styles.icono}
                name="return-down-forward-outline"
                size={50}
                color="#00FF88"
              />
        </TouchableOpacity>
      </View>

      <View style={styles.comando}>
        <Text style={styles.categoria}>SYSTEM</Text>

        <Text style={styles.nombre}>whoami</Text>

        <Text style={styles.descripcion}>
          Muestra el usuario actualmente activo en el sistema.
        </Text>

        <TouchableOpacity style={styles.boton}>
          <Text style={styles.textoBoton}>VER COMANDO</Text>
                    <Ionicons style={styles.icono}
                    name="return-down-forward-outline"
                    size={50}
                    color="#00FF88"
                  />
        </TouchableOpacity>
      </View>
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
    icono: {
    color: '#00FF88',
    fontSize: 15,
    fontWeight: '900',
    marginRight: 15,
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

  comando: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
  },

  categoria: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },

  nombre: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },

  descripcion: {
    color: '#819187',
    fontSize: 13,
    lineHeight: 19,
  },

  boton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 6,
    paddingVertical: 9,
    alignItems: 'center',
    flexDirection: 'row',     // Alinea los elementos en fila (uno al lado del otro)    // Centra verticalmente el texto y el icono
    justifyContent: 'center',
  },

  textoBoton: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 8,
    
  },
});