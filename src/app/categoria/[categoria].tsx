import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContenidoCard } from '../../components/contenido-card';
import { infoCategoria } from '../../constants/categorias';
import { filtrarContenidos, subscribeContenidos } from '../../services/contenidos';
import type { Contenido } from '../../types/contenido';

export default function Categoria() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const parametros = useLocalSearchParams<{ categoria?: string }>();
  const categoria = decodeURIComponent(parametros.categoria ?? '').toUpperCase();

  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consulta, setConsulta] = useState('');

  useEffect(() => {
    return subscribeContenidos(
      (lista) => {
        setContenidos(lista);
        setCargando(false);
        setError(null);
      },
      (e) => {
        setError(e.message);
        setCargando(false);
      }
    );
  }, []);

  const deLaCategoria = useMemo(
    () =>
      contenidos.filter(
        (contenido) => contenido.categoria.toUpperCase() === categoria
      ),
    [contenidos, categoria]
  );

  const resultados = useMemo(
    () => filtrarContenidos(deLaCategoria, consulta),
    [deLaCategoria, consulta]
  );

  const info = infoCategoria(categoria);

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 12 }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.volver}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#61CF5A" />
        </TouchableOpacity>

        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>{categoria || 'CATEGORÍA'}</Text>
          <Text style={styles.subtitulo}>
            {cargando ? 'CARGANDO...' : `${deLaCategoria.length} CONTENIDOS`}
          </Text>
        </View>

        <Ionicons name={info.icono} size={26} color="#61CF5A" />
      </View>

      <Text style={styles.descripcion}>{info.descripcion}</Text>

      <TextInput
        style={styles.buscar}
        placeholder={`Buscar en ${categoria || 'esta categoría'}...`}
        placeholderTextColor="#50864C"
        value={consulta}
        onChangeText={setConsulta}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color="#61CF5A" size="large" />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <ContenidoCard
              contenido={item}
              onPress={() => router.push(`/contenido/${item.id}` as never)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {error ??
                (consulta.trim()
                  ? `Sin resultados para “${consulta.trim()}”.`
                  : 'Esta categoría todavía no tiene contenidos.')}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  volver: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    backgroundColor: '#080D0A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTexto: {
    flex: 1,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },

  subtitulo: {
    color: '#50864C',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },

  descripcion: {
    color: '#63AD58',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 16,
  },

  buscar: {
    height: 46,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 16,
  },

  cargando: {
    marginTop: 40,
  },

  lista: {
    paddingBottom: 30,
  },

  vacio: {
    color: '#50864C',
    fontSize: 13,
    marginTop: 20,
    lineHeight: 20,
  },
});
