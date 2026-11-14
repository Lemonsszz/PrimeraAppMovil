import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HORA_RECORDATORIO,
  cancelarRecordatorioDiarioAsync,
  ensureNotificationPermissionsAsync,
  getProjectId,
  getPushTokensAsync,
  programarRecordatorioDiarioAsync,
  pushRemotoDisponible,
  recordatorioDiarioActivo,
  scheduleLocalTestNotificationAsync,
} from '../../notifications';
import { useUsuario } from '../../services/auth';
import { guardarTokenPush, subscribeTokenPush } from '../../services/tokens';
import type { TokenGuardado } from '../../services/tokens';

type Estado = 'cargando' | 'listo' | 'error';

export default function Notificaciones() {
  const insets = useSafeAreaInsets();
  const { uid, cargando: cargandoSesion } = useUsuario();
  const [estado, setEstado] = useState<Estado>('cargando');
  const [permiso, setPermiso] = useState(false);
  const [expoToken, setExpoToken] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ultima, setUltima] = useState<Notifications.Notification | null>(null);
  const [probando, setProbando] = useState(false);
  const [tokenGuardado, setTokenGuardado] = useState<TokenGuardado | null>(null);
  const [recordatorio, setRecordatorio] = useState(false);
  const [cambiandoRecordatorio, setCambiandoRecordatorio] = useState(false);

  const projectId = getProjectId();
  const remoto = pushRemotoDisponible();

  const cargarTokens = useCallback(async () => {
    setEstado('cargando');
    setError(null);

    const concedido = await ensureNotificationPermissionsAsync();
    setPermiso(concedido);

    const tokens = await getPushTokensAsync();
    setExpoToken(tokens.expoPushToken);
    setFcmToken(tokens.fcmToken);
    setError(tokens.error);
    setEstado(tokens.expoPushToken || tokens.fcmToken ? 'listo' : 'error');

    return tokens;
  }, []);

  // Cuando hay sesión y tokens, los guarda en `tokens/{uid}` para que el
  // script de envío pueda alcanzar este dispositivo. Se repite si el token
  // cambia (por ejemplo al recargar).
  useEffect(() => {
    if (cargandoSesion) return;

    if (!uid) {
      setTokenGuardado(null);
      return;
    }

    if (expoToken || fcmToken) {
      guardarTokenPush(uid, {
        expoPushToken: expoToken,
        fcmToken,
        error: null,
      }).catch(() => {
        // Sin conexión o reglas: se reintenta con el botón de recargar.
      });
    }

    const desuscribir = subscribeTokenPush(uid, setTokenGuardado, () => {});
    return desuscribir;
  }, [uid, cargandoSesion, expoToken, fcmToken]);

  // Estado del recordatorio del reto diario.
  useEffect(() => {
    recordatorioDiarioActivo()
      .then(setRecordatorio)
      .catch(() => setRecordatorio(false));
  }, []);

  const alternarRecordatorio = async () => {
    setCambiandoRecordatorio(true);

    try {
      if (recordatorio) {
        await cancelarRecordatorioDiarioAsync();
        setRecordatorio(false);
      } else {
        await programarRecordatorioDiarioAsync();
        setRecordatorio(true);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setCambiandoRecordatorio(false);
    }
  };

  const recargarYGuardar = async () => {
    const tokens = await cargarTokens();

    if (!uid || (!tokens.expoPushToken && !tokens.fcmToken)) return;

    try {
      await guardarTokenPush(uid, tokens);
    } catch (e) {
      setError(String(e));
    }
  };

  const fechaGuardado = tokenGuardado?.actualizadoEn
    ? new Date(tokenGuardado.actualizadoEn).toLocaleString()
    : null;

  useEffect(() => {
    cargarTokens();

    const recibidas = Notifications.addNotificationReceivedListener((n) => {
      setUltima(n);
    });

    const abiertas = Notifications.addNotificationResponseReceivedListener(
      (respuesta) => {
        setUltima(respuesta.notification);
      }
    );

    return () => {
      recibidas.remove();
      abiertas.remove();
    };
  }, [cargarTokens]);

  const probarNotificacion = async () => {
    try {
      setProbando(true);
      await scheduleLocalTestNotificationAsync();
    } catch (e) {
      setError(String(e));
    } finally {
      setProbando(false);
    }
  };

  const colorEstado =
    estado === 'listo' ? '#00FF88' : estado === 'error' ? '#FF5C5C' : '#FFC107';

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contenido,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>$ PUSH_NOTIFICATIONS_</Text>
          <Text style={styles.subtitulo}>FIREBASE CLOUD MESSAGING · FCM V1</Text>
        </View>

        <View style={styles.estadoCard}>
          <View style={[styles.punto, { backgroundColor: colorEstado }]} />
          <Text style={[styles.estadoTexto, { color: colorEstado }]}>
            {estado === 'cargando'
              ? 'OBTENIENDO TOKEN...'
              : estado === 'listo'
                ? 'CONECTADO'
                : 'REVISAR CONFIGURACIÓN'}
          </Text>
          {estado === 'cargando' && (
            <ActivityIndicator color="#00FF88" size="small" />
          )}
        </View>

        <Dato
          etiqueta="PERMISO"
          valor={permiso ? 'Concedido' : 'No concedido'}
        />
        <Dato etiqueta="PROJECT ID (EAS)" valor={projectId ?? 'No configurado'} />
        <Dato etiqueta="PACKAGE ANDROID" valor="com.primeraappmovil.lem" />
        <Dato
          etiqueta="PLATAFORMA"
          valor={Platform.OS === 'android' ? 'Android' : Platform.OS}
        />

        <Text style={styles.seccion}>EXPO PUSH TOKEN</Text>
        <Text selectable style={styles.token}>
          {expoToken ?? '— sin token —'}
        </Text>

        <Text style={styles.seccion}>FCM TOKEN (NATIVO)</Text>
        <Text selectable style={styles.token}>
          {fcmToken ?? '— sin token —'}
        </Text>

        <Text style={styles.seccion}>GUARDADO EN TU CUENTA</Text>
        <View style={styles.ultimaCard}>
          <Text style={styles.ultimaTitulo}>
            {!uid
              ? 'Inicia sesión para guardar el token'
              : tokenGuardado
                ? 'Sí · este dispositivo recibirá push'
                : 'Todavía no se ha guardado'}
          </Text>
          {tokenGuardado && fechaGuardado && (
            <Text style={styles.ultimaCuerpo}>Actualizado: {fechaGuardado}</Text>
          )}
        </View>

        {!remoto.disponible && remoto.motivo && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTexto}>{remoto.motivo}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.boton}
          onPress={recargarYGuardar}
          disabled={estado === 'cargando'}
        >
          <Ionicons name="refresh-outline" size={20} color="#00FF88" />
          <Text style={styles.textoBoton}>RECARGAR Y GUARDAR TOKEN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonSecundario]}
          onPress={probarNotificacion}
          disabled={probando}
        >
          <Ionicons name="notifications-outline" size={20} color="#050805" />
          <Text style={[styles.textoBoton, styles.textoBotonSecundario]}>
            {probando ? 'ENVIANDO...' : 'PROBAR NOTIFICACIÓN LOCAL'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.seccion}>RECORDATORIO DEL RETO DIARIO</Text>
        <TouchableOpacity
          style={[styles.boton, recordatorio && styles.botonSecundario]}
          onPress={alternarRecordatorio}
          disabled={cambiandoRecordatorio}
        >
          <Ionicons
            name={recordatorio ? 'alarm-outline' : 'alarm'}
            size={20}
            color={recordatorio ? '#050805' : '#00FF88'}
          />
          <Text
            style={[
              styles.textoBoton,
              recordatorio && styles.textoBotonSecundario,
            ]}
          >
            {cambiandoRecordatorio
              ? 'GUARDANDO...'
              : recordatorio
                ? `DESACTIVAR (${HORA_RECORDATORIO}:00)`
                : `ACTIVAR (${HORA_RECORDATORIO}:00)`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.seccion}>ÚLTIMA NOTIFICACIÓN RECIBIDA</Text>
        <View style={styles.ultimaCard}>
          <Text style={styles.ultimaTitulo}>
            {ultima?.request.content.title ?? 'Todavía no llega ninguna'}
          </Text>
          {ultima?.request.content.body && (
            <Text style={styles.ultimaCuerpo}>
              {ultima.request.content.body}
            </Text>
          )}
        </View>

        <Text style={styles.nota}>
          Al tocar una notificación, la app abre la pantalla indicada en su
          campo `url` (por ejemplo `/retos` o `/contenido/C001`). El
          recordatorio diario usa una notificación local programada a las{' '}
          {HORA_RECORDATORIO}:00. Recuerda: las notificaciones push remotas NO
          funcionan en Expo Go en Android; usa el APK compilado por EAS.
        </Text>
      </ScrollView>
    </View>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text selectable style={styles.datoValor}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
  },

  contenido: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  logo: {
    color: '#00FF88',
    fontSize: 24,
    fontWeight: '900',
  },

  subtitulo: {
    color: '#526158',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 5,
  },

  estadoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 10,
  },

  punto: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  estadoTexto: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    flex: 1,
  },

  dato: {
    marginBottom: 10,
  },

  datoEtiqueta: {
    color: '#526158',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
  },

  datoValor: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 2,
  },

  seccion: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 18,
    marginBottom: 6,
  },

  token: {
    color: '#C9D6CE',
    fontSize: 12,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 8,
    padding: 10,
    fontFamily: Platform.select({ android: 'monospace', default: 'Courier' }),
  },

  errorCard: {
    marginTop: 14,
    backgroundColor: '#1A0A0A',
    borderWidth: 1,
    borderColor: '#5C1F1F',
    borderRadius: 8,
    padding: 10,
  },

  errorTexto: {
    color: '#FF8A8A',
    fontSize: 12,
    lineHeight: 17,
  },

  boton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 8,
    paddingVertical: 12,
  },

  botonSecundario: {
    backgroundColor: '#00FF88',
  },

  textoBoton: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  textoBotonSecundario: {
    color: '#050805',
  },

  ultimaCard: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#123D29',
    borderRadius: 10,
    padding: 14,
  },

  ultimaTitulo: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  ultimaCuerpo: {
    color: '#819187',
    fontSize: 12,
    marginTop: 4,
  },

  nota: {
    color: '#526158',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 24,
  },
});
