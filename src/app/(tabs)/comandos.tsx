import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { infoCategoria } from '../../constants/categorias';
import { subscribeContenidos } from '../../services/contenidos';
import type { Contenido } from '../../types/contenido';

type GrupoCategoria = {
  categoria: string;
  total: number;
};

export default function Comandos() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const categorias = useMemo<GrupoCategoria[]>(() => {
    const conteo = new Map<string, number>();
    for (const contenido of contenidos) {
      const clave = contenido.categoria.toUpperCase();
      conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
    }

    return [...conteo.entries()]
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria, 'es'));
  }, [contenidos]);

  const abrirCategoria = (categoria: string) => {
    router.push(`/categoria/${encodeURIComponent(categoria)}` as never);
  };

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>$ CATEGORIES_</Text>
        <Text style={styles.subtitulo}>
          {cargando
            ? 'CARGANDO...'
            : `${categorias.length} CATEGORÍAS · ${contenidos.length} CONTENIDOS`}
        </Text>
      </View>

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color="#00FF88" size="large" />
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={(item) => item.categoria}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {error ?? 'Todavía no hay comandos guardados.'}
            </Text>
          }
          renderItem={({ item }) => {
            const info = infoCategoria(item.categoria);

            return (
              <TouchableOpacity
                style={styles.categoria}
                activeOpacity={0.85}
                onPress={() => abrirCategoria(item.categoria)}
              >
                <View style={styles.iconoCaja}>
                  <Ionicons name={info.icono} size={26} color="#00FF88" />
                </View>

                <View style={styles.categoriaTexto}>
                  <Text style={styles.categoriaNombre}>{item.categoria}</Text>
                  <Text style={styles.categoriaDetalle}>{info.descripcion}</Text>
                </View>

                <View style={styles.contador}>
                  <Text style={styles.contadorNumero}>{item.total}</Text>
                  <Text style={styles.contadorEtiqueta}>
                    {item.total === 1 ? 'ÍTEM' : 'ÍTEMS'}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color="#526158"
                />
              </TouchableOpacity>
            );
          }}
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
    marginBottom: 20,
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

  cargando: {
    marginTop: 40,
  },

  lista: {
    paddingBottom: 30,
  },

  categoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  iconoCaja: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#071A10',
    borderWidth: 1,
    borderColor: '#123D29',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoriaTexto: {
    flex: 1,
  },

  categoriaNombre: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  categoriaDetalle: {
    color: '#718078',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },

  contador: {
    alignItems: 'center',
    minWidth: 34,
  },

  contadorNumero: {
    color: '#00FF88',
    fontSize: 18,
    fontWeight: '900',
  },

  contadorEtiqueta: {
    color: '#526158',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 1,
  },

  vacio: {
    color: '#526158',
    fontSize: 13,
    marginTop: 20,
    lineHeight: 20,
  },
});
