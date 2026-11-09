import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseconfig';

export default function Comandos() {
  console.log('🔥 ENTRE A COMANDOS');

  const [comandos, setComandos] = useState<any[]>([]);

  useEffect(() => {
    const comandosObtener = ref(database, 'Comandos');

    const escucharComandos = onValue(comandosObtener, (snapshot) => {
      const datos = snapshot.val();

      console.log('DATOS FIREBASE:', datos);

      if (datos) {
        const listaComandos = Object.keys(datos).map((id) => ({
          id: id,
          categoria: datos[id].categoria,
          nombre: datos[id].nombre,
          descripcion: datos[id].descripcion,
        }));

        setComandos(listaComandos);
      } else {
        setComandos([]);
      }
    });

    return () => escucharComandos();
  }, []);

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>$ COMMANDS_</Text>
        <Text style={styles.subtitulo}>COMANDOS GUARDADOS</Text>
      </View>

      <FlatList
        data={comandos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.comando}>
            <Card.Content>
              <Text style={styles.categoria}>
                {item.categoria}
              </Text>

              <Text style={styles.nombre}>
                {item.nombre}
              </Text>

              <Text style={styles.descripcion}>
                {item.descripcion}
              </Text>
            </Card.Content>

            <Card.Actions>
              <TouchableOpacity style={styles.boton}>
                <Text style={styles.textoBoton}>
                  VER COMANDO
                </Text>

                <Ionicons
                  name="return-down-forward-outline"
                  size={28}
                  color="#00FF88"
                />
              </TouchableOpacity>
            </Card.Actions>
          </Card>
        )}
      />
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

  comando: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
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
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },

  textoBoton: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 8,
  },
});