import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appbar } from 'react-native-paper';
export default function Inicio() {
  return (
    <View style={styles.contenedor}>
      <Appbar.Header style={styles.categoria}>
        <Appbar.Content title="ESTUDIANTE"></Appbar.Content>
      </Appbar.Header>
      <View style={styles.header}>
        <Text style={styles.logo}><Ionicons style={styles.icono_sombrero}
                name="school"
                size={20}
                color="#00FF88"/> DATOS DEL ESTUDIANTE </Text>
        <Text style={styles.subtitulo}>NOMBRE COMPLETO: Romel Axel Colque Murillo</Text>
        <Text style={styles.subtitulo}>CÓDIGO DE ESTUDIANTE: 121137</Text>
        <Text style={styles.subtitulo}>MATERIA: Desarrollo de Aplicaciones Móviles I</Text>
      </View>

      <Image
        source={{
          uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH6mWFGlAV6MKH6lK_iMDqJb3zbikc3Ecm4FQh8ksnmA&s=10',
        }}
        style={styles.imagen}
      />

      <View style={styles.contenido}>
        <Text style={styles.titulo}>ESTUDIANTE DE UDABOL</Text>


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
    icono_sombrero: {
    color: '#00FF88',
    fontSize: 30,
    fontWeight: '900',
    marginRight: 15,
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

});