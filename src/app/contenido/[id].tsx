import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { infoCategoria } from '../../constants/categorias';
import { useUsuario } from '../../services/auth';
import { eliminarContenido, subscribeContenido } from '../../services/contenidos';
import type { Contenido } from '../../types/contenido';

const COLOR_RIESGO: Record<string, string> = {
  bajo: '#61CF5A',
  medio: '#FFC107',
  alto: '#FF5252',
};

export default function DetalleContenido() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const parametros = useLocalSearchParams<{ id?: string }>();
  const id = parametros.id ?? '';
  const { uid } = useUsuario();

  const [contenido, setContenido] = useState<Contenido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Contenido no encontrado.');
      setCargando(false);
      return;
    }

    return subscribeContenido(
      id,
      (dato) => {
        setContenido(dato);
        setError(dato ? null : 'Este contenido ya no existe.');
        setCargando(false);
      },
      (e) => {
        setError(e.message);
        setCargando(false);
      }
    );
  }, [id]);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    []
  );

  const copiar = async (clave: string, texto: string) => {
    await Clipboard.setStringAsync(texto);
    setCopiado(clave);

    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setCopiado(null), 1800);
  };

  const confirmarEliminar = () => {
    if (!contenido) return;

    Alert.alert(
      'Eliminar contenido',
      `¿Seguro que quieres eliminar “${contenido.titulo}”? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarContenido(contenido.id);
              router.replace('/comandos' as never);
            } catch (e) {
              Alert.alert(
                'Error al eliminar',
                e instanceof Error
                  ? e.message
                  : 'No se pudo eliminar el contenido.'
              );
            }
          },
        },
      ]
    );
  };

  const info = infoCategoria(contenido?.categoria ?? '');

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
          <Text style={styles.categoria} numberOfLines={1}>
            {contenido
              ? `${contenido.categoria} · ${contenido.tipo.toUpperCase()}`
              : 'CONTENIDO'}
          </Text>
          <Text style={styles.subtitulo}>
            {contenido ? `ID ${contenido.id}` : 'CYBERVAULT'}
          </Text>
        </View>

        <Ionicons name={info.icono} size={26} color="#61CF5A" />
      </View>

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color="#61CF5A" size="large" />
      ) : !contenido ? (
        <Text style={styles.vacio}>{error ?? 'Contenido no encontrado.'}</Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.titulo}>{contenido.titulo}</Text>

          {contenido.resumen ? (
            <Text style={styles.resumen}>{contenido.resumen}</Text>
          ) : null}

          <View style={styles.chips}>
            {contenido.dificultad ? (
              <View style={styles.chip}>
                <Ionicons name="speedometer-outline" size={12} color="#63AD58" />
                <Text style={styles.chipTexto}>{contenido.dificultad}</Text>
              </View>
            ) : null}

            {contenido.riesgo ? (
              <View style={styles.chip}>
                <Ionicons
                  name="warning-outline"
                  size={12}
                  color={COLOR_RIESGO[contenido.riesgo] ?? '#63AD58'}
                />
                <Text
                  style={[
                    styles.chipTexto,
                    { color: COLOR_RIESGO[contenido.riesgo] ?? '#63AD58' },
                  ]}
                >
                  riesgo {contenido.riesgo}
                </Text>
              </View>
            ) : null}

            {contenido.plataformas.map((plataforma) => (
              <View key={plataforma} style={styles.chip}>
                <Ionicons name="desktop-outline" size={12} color="#63AD58" />
                <Text style={styles.chipTexto}>{plataforma}</Text>
              </View>
            ))}
          </View>

          {uid ? (
            <View style={styles.acciones}>
              <TouchableOpacity
                style={styles.accion}
                onPress={() =>
                  router.push(`/contenido/editar?id=${contenido.id}` as never)
                }
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Editar contenido"
              >
                <Ionicons name="create-outline" size={15} color="#61CF5A" />
                <Text style={styles.accionTexto}>EDITAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.accion, styles.accionPeligro]}
                onPress={confirmarEliminar}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Eliminar contenido"
              >
                <Ionicons name="trash-outline" size={15} color="#FF5252" />
                <Text style={[styles.accionTexto, styles.accionTextoPeligro]}>
                  ELIMINAR
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {contenido.advertencia ? (
            <View style={styles.advertenciaCaja}>
              <Ionicons name="warning-outline" size={16} color="#FFC107" />
              <Text style={styles.advertencia}>{contenido.advertencia}</Text>
            </View>
          ) : null}

          {contenido.cuerpo ? (
            <Bloque titulo="COMANDO">
              <CajaCodigo
                texto={contenido.cuerpo}
                copiado={copiado === 'cuerpo'}
                onCopiar={() => copiar('cuerpo', contenido.cuerpo ?? '')}
              />
            </Bloque>
          ) : null}

          {contenido.ejemplo ? (
            <Bloque titulo="EJEMPLO">
              <CajaCodigo
                texto={contenido.ejemplo}
                copiado={copiado === 'ejemplo'}
                onCopiar={() => copiar('ejemplo', contenido.ejemplo ?? '')}
              />
            </Bloque>
          ) : null}

          {contenido.pasos && contenido.pasos.length > 0 ? (
            <Bloque titulo="PASOS">
              {contenido.pasos.map((paso, indice) => {
                const clave = `paso-${indice}`;

                return (
                  <View key={clave} style={styles.paso}>
                    <View style={styles.pasoCabecera}>
                      <Text style={styles.pasoNumero}>{indice + 1}</Text>
                      <Text style={styles.pasoTitulo}>
                        {paso.titulo ?? `Paso ${indice + 1}`}
                      </Text>
                    </View>

                    {paso.detalle ? (
                      <Text style={styles.pasoDetalle}>{paso.detalle}</Text>
                    ) : null}

                    {paso.comando ? (
                      <CajaCodigo
                        texto={paso.comando}
                        copiado={copiado === clave}
                        onCopiar={() => copiar(clave, paso.comando ?? '')}
                      />
                    ) : null}
                  </View>
                );
              })}
            </Bloque>
          ) : null}

          {contenido.nota ? (
            <Bloque titulo="NOTA">
              <View style={styles.notaCaja}>
                <Ionicons name="information-circle-outline" size={16} color="#63AD58" />
                <Text style={styles.nota}>{contenido.nota}</Text>
              </View>
            </Bloque>
          ) : null}

          {contenido.tags.length > 0 ? (
            <Bloque titulo="ETIQUETAS">
              <View style={styles.etiquetas}>
                {contenido.tags.map((etiqueta, indice) => (
                  <Text key={`${etiqueta}-${indice}`} style={styles.etiqueta}>
                    {etiqueta}
                  </Text>
                ))}
              </View>
            </Bloque>
          ) : null}

          {contenido.referencias && contenido.referencias.length > 0 ? (
            <Bloque titulo="REFERENCIAS">
              {contenido.referencias.map((referencia) => (
                <Text key={referencia} selectable style={styles.referencia}>
                  {referencia}
                </Text>
              ))}
            </Bloque>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function Bloque({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.bloque}>
      <Text style={styles.bloqueTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function CajaCodigo({
  texto,
  copiado,
  onCopiar,
}: {
  texto: string;
  copiado: boolean;
  onCopiar: () => void;
}) {
  return (
    <View style={styles.codigoCaja}>
      <Text selectable style={styles.codigo}>
        $ {texto}
      </Text>

      <TouchableOpacity
        style={styles.copiarBoton}
        onPress={onCopiar}
        activeOpacity={0.75}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Copiar al portapapeles"
      >
        <Ionicons
          name={copiado ? 'checkmark-outline' : 'copy-outline'}
          size={15}
          color="#61CF5A"
        />
        <Text style={styles.copiarTexto}>{copiado ? 'COPIADO' : 'COPIAR'}</Text>
      </TouchableOpacity>
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
    marginBottom: 14,
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

  categoria: {
    color: '#61CF5A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  subtitulo: {
    color: '#50864C',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },

  cargando: {
    marginTop: 40,
  },

  vacio: {
    color: '#50864C',
    fontSize: 13,
    marginTop: 20,
    lineHeight: 20,
  },

  scroll: {
    paddingBottom: 40,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },

  resumen: {
    color: '#63AD58',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },

  chipTexto: {
    color: '#63AD58',
    fontSize: 10,
    letterSpacing: 0.5,
  },

  acciones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },

  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    backgroundColor: '#080D0A',
  },

  accionPeligro: {
    borderColor: '#FF5252',
  },

  accionTexto: {
    color: '#61CF5A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  accionTextoPeligro: {
    color: '#FF5252',
  },

  advertenciaCaja: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 18,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    borderRadius: 6,
    padding: 12,
  },

  advertencia: {
    color: '#FFC107',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  bloque: {
    marginTop: 22,
  },

  bloqueTitulo: {
    color: '#61CF5A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },

  codigoCaja: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },

  codigo: {
    color: '#61CF5A',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },

  copiarBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 9,
    backgroundColor: '#050805',
  },

  copiarTexto: {
    color: '#61CF5A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  paso: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  pasoCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  pasoNumero: {
    color: '#050805',
    backgroundColor: '#61CF5A',
    fontSize: 11,
    fontWeight: '900',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    overflow: 'hidden',
  },

  pasoTitulo: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  pasoDetalle: {
    color: '#63AD58',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  notaCaja: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 8,
    padding: 12,
  },

  nota: {
    color: '#63AD58',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  etiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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

  referencia: {
    color: '#61CF5A',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 4,
  },
});
