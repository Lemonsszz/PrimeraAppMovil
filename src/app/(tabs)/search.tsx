import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StatusBar,
} from 'react-native';

export default function Buscar() {
  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>$ SEARCH_</Text>
        <Text style={styles.subtitulo}>BUSCAR COMANDOS</Text>
      </View>

      <TextInput
        style={styles.buscar}
        placeholder="Escribe un comando..."
        placeholderTextColor="#526158"
      />

      <Text style={styles.resultados}>RESULTADOS</Text>

      <View style={styles.comando}>
        <Text style={styles.nombre}>ip addr</Text>
        <Text style={styles.descripcion}>Información de interfaces de red</Text>
      </View>

      <View style={styles.comando}>
        <Text style={styles.nombre}>ls -la</Text>
        <Text style={styles.descripcion}>Lista archivos y directorios</Text>
      </View>

      <View style={styles.comando}>
        <Text style={styles.nombre}>whoami</Text>
        <Text style={styles.descripcion}>Usuario actual del sistema</Text>
      </View>
              0x4F2A   0x00FF   0x91C7  0x4F2A   0x00FF   0x91C7{'\n'}
    01001010  0xA81F  10110101  0x4F2A   0x00FF   0x91C7{'\n'}
    0xC4D9   01001101  0x7B20  0x4F2A   0x00FF   0x91C7{'\n'}
    10101001  0xFF02  01100110  0x4F2A   0x00FF   0x91C7{'\n'}
    0x8A21   11001010  0x41BC  0x4F2A   0x00FF   0x91C7{'\n'}
    01010110  0xD920  10011001 0x4F2A   0x00FF   0x91C7
            0x4F2A   0x00FF   0x91C7  0x4F2A   0x00FF   0x91C7{'\n'}
    01001010  0xA81F  10110101  0x4F2A   0x00FF   0x91C7{'\n'}
    0xC4D9   01001101  0x7B20  0x4F2A   0x00FF   0x91C7{'\n'}
    10101001  0xFF02  01100110  0x4F2A   0x00FF   0x91C7{'\n'}
    0x8A21   11001010  0x41BC  0x4F2A   0x00FF   0x91C7{'\n'}
    01010110  0xD920  10011001 0x4F2A   0x00FF   0x91C7
            0x4F2A   0x00FF   0x91C7  0x4F2A   0x00FF   0x91C7{'\n'}
    01001010  0xA81F  10110101  0x4F2A   0x00FF   0x91C7{'\n'}
    0xC4D9   01001101  0x7B20  0x4F2A   0x00FF   0x91C7{'\n'}
    10101001  0xFF02  01100110  0x4F2A   0x00FF   0x91C7{'\n'}
    0x8A21   11001010  0x41BC  0x4F2A   0x00FF   0x91C7{'\n'}
    01010110  0xD920  10011001 0x4F2A   0x00FF   0x91C7
            0x4F2A   0x00FF   0x91C7  0x4F2A   0x00FF   0x91C7{'\n'}
    01001010  0xA81F  10110101  0x4F2A   0x00FF   0x91C7{'\n'}
    0xC4D9   01001101  0x7B20  0x4F2A   0x00FF   0x91C7{'\n'}
    10101001  0xFF02  01100110  0x4F2A   0x00FF   0x91C7{'\n'}
    0x8A21   11001010  0x41BC  0x4F2A   0x00FF   0x91C7{'\n'}
    01010110  0xD920  10011001 0x4F2A   0x00FF   0x91C7

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

  buscar: {
    height: 50,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontSize: 14,
  },

  resultados: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 25,
    marginBottom: 12,
  },

  comando: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },

  nombre: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  descripcion: {
    color: '#718078',
    fontSize: 12,
    marginTop: 5,
  },
});