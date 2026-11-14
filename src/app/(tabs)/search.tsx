import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { filtrarContenidos, subscribeContenidos } from '../../services/contenidos';
import type { Contenido } from '../../types/contenido';

const CODIGO_FONDO = [
  '0x4F2A   0x00FF   0x91C7   0x4F2A   0x00FF',
  '01001010  0xA81F  10110101  0x4F2A   0x00FF',
  '0xC4D9   01001101  0x7B20  0x4F2A   0x00FF',
  '10101001  0xFF02  01100110  0x4F2A   0x00FF',
  '0x8A21   11001010  0x41BC  0x4F2A   0x00FF',
  '01010110  0xD920  10011001  0x4F2A   0x00FF',
].join('\n');

export default function Buscar() {
  const insets = useSafeAreaInsets();
  const [consulta, setConsulta] = useState('');
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    return subscribeContenidos(
      (lista) => {
        setContenidos(lista);
        setCargando(false);
      },
      () => setCargando(false)
    );
  }, []);

  const resultados = useMemo(
    () => filtrarContenidos(contenidos, consulta),
    [contenidos, consulta]
  );

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="light-content" />

      {/* DECORACIÓN DE FONDO (siempre dentro de <Text>) */}
      <View pointerEvents="none" style={styles.codigoFondo}>
        <Text style={styles.codigo}>{CODIGO_FONDO}</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.logo}>$ SEARCH_</Text>
        <Text style={styles.subtitulo}>BUSCAR COMANDOS Y ESTRATEGIAS</Text>
      </View>

      <TextInput
        style={styles.buscar}
        placeholder="Escribe un comando, categoría o etiqueta..."
        placeholderTextColor="#526158"
        value={consulta}
        onChangeText={setConsulta}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <Text style={styles.resultados}>
        {cargando
          ? 'CARGANDO...'
          : `${resultados.length} RESULTADO${resultados.length === 1 ? '' : 'S'}`}
      </Text>

      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.comando}>
            <Text style={styles.categoria}>
              {item.categoria} · {item.tipo.toUpperCase()}
            </Text>
            <Text style={styles.nombre}>{item.titulo}</Text>
            {item.resumen ? (
              <Text style={styles.descripcion}>{item.resumen}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          cargando ? null : (
            <Text style={styles.vacio}>
              Sin resultados para “{consulta.trim()}”.
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
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
    fontSize: 14,
    lineHeight: 26,
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

  lista: {
    paddingBottom: 30,
  },

  comando: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },

  categoria: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
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
    lineHeight: 17,
  },

  vacio: {
    color: '#526158',
    fontSize: 13,
    marginTop: 10,
  },
});
