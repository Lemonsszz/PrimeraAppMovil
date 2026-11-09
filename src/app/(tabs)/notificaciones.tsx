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

import {
  ensureNotificationPermissionsAsync,
  getProjectId,
  getPushTokensAsync,
  scheduleLocalTestNotificationAsync,
} from '../../notifications';

type Estado = 'cargando' | 'listo' | 'error';

export default function Notificaciones() {
  const [estado, setEstado] = useState<Estado>('cargando');
  const [permiso, setPermiso] = useState(false);
  const [expoToken, setExpoToken] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ultima, setUltima] = useState<Notifications.Notification | null>(null);
  const [probando, setProbando] = useState(false);

  const projectId = getProjectId();

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
  }, []);

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
        contentContainerStyle={styles.contenido}
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

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.boton}
          onPress={cargarTokens}
          disabled={estado === 'cargando'}
        >
          <Ionicons name="refresh-outline" size={20} color="#00FF88" />
          <Text style={styles.textoBoton}>RECARGAR TOKENS</Text>
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
          Recuerda: las notificaciones push remotas NO funcionan en Expo Go en
          Android. Debes probar con el APK compilado por EAS.
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
