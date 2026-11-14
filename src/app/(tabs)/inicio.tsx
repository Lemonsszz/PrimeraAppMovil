import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

type Acceso = {
  titulo: string;
  detalle: string;
  icono: NombreIcono;
  ruta: string;
};

const ACCESOS: Acceso[] = [
  {
    titulo: 'COMANDOS',
    detalle: 'Explora por categorías',
    icono: 'code-slash-outline',
    ruta: '/comandos',
  },
  {
    titulo: 'BUSCAR',
    detalle: 'Comandos y estrategias',
    icono: 'search-outline',
    ruta: '/search',
  },
  {
    titulo: 'NOTIFICACIONES',
    detalle: 'Prueba el push',
    icono: 'notifications-outline',
    ruta: '/notificaciones',
  },
  {
    titulo: 'PERFIL',
    detalle: 'Tu cuenta',
    icono: 'person-outline',
    ruta: '/profile',
  },
];

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>CYBERVAULT_</Text>
          <Text style={styles.subtitulo}>SANTUARIO DE CIBERSEGURIDAD</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEtiqueta}>$ BIENVENIDO</Text>
          <Text style={styles.heroTitulo}>Tu conocimiento, en un solo lugar</Text>
          <Text style={styles.heroTexto}>
            Guarda, organiza y consulta comandos, estrategias y técnicas de
            ciberseguridad. Todo listo para cuando lo necesites.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.reto}
          activeOpacity={0.85}
          onPress={() => router.push('/retos')}
        >
          <View style={styles.retoIcono}>
            <Ionicons name="trophy-outline" size={26} color="#050805" />
          </View>

          <View style={styles.retoTexto}>
            <Text style={styles.retoEtiqueta}>RETO DIARIO</Text>
            <Text style={styles.retoTitulo}>Pon a prueba tu nivel</Text>
            <Text style={styles.retoDetalle}>
              5 preguntas · puntos · racha
            </Text>
          </View>

          <Ionicons name="arrow-forward-outline" size={20} color="#050805" />
        </TouchableOpacity>

        <Text style={styles.seccion}>EXPLORAR</Text>

        <View style={styles.accesos}>
          {ACCESOS.map((acceso) => (
            <TouchableOpacity
              key={acceso.ruta}
              style={styles.acceso}
              activeOpacity={0.85}
              onPress={() => router.push(acceso.ruta as never)}
            >
              <Ionicons
                name={acceso.icono}
                size={24}
                color="#61CF5A"
                style={styles.accesoIcono}
              />
              <Text style={styles.accesoTitulo}>{acceso.titulo}</Text>
              <Text style={styles.accesoDetalle}>{acceso.detalle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tip}>
          <Ionicons name="terminal-outline" size={14} color="#50864C" />
          <Text style={styles.tipTexto}>
            Consejo: usa la pestaña Buscar para encontrar cualquier técnica por
            nombre, categoría o etiqueta.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#050805',
    paddingHorizontal: 20,
  },

  contenido: {
    paddingBottom: 40,
  },

  header: {
    marginBottom: 22,
  },

  logo: {
    color: '#61CF5A',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 1,
  },

  subtitulo: {
    color: '#50864C',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 5,
  },

  hero: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 12,
    padding: 18,
  },

  heroEtiqueta: {
    color: '#61CF5A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },

  heroTitulo: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
  },

  heroTexto: {
    color: '#63AD58',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },

  reto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#61CF5A',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },

  retoIcono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#050805',
    alignItems: 'center',
    justifyContent: 'center',
  },

  retoTexto: {
    flex: 1,
  },

  retoEtiqueta: {
    color: '#050805',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  retoTitulo: {
    color: '#050805',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },

  retoDetalle: {
    color: '#3B4B33',
    fontSize: 11,
    marginTop: 2,
  },

  seccion: {
    color: '#50864C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 28,
    marginBottom: 12,
  },

  accesos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  acceso: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 10,
    padding: 14,
  },

  accesoIcono: {
    marginBottom: 10,
  },

  accesoTitulo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  accesoDetalle: {
    color: '#63AD58',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },

  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 24,
  },

  tipTexto: {
    color: '#50864C',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
