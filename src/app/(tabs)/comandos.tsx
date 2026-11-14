import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { subscribeContenidos } from '../../services/contenidos';
import type { Contenido } from '../../types/contenido';

export default function Comandos() {
  const insets = useSafeAreaInsets();
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

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>$ COMMANDS_</Text>
        <Text style={styles.subtitulo}>
          {cargando
            ? 'CARGANDO...'
            : `${contenidos.length} CONTENIDOS GUARDADOS`}
        </Text>
      </View>

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color="#00FF88" size="large" />
      ) : (
        <FlatList
          data={contenidos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {error ?? 'Todavía no hay comandos guardados.'}
            </Text>
          }
          renderItem={({ item }) => <TarjetaContenido contenido={item} />}
        />
      )}
    </View>
  );
}

function TarjetaContenido({ contenido }: { contenido: Contenido }) {
  const etiquetas = [
    ...contenido.plataformas,
    ...(contenido.dificultad ? [contenido.dificultad] : []),
    ...contenido.tags,
  ];

  return (
    <Card style={styles.comando}>
      <Card.Content>
        <Text style={styles.categoria}>
          {contenido.categoria} · {contenido.tipo.toUpperCase()}
        </Text>

        <Text style={styles.nombre}>{contenido.titulo}</Text>

        {contenido.resumen ? (
          <Text style={styles.descripcion}>{contenido.resumen}</Text>
        ) : null}

        {contenido.cuerpo ? (
          <View style={styles.codigoCaja}>
            <Text selectable style={styles.codigo}>
              $ {contenido.cuerpo}
            </Text>
          </View>
        ) : null}

        {etiquetas.length > 0 ? (
          <View style={styles.etiquetas}>
            {etiquetas.map((etiqueta, indice) => (
              <Text key={`${etiqueta}-${indice}`} style={styles.etiqueta}>
                {etiqueta}
              </Text>
            ))}
          </View>
        ) : null}
      </Card.Content>

      {contenido.advertencia ? (
        <Card.Content style={styles.advertenciaCaja}>
          <Ionicons name="warning-outline" size={14} color="#FFC107" />
          <Text style={styles.advertencia}>{contenido.advertencia}</Text>
        </Card.Content>
      ) : null}
    </Card>
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

  codigoCaja: {
    marginTop: 12,
    backgroundColor: '#050805',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  codigo: {
    color: '#00FF88',
    fontSize: 12,
    fontFamily: 'monospace',
  },

  etiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },

  etiqueta: {
    color: '#718078',
    fontSize: 10,
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  advertenciaCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#123D29',
    paddingTop: 10,
    paddingBottom: 12,
  },

  advertencia: {
    color: '#FFC107',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },

  vacio: {
    color: '#526158',
    fontSize: 13,
    marginTop: 20,
    lineHeight: 20,
  },
});
