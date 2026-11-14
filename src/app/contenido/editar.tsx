import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContenidoForm } from '../../components/contenido-form';
import { useUsuario } from '../../services/auth';
import {
  actualizarContenido,
  crearContenido,
  subscribeContenido,
} from '../../services/contenidos';
import type { Contenido, DatosContenido } from '../../types/contenido';

export default function EditarContenido() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const parametros = useLocalSearchParams<{ id?: string }>();
  const id = parametros.id;
  const esEdicion = Boolean(id);

  const { uid, cargando: cargandoSesion } = useUsuario();
  const [inicial, setInicial] = useState<Contenido | null>(null);
  const [cargandoContenido, setCargandoContenido] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    return subscribeContenido(
      id,
      (dato) => {
        setInicial(dato);
        setCargandoContenido(false);
        if (!dato) setError('No se encontró el contenido a editar.');
      },
      (e) => {
        setError(e.message);
        setCargandoContenido(false);
      }
    );
  }, [id]);

  const guardar = async (datos: DatosContenido) => {
    if (!uid) {
      Alert.alert('Sesión requerida', 'Inicia sesión para guardar contenido.');
      return;
    }

    setError(null);
    setGuardando(true);

    try {
      if (id) {
        await actualizarContenido(id, datos);
        router.replace(`/contenido/${id}` as never);
      } else {
        const nuevoId = await crearContenido(datos, uid);
        router.replace(`/contenido/${nuevoId}` as never);
      }
    } catch (e) {
      const mensaje =
        e instanceof Error ? e.message : 'No se pudo guardar el contenido.';
      setError(mensaje);
      Alert.alert('Error al guardar', mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const volver = () => router.back();
  const irALogin = () => router.push('/login' as never);

  const cargando = cargandoSesion || cargandoContenido;

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 12 }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.volver}
          onPress={volver}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back-outline" size={22} color="#61CF5A" />
        </TouchableOpacity>

        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>
            {esEdicion ? 'EDITAR CONTENIDO' : 'NUEVO CONTENIDO'}
          </Text>
          <Text style={styles.subtitulo}>
            {esEdicion ? (id ?? '').toUpperCase() : 'CYBERVAULT'}
          </Text>
        </View>

        <Ionicons name="create-outline" size={24} color="#61CF5A" />
      </View>

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color="#61CF5A" size="large" />
      ) : !uid ? (
        <View style={styles.avisoCaja}>
          <Ionicons name="lock-closed-outline" size={26} color="#FFC107" />
          <Text style={styles.avisoTitulo}>SESIÓN REQUERIDA</Text>
          <Text style={styles.avisoTexto}>
            Para crear o editar contenido necesitas iniciar sesión. Los invitados
            pueden consultar, pero no escribir en la base de datos.
          </Text>

          <TouchableOpacity style={styles.avisoBoton} onPress={irALogin}>
            <Text style={styles.avisoBotonTexto}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      ) : esEdicion && !inicial ? (
        <Text style={styles.vacio}>
          {error ?? 'No se encontró el contenido que quieres editar.'}
        </Text>
      ) : (
        <ContenidoForm
          inicial={inicial}
          guardando={guardando}
          error={error}
          onGuardar={guardar}
          onCancelar={volver}
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
    marginBottom: 18,
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
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
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

  avisoCaja: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 10,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },

  avisoTitulo: {
    color: '#FFC107',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  avisoTexto: {
    color: '#63AD58',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },

  avisoBoton: {
    marginTop: 6,
    backgroundColor: '#61CF5A',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  avisoBotonTexto: {
    color: '#050805',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
