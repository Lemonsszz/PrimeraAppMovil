import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

export default function Perfil() {
  return (
    
    <View style={styles.contenedor}>
      <View style={styles.codigoFondo}>
  <Text style={styles.codigo}>
    0x4F2A   0x00FF   0x91C7{'\n'}
    01001010  0xA81F  10110101{'\n'}
    0xC4D9   01001101  0x7B20{'\n'}
    10101001  0xFF02  01100110{'\n'}
    0x8A21   11001010  0x41BC{'\n'}
    01010110  0xD920  10011001
  </Text>
</View>
      <StatusBar barStyle="light-content" />
    

      <View style={styles.header}>
        <Text style={styles.logo}>$ PROFILE_</Text>
        <Text style={styles.subtitulo}>MI CUENTA</Text>
      </View>

      <View style={styles.perfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>A</Text>
        </View>

        <Text style={styles.nombre}>LEMONS</Text>
        <Text style={styles.usuario}>@cyberuser</Text>
      </View>

      <View style={styles.informacion}>
        <Text style={styles.titulo}>ESTADÍSTICAS</Text>

        <View style={styles.dato}>
          <Text style={styles.numero}>24</Text>
          <Text style={styles.texto}>COMANDOS</Text>
        </View>

        <View style={styles.dato}>
          <Text style={styles.numero}>6</Text>
          <Text style={styles.texto}>CATEGORÍAS</Text>
        </View>

        <View style={styles.dato}>
          <Text style={styles.numero}>8</Text>
          <Text style={styles.texto}>FAVORITOS</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.boton}>
        <Text style={styles.textoBoton}>⚙ CONFIGURACIÓN</Text>
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
  codigoFondo: {
  position: 'absolute',
  top: 120,
  left: 10,
  right: 10,
  opacity: 0.08,
},

codigo: {
  color: '#00FF88',
  fontSize: 16,
  lineHeight: 28,
  letterSpacing: 2,
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

  perfil: {
    alignItems: 'center',
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 10,
    padding: 25,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#071A10',
    borderWidth: 1,
    borderColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarTexto: {
    color: '#00FF88',
    fontSize: 25,
    fontWeight: '900',
  },

  nombre: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },

  usuario: {
    color: '#526158',
    fontSize: 12,
    marginTop: 4,
  },

  informacion: {
    marginTop: 20,
  },

  titulo: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },

  dato: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },

  numero: {
    color: '#00FF88',
    fontSize: 20,
    fontWeight: '900',
    width: 55,
  },

  texto: {
    color: '#A0ADA5',
    fontSize: 12,
    fontWeight: '700',
  },

  boton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },

  textoBoton: {
    color: '#718078',
    fontSize: 12,
    fontWeight: '700',
  },
});