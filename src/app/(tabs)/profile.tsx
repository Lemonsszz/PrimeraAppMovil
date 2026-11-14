import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { auth } from '../../firebaseconfig';
import { useUsuario } from '../../services/auth';
import { subscribeContenidos } from '../../services/contenidos';
import { guardarPerfil, subscribePerfil } from '../../services/perfil';
import type { PerfilUsuario } from '../../services/perfil';
import { subscribeProgreso } from '../../services/retos';
import type { Contenido } from '../../types/contenido';
import type { ProgresoRetos } from '../../types/reto';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

const CODIGO_FONDO = [
  '0x4F2A   0x00FF   0x91C7   0x4F2A   0x00FF',
  '01001010  0xA81F  10110101  0x4F2A   0x00FF',
  '0xC4D9   01001101  0x7B20  0x4F2A   0x00FF',
  '10101001  0xFF02  01100110  0x4F2A   0x00FF',
  '0x8A21   11001010  0x41BC  0x4F2A   0x00FF',
  '01010110  0xD920  10011001  0x4F2A   0x00FF',
].join('\n');

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { usuario, uid, cargando } = useUsuario();

  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [progreso, setProgreso] = useState<ProgresoRetos | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreEdicion, setNombreEdicion] = useState('');
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  useEffect(() => subscribeContenidos(setContenidos, () => {}), []);

  useEffect(() => {
    if (!uid) {
      setProgreso(null);
      setPerfil(null);
      return;
    }

    const desuscribirProgreso = subscribeProgreso(uid, setProgreso, () => {});
    const desuscribirPerfil = subscribePerfil(uid, setPerfil, () => {});

    return () => {
      desuscribirProgreso();
      desuscribirPerfil();
    };
  }, [uid]);

  const categorias = new Set(
    contenidos.map((contenido) => contenido.categoria.toUpperCase())
  ).size;
  const aportes = uid
    ? contenidos.filter((contenido) => contenido.creadoPor === uid).length
    : 0;

  const puntos = progreso?.puntosTotales ?? 0;
  const racha = progreso?.racha ?? 0;

  const nombreMostrado =
    perfil?.nombre ||
    usuario?.nombre ||
    (usuario?.email ? usuario.email.split('@')[0] : 'OPERADOR');
  const emailMostrado = usuario?.email ?? perfil?.email ?? 'Sin correo';
  const inicial = (nombreMostrado.trim()[0] ?? '?').toUpperCase();

  const abrirEdicionNombre = () => {
    setNombreEdicion(nombreMostrado);
    setEditandoNombre(true);
  };

  const guardarNombre = async () => {
    if (!uid) return;

    if (!nombreEdicion.trim()) {
      Alert.alert('Nombre vacío', 'Escribe un nombre para tu perfil.');
      return;
    }

    setGuardandoNombre(true);

    try {
      await guardarPerfil(uid, nombreEdicion);
      setEditandoNombre(false);
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'No se pudo guardar el nombre.'
      );
    } finally {
      setGuardandoNombre(false);
    }
  };

  const cambiarContrasena = () => {
    const correo = usuario?.email;

    if (!correo) {
      Alert.alert(
        'Sin correo',
        'Esta sesión no tiene un correo asociado para restablecer la contraseña.'
      );
      return;
    }

    Alert.alert(
      'Cambiar contraseña',
      `Enviaremos un enlace de restablecimiento a ${correo}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, correo);
              Alert.alert(
                'Correo enviado',
                'Revisa tu bandeja de entrada (y el spam) para crear una nueva contraseña.'
              );
            } catch (e) {
              Alert.alert(
                'Error',
                e instanceof Error
                  ? e.message
                  : 'No se pudo enviar el correo.'
              );
            }
          },
        },
      ]
    );
  };

  const cerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/login' as never);
            } catch (e) {
              Alert.alert(
                'Error',
                e instanceof Error ? e.message : 'No se pudo cerrar sesión.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="light-content" />

      <View pointerEvents="none" style={styles.codigoFondo}>
        <Text style={styles.codigo}>{CODIGO_FONDO}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>$ PROFILE_</Text>
          <Text style={styles.subtitulo}>MI CUENTA</Text>
        </View>

        {cargando ? (
          <ActivityIndicator style={styles.cargando} color="#61CF5A" size="large" />
        ) : !uid ? (
          <View style={styles.invitado}>
            <Ionicons name="person-circle-outline" size={58} color="#50864C" />
            <Text style={styles.invitadoTitulo}>MODO INVITADO</Text>
            <Text style={styles.invitadoTexto}>
              Inicia sesión para guardar tu progreso, tus puntos y tu racha.
              Como invitado puedes consultar y jugar, pero no se guarda nada.
            </Text>

            <TouchableOpacity
              style={styles.botonPrimario}
              onPress={() => router.push('/login' as never)}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={17} color="#050805" />
              <Text style={styles.botonPrimarioTexto}>INICIAR SESIÓN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.perfil}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{inicial}</Text>
              </View>

              {editandoNombre ? (
                <View style={styles.editorNombre}>
                  <TextInput
                    style={styles.inputNombre}
                    value={nombreEdicion}
                    onChangeText={setNombreEdicion}
                    placeholder="Tu nombre"
                    placeholderTextColor="#50864C"
                    autoFocus
                    maxLength={40}
                  />

                  <View style={styles.editorBotones}>
                    <TouchableOpacity
                      style={styles.editorGuardar}
                      onPress={guardarNombre}
                      disabled={guardandoNombre}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.editorGuardarTexto}>
                        {guardandoNombre ? 'GUARDANDO...' : 'GUARDAR'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editorCancelar}
                      onPress={() => setEditandoNombre(false)}
                      disabled={guardandoNombre}
                    >
                      <Text style={styles.editorCancelarTexto}>CANCELAR</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.nombre}>{nombreMostrado}</Text>
                  <Text style={styles.usuario}>{emailMostrado}</Text>

                  <TouchableOpacity
                    style={styles.editarNombre}
                    onPress={abrirEdicionNombre}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="pencil-outline" size={13} color="#61CF5A" />
                    <Text style={styles.editarNombreTexto}>EDITAR NOMBRE</Text>
                  </TouchableOpacity>

                  <Text style={styles.aportes}>
                    {aportes} {aportes === 1 ? 'contenido creado' : 'contenidos creados'} por ti
                  </Text>
                </>
              )}
            </View>

            <Text style={styles.titulo}>ESTADÍSTICAS</Text>

            <View style={styles.grid}>
              <Dato
                icono="library-outline"
                valor={String(contenidos.length)}
                etiqueta="CONTENIDOS"
              />
              <Dato
                icono="grid-outline"
                valor={String(categorias)}
                etiqueta="CATEGORÍAS"
              />
              <Dato
                icono="star-outline"
                valor={String(puntos)}
                etiqueta="PUNTOS"
              />
              <Dato
                icono="flame-outline"
                valor={String(racha)}
                etiqueta="RACHA"
              />
            </View>

            <TouchableOpacity
              style={styles.botonSecundario}
              onPress={cambiarContrasena}
              activeOpacity={0.85}
            >
              <Ionicons name="key-outline" size={17} color="#63AD58" />
              <Text style={styles.botonSecundarioTexto}>
                CAMBIAR CONTRASEÑA
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonPeligro}
              onPress={cerrarSesion}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={17} color="#FF5252" />
              <Text style={styles.botonPeligroTexto}>CERRAR SESIÓN</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Dato({
  icono,
  valor,
  etiqueta,
}: {
  icono: NombreIcono;
  valor: string;
  etiqueta: string;
}) {
  return (
    <View style={styles.dato}>
      <Ionicons name={icono} size={18} color="#61CF5A" />
      <Text style={styles.datoNumero}>{valor}</Text>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
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
    color: '#61CF5A',
    fontSize: 14,
    lineHeight: 26,
    letterSpacing: 2,
  },

  scroll: {
    paddingBottom: 30,
  },

  header: {
    marginBottom: 22,
  },

  logo: {
    color: '#61CF5A',
    fontSize: 26,
    fontWeight: '900',
  },

  subtitulo: {
    color: '#50864C',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 5,
  },

  cargando: {
    marginTop: 40,
  },

  invitado: {
    alignItems: 'center',
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 10,
    padding: 26,
    gap: 10,
  },

  invitadoTitulo: {
    color: '#FFC107',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  invitadoTexto: {
    color: '#63AD58',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },

  botonPrimario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#61CF5A',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },

  botonPrimarioTexto: {
    color: '#050805',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  perfil: {
    alignItems: 'center',
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 10,
    padding: 24,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#050805',
    borderWidth: 1,
    borderColor: '#61CF5A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarTexto: {
    color: '#61CF5A',
    fontSize: 25,
    fontWeight: '900',
  },

  nombre: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },

  usuario: {
    color: '#50864C',
    fontSize: 12,
    marginTop: 4,
  },

  editarNombre: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginTop: 12,
  },

  editarNombreTexto: {
    color: '#61CF5A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  aportes: {
    color: '#50864C',
    fontSize: 10,
    marginTop: 12,
    letterSpacing: 0.5,
  },

  editorNombre: {
    alignSelf: 'stretch',
    marginTop: 14,
    gap: 10,
  },

  inputNombre: {
    backgroundColor: '#050805',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },

  editorBotones: {
    flexDirection: 'row',
    gap: 8,
  },

  editorGuardar: {
    flex: 1,
    backgroundColor: '#61CF5A',
    borderRadius: 5,
    paddingVertical: 9,
    alignItems: 'center',
  },

  editorGuardarTexto: {
    color: '#050805',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  editorCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 5,
    paddingVertical: 9,
    alignItems: 'center',
  },

  editorCancelarTexto: {
    color: '#50864C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  titulo: {
    color: '#61CF5A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 22,
    marginBottom: 10,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  dato: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },

  datoNumero: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },

  datoEtiqueta: {
    color: '#50864C',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  botonSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 8,
    paddingVertical: 14,
  },

  botonSecundarioTexto: {
    color: '#63AD58',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  botonPeligro: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FF5252',
    borderRadius: 8,
    paddingVertical: 14,
  },

  botonPeligroTexto: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
