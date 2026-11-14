import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from 'react-native-paper';

import type { Contenido } from '../types/contenido';

/** Tarjeta reutilizable para mostrar un comando/estrategia del santuario. */
export function ContenidoCard({ contenido }: { contenido: Contenido }) {
  const etiquetas = [
    ...contenido.plataformas,
    ...(contenido.dificultad ? [contenido.dificultad] : []),
    ...contenido.tags,
  ];

  return (
    <Card style={styles.tarjeta}>
      <Card.Content>
        <Text style={styles.categoria}>
          {contenido.categoria} · {contenido.tipo.toUpperCase()}
        </Text>

        <Text style={styles.titulo}>{contenido.titulo}</Text>

        {contenido.resumen ? (
          <Text style={styles.resumen}>{contenido.resumen}</Text>
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
  tarjeta: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },

  categoria: {
    color: '#61CF5A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },

  resumen: {
    color: '#63AD58',
    fontSize: 13,
    lineHeight: 19,
  },

  codigoCaja: {
    marginTop: 12,
    backgroundColor: '#050805',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  codigo: {
    color: '#61CF5A',
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
    color: '#63AD58',
    fontSize: 10,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  advertenciaCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#3E6A3D',
    paddingTop: 10,
    paddingBottom: 12,
  },

  advertencia: {
    color: '#FFC107',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});
