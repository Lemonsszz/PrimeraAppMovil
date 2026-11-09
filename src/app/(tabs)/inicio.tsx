import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Inicio() {
  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>CYBERVAULT_</Text>
        <Text style={styles.subtitulo}>COMMAND LIBRARY</Text>
      </View>

      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        }}
        style={styles.imagen}
      />

      <View style={styles.contenido}>
        <Text style={styles.titulo}>$ MIS COMANDOS</Text>

        <Text style={styles.descripcion}>
          Guarda, organiza y consulta tus comandos de ciberseguridad desde
          cualquier lugar.
        </Text>

        <TouchableOpacity style={styles.boton} activeOpacity={0.8}>

          <Text style={styles.textoBoton}><Ionicons style={styles.icono}
                name="add-circle-outline"
                size={50}
                color="#00FF88"
              />AGREGAR COMANDO </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
    alignItems: 'center',
    paddingTop: 55,
  },
    icono: {
    color: '#00FF88',
    fontSize: 17,
    fontWeight: '900',
    marginRight: 15,
  },

  header: {
    width: '90%',
    marginBottom: 25,
  },

  logo: {
    color: '#00FF88',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 1,
  },

  subtitulo: {
    color: '#5C7568',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 5,
  },

  imagen: {
    width: '90%',
    height: 230,
    borderRadius: 12,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#123D29',
  },

  contenido: {
    width: '90%',
    marginTop: 25,
  },

  titulo: {
    color: '#00FF88',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 1,
  },

  descripcion: {
    color: '#91A69A',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },

  boton: {
    backgroundColor: '#071A10',
    marginTop: 25,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  textoBoton: {
    color: '#00FF88',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});