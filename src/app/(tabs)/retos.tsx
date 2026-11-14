import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUsuario } from '../../services/auth';
import {
  BONUS_RETO_COMPLETO,
  PUNTOS_POR_ACIERTO,
  calcularRacha,
  claveDelDia,
  guardarProgreso,
  seleccionarRetosDelDia,
  subscribeProgreso,
  subscribeRetos,
} from '../../services/retos';
import type { ProgresoRetos, ResultadoReto, Reto } from '../../types/reto';

type Pantalla = 'inicio' | 'jugando' | 'resumen';

export default function Retos() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uid, cargando: cargandoAuth } = useUsuario();

  const [retos, setRetos] = useState<Reto[]>([]);
  const [cargandoRetos, setCargandoRetos] = useState(true);
  const [progreso, setProgreso] = useState<ProgresoRetos | null>(null);
  const [cargandoProgreso, setCargandoProgreso] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [correctas, setCorrectas] = useState(0);
  const [resultadoLocal, setResultadoLocal] = useState<ResultadoReto | null>(null);
  const [guardando, setGuardando] = useState(false);

  const hoy = claveDelDia();
  const retosDelDia = useMemo(() => seleccionarRetosDelDia(retos), [retos]);
  const total = retosDelDia.length;
  const retoActual = retosDelDia[indice] ?? null;
  const completadoHoy =
    progreso?.hoy?.fecha === hoy && progreso.hoy?.completado === true;
  const resultado: ResultadoReto | null = completadoHoy
    ? progreso?.hoy ?? null
    : resultadoLocal;
  const mostrarResumen =
    pantalla === 'resumen' || (completadoHoy && pantalla === 'inicio');
  const cargando =
    cargandoAuth || cargandoRetos || (Boolean(uid) && cargandoProgreso);

  useEffect(() => {
    return subscribeRetos(
      (lista) => {
        setRetos(lista);
        setCargandoRetos(false);
      },
      (e) => {
        setError(e.message);
        setCargandoRetos(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!uid) {
      setProgreso(null);
      setCargandoProgreso(false);
      return;
    }

    setCargandoProgreso(true);
    return subscribeProgreso(
      uid,
      (valor) => {
        setProgreso(valor);
        setCargandoProgreso(false);
      },
      (e) => {
        setError(e.message);
        setCargandoProgreso(false);
      }
    );
  }, [uid]);

  const comenzar = useCallback(() => {
    setIndice(0);
    setSeleccion(null);
    setRespondido(false);
    setCorrectas(0);
    setResultadoLocal(null);
    setError(null);
    setPantalla('jugando');
  }, []);

  const responder = (opcion: number) => {
    if (respondido || !retoActual) return;

    setSeleccion(opcion);
    setRespondido(true);

    if (opcion === retoActual.correcta) {
      setCorrectas((valor) => valor + 1);
    }
  };

  const finalizar = async () => {
    const aciertos = correctas;
    const puntos =
      aciertos * PUNTOS_POR_ACIERTO +
      (total > 0 && aciertos === total ? BONUS_RETO_COMPLETO : 0);

    const nuevoResultado: ResultadoReto = {
      fecha: hoy,
      completado: true,
      correctas: aciertos,
      total,
      puntos,
    };

    setResultadoLocal(nuevoResultado);
    setPantalla('resumen');

    if (!uid) return;

    setGuardando(true);
    try {
      const nuevoProgreso: ProgresoRetos = {
        puntosTotales: (progreso?.puntosTotales ?? 0) + puntos,
        racha: calcularRacha(progreso, hoy),
        ultimaFecha: hoy,
        hoy: nuevoResultado,
      };
      await guardarProgreso(uid, nuevoProgreso);
      setProgreso(nuevoProgreso);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo guardar tu progreso.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const siguiente = async () => {
    if (indice + 1 < total) {
      setIndice((valor) => valor + 1);
      setSeleccion(null);
      setRespondido(false);
      return;
    }

    await finalizar();
  };

  const racha = progreso?.racha ?? 0;
  const puntosTotales = progreso?.puntosTotales ?? 0;

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>$ DAILY_CHALLENGE_</Text>
          <Text style={styles.subtitulo}>RETO DIARIO · PUNTOS Y RACHA</Text>
        </View>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Ionicons name="flame-outline" size={14} color="#63AD58" />
            <Text style={styles.chipTexto}>RACHA {racha}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="trophy-outline" size={14} color="#61CF5A" />
            <Text style={styles.chipTexto}>PUNTOS {puntosTotales}</Text>
          </View>
          {!uid ? <Text style={styles.invitado}>MODO INVITADO</Text> : null}
        </View>

        {cargando ? (
          <ActivityIndicator style={styles.cargando} color="#61CF5A" size="large" />
        ) : error ? (
          <View style={styles.errorCaja}>
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        ) : total === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Sin retos publicados</Text>
            <Text style={styles.cardTexto}>
              Todavía no hay preguntas en la base. Ejecuta
              `scripts/seed-retos.mjs` para cargar el banco de retos.
            </Text>
          </View>
        ) : mostrarResumen && resultado ? (
          <VistaResumen
            resultado={resultado}
            racha={racha}
            invitado={!uid}
            guardando={guardando}
            onExplorar={() => router.push('/comandos')}
          />
        ) : pantalla === 'jugando' && retoActual ? (
          <VistaJugando
            reto={retoActual}
            indice={indice}
            total={total}
            seleccion={seleccion}
            respondido={respondido}
            onResponder={responder}
            onSiguiente={siguiente}
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardEtiqueta}>RETO DE HOY · {hoy}</Text>
            <Text style={styles.cardTitulo}>{total} preguntas de ciberseguridad</Text>
            <Text style={styles.cardTexto}>
              Acierta para sumar {PUNTOS_POR_ACIERTO} puntos por pregunta. Si
              completas todas sin fallar, ganas {BONUS_RETO_COMPLETO} extra.
            </Text>

            <View style={styles.recompensas}>
              <View style={styles.recompensa}>
                <Ionicons name="help-circle-outline" size={16} color="#61CF5A" />
                <Text style={styles.recompensaTexto}>{total} preguntas</Text>
              </View>
              <View style={styles.recompensa}>
                <Ionicons name="star-outline" size={16} color="#61CF5A" />
                <Text style={styles.recompensaTexto}>
                  {total * PUNTOS_POR_ACIERTO} pts
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.botonPrimario} onPress={comenzar}>
              <Ionicons name="play-outline" size={18} color="#050805" />
              <Text style={styles.botonPrimarioTexto}>COMENZAR RETO</Text>
            </TouchableOpacity>

            {!uid ? (
              <Text style={styles.aviso}>
                Inicia sesión para guardar puntos y racha.
              </Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function VistaJugando({
  reto,
  indice,
  total,
  seleccion,
  respondido,
  onResponder,
  onSiguiente,
}: {
  reto: Reto;
  indice: number;
  total: number;
  seleccion: number | null;
  respondido: boolean;
  onResponder: (opcion: number) => void;
  onSiguiente: () => void;
}) {
  const progresoBarra = ((indice + (respondido ? 1 : 0)) / total) * 100;
  const acerto = respondido && seleccion === reto.correcta;

  return (
    <View>
      <View style={styles.barraFondo}>
        <View style={[styles.barraRelleno, { width: `${progresoBarra}%` }]} />
      </View>

      <Text style={styles.contador}>
        PREGUNTA {indice + 1} / {total} · {reto.categoria}
      </Text>

      <View style={styles.card}>
        <Text style={styles.pregunta}>{reto.pregunta}</Text>

        <View style={styles.opciones}>
          {reto.opciones.map((opcion, posicion) => {
            const esCorrecta = posicion === reto.correcta;
            const esSeleccionada = posicion === seleccion;

            return (
              <TouchableOpacity
                key={`${reto.id}-${posicion}`}
                style={[
                  styles.opcion,
                  respondido && esCorrecta && styles.opcionCorrecta,
                  respondido &&
                    esSeleccionada &&
                    !esCorrecta &&
                    styles.opcionIncorrecta,
                ]}
                onPress={() => onResponder(posicion)}
                disabled={respondido}
                activeOpacity={0.8}
              >
                <Text style={styles.letra}>
                  {String.fromCharCode(65 + posicion)}
                </Text>
                <Text style={styles.opcionTexto}>{opcion}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {respondido ? (
          <View
            style={[
              styles.explicacionCaja,
              acerto ? styles.explicacionOk : styles.explicacionMal,
            ]}
          >
            <Text style={styles.explicacionTitulo}>
              {acerto ? '¡CORRECTO!' : 'INCORRECTO'}
            </Text>
            {reto.explicacion ? (
              <Text style={styles.explicacionTexto}>{reto.explicacion}</Text>
            ) : null}
          </View>
        ) : null}

        {respondido ? (
          <TouchableOpacity style={styles.botonPrimario} onPress={onSiguiente}>
            <Text style={styles.botonPrimarioTexto}>
              {indice + 1 < total ? 'SIGUIENTE PREGUNTA' : 'VER RESULTADO'}
            </Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#050805" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function VistaResumen({
  resultado,
  racha,
  invitado,
  guardando,
  onExplorar,
}: {
  resultado: ResultadoReto;
  racha: number;
  invitado: boolean;
  guardando: boolean;
  onExplorar: () => void;
}) {
  const perfecto = resultado.correctas === resultado.total;

  return (
    <View style={styles.card}>
      <View style={styles.trofeo}>
        <Ionicons
          name={perfecto ? 'trophy' : 'checkmark-circle-outline'}
          size={54}
          color="#61CF5A"
        />
      </View>

      <Text style={styles.resumenTitulo}>
        {perfecto ? '¡RETO PERFECTO!' : 'RETO COMPLETADO'}
      </Text>
      <Text style={styles.resumenSubtitulo}>
        {resultado.correctas} de {resultado.total} respuestas correctas
      </Text>

      <View style={styles.resumenDatos}>
        <View style={styles.resumenDato}>
          <Text style={styles.resumenNumero}>+{resultado.puntos}</Text>
          <Text style={styles.resumenEtiqueta}>PUNTOS</Text>
        </View>
        <View style={styles.resumenDato}>
          <Text style={styles.resumenNumero}>{racha}</Text>
          <Text style={styles.resumenEtiqueta}>RACHA</Text>
        </View>
      </View>

      {guardando ? (
        <ActivityIndicator color="#61CF5A" style={styles.guardando} />
      ) : null}

      {invitado ? (
        <Text style={styles.aviso}>
          Inicia sesión para guardar tus puntos y mantener la racha.
        </Text>
      ) : (
        <Text style={styles.aviso}>
          Vuelve mañana para mantener tu racha de {racha}.
        </Text>
      )}

      <TouchableOpacity style={styles.botonPrimario} onPress={onExplorar}>
        <Ionicons name="terminal-outline" size={18} color="#050805" />
        <Text style={styles.botonPrimarioTexto}>EXPLORAR COMANDOS</Text>
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

  contenido: {
    paddingBottom: 40,
  },

  header: {
    marginBottom: 16,
  },

  logo: {
    color: '#61CF5A',
    fontSize: 24,
    fontWeight: '900',
  },

  subtitulo: {
    color: '#50864C',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 5,
  },

  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  chipTexto: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  invitado: {
    color: '#50864C',
    fontSize: 9,
    letterSpacing: 1,
    marginLeft: 'auto',
  },

  cargando: {
    marginTop: 40,
  },

  card: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 12,
    padding: 18,
  },

  cardEtiqueta: {
    color: '#61CF5A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },

  cardTitulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },

  cardTexto: {
    color: '#63AD58',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },

  recompensas: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 16,
  },

  recompensa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  recompensaTexto: {
    color: '#63AD58',
    fontSize: 11,
    fontWeight: '700',
  },

  botonPrimario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#61CF5A',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 18,
  },

  botonPrimarioTexto: {
    color: '#050805',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  aviso: {
    color: '#50864C',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
    textAlign: 'center',
  },

  barraFondo: {
    height: 5,
    backgroundColor: '#3E6A3D',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },

  barraRelleno: {
    height: '100%',
    backgroundColor: '#61CF5A',
  },

  contador: {
    color: '#50864C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  pregunta: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
    marginBottom: 18,
  },

  opciones: {
    gap: 10,
  },

  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#3E6A3D',
    backgroundColor: '#050805',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  opcionCorrecta: {
    borderColor: '#61CF5A',
    backgroundColor: '#050805',
  },

  opcionIncorrecta: {
    borderColor: '#FF5C5C',
    backgroundColor: '#1A0A0A',
  },

  letra: {
    color: '#61CF5A',
    fontSize: 12,
    fontWeight: '900',
    width: 16,
  },

  opcionTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  explicacionCaja: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginTop: 16,
  },

  explicacionOk: {
    borderColor: '#3E6A3D',
    backgroundColor: '#050805',
  },

  explicacionMal: {
    borderColor: '#5C1F1F',
    backgroundColor: '#1A0A0A',
  },

  explicacionTitulo: {
    color: '#61CF5A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 5,
  },

  explicacionTexto: {
    color: '#63AD58',
    fontSize: 12,
    lineHeight: 18,
  },

  trofeo: {
    alignItems: 'center',
    marginBottom: 10,
  },

  resumenTitulo: {
    color: '#61CF5A',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },

  resumenSubtitulo: {
    color: '#63AD58',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },

  resumenDatos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 20,
  },

  resumenDato: {
    alignItems: 'center',
  },

  resumenNumero: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },

  resumenEtiqueta: {
    color: '#50864C',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  guardando: {
    marginTop: 16,
  },

  errorCaja: {
    backgroundColor: '#1A0A0A',
    borderWidth: 1,
    borderColor: '#5C1F1F',
    borderRadius: 8,
    padding: 12,
  },

  errorTexto: {
    color: '#FF8A8A',
    fontSize: 12,
    lineHeight: 17,
  },
});
