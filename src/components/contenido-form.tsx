import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { CATEGORIAS } from '../constants/categorias';
import type {
  Contenido,
  DatosContenido,
  Dificultad,
  NivelRiesgo,
  PasoEstrategia,
  TipoContenido,
} from '../types/contenido';

const TIPOS: { valor: TipoContenido; etiqueta: string }[] = [
  { valor: 'comando', etiqueta: 'Comando' },
  { valor: 'estrategia', etiqueta: 'Estrategia' },
  { valor: 'payload', etiqueta: 'Payload' },
  { valor: 'herramienta', etiqueta: 'Herramienta' },
  { valor: 'cheatsheet', etiqueta: 'Cheatsheet' },
];

const DIFICULTADES: { valor: Dificultad; etiqueta: string }[] = [
  { valor: 'basico', etiqueta: 'Básico' },
  { valor: 'intermedio', etiqueta: 'Intermedio' },
  { valor: 'avanzado', etiqueta: 'Avanzado' },
];

const RIESGOS: { valor: NivelRiesgo; etiqueta: string }[] = [
  { valor: 'bajo', etiqueta: 'Bajo' },
  { valor: 'medio', etiqueta: 'Medio' },
  { valor: 'alto', etiqueta: 'Alto' },
];

const CATEGORIAS_ORDENADAS = Object.keys(CATEGORIAS).sort((a, b) =>
  a.localeCompare(b, 'es')
);

function dividir(valor: string): string[] {
  return valor
    .split(/[,\n]/)
    .map((parte) => parte.trim())
    .filter(Boolean);
}

function unir(lista: string[] | undefined): string {
  return (lista ?? []).join(', ');
}

type Props = {
  inicial?: Contenido | null;
  guardando: boolean;
  error?: string | null;
  onGuardar: (datos: DatosContenido) => void;
  onCancelar: () => void;
};

export function ContenidoForm({
  inicial,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: Props) {
  const [tipo, setTipo] = useState<TipoContenido>(inicial?.tipo ?? 'comando');
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [resumen, setResumen] = useState(inicial?.resumen ?? '');
  const [categoria, setCategoria] = useState(
    (inicial?.categoria ?? CATEGORIAS_ORDENADAS[0] ?? 'LINUX').toUpperCase()
  );
  const [plataformas, setPlataformas] = useState(unir(inicial?.plataformas));
  const [cuerpo, setCuerpo] = useState(inicial?.cuerpo ?? '');
  const [ejemplo, setEjemplo] = useState(inicial?.ejemplo ?? '');
  const [dificultad, setDificultad] = useState<Dificultad | ''>(
    inicial?.dificultad ?? ''
  );
  const [riesgo, setRiesgo] = useState<NivelRiesgo | ''>(inicial?.riesgo ?? '');
  const [tags, setTags] = useState(unir(inicial?.tags));
  const [advertencia, setAdvertencia] = useState(inicial?.advertencia ?? '');
  const [nota, setNota] = useState(inicial?.nota ?? '');
  const [referencias, setReferencias] = useState(
    (inicial?.referencias ?? []).join('\n')
  );
  const [pasos, setPasos] = useState<PasoEstrategia[]>(inicial?.pasos ?? []);

  const [validacion, setValidacion] = useState<string | null>(null);

  const actualizarPaso = (
    indice: number,
    campo: keyof PasoEstrategia,
    valor: string
  ) => {
    setPasos((actuales) =>
      actuales.map((paso, i) =>
        i === indice ? { ...paso, [campo]: valor } : paso
      )
    );
  };

  const enviar = () => {
    if (!titulo.trim()) {
      setValidacion('El título es obligatorio.');
      return;
    }
    if (!resumen.trim()) {
      setValidacion('El resumen es obligatorio.');
      return;
    }
    if (!categoria) {
      setValidacion('Selecciona una categoría.');
      return;
    }

    setValidacion(null);

    onGuardar({
      tipo,
      titulo: titulo.trim(),
      resumen: resumen.trim(),
      categoria,
      plataformas: dividir(plataformas),
      cuerpo: cuerpo.trim() || undefined,
      ejemplo: ejemplo.trim() || undefined,
      dificultad: dificultad || undefined,
      riesgo: riesgo || undefined,
      tags: dividir(tags),
      advertencia: advertencia.trim() || undefined,
      nota: nota.trim() || undefined,
      referencias: dividir(referencias),
      pasos: tipo === 'estrategia' ? pasos : undefined,
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scroll}
    >
      {validacion || error ? (
        <View style={styles.errorCaja}>
          <Ionicons name="alert-circle-outline" size={16} color="#FF5252" />
          <Text style={styles.errorTexto}>{validacion ?? error}</Text>
        </View>
      ) : null}

      <Campo etiqueta="TIPO">
        <Selector
          opciones={TIPOS}
          valor={tipo}
          onCambiar={(valor) => setTipo(valor as TipoContenido)}
        />
      </Campo>

      <Campo etiqueta="TÍTULO *">
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej. Escaneo sigiloso SYN"
          placeholderTextColor="#50864C"
        />
      </Campo>

      <Campo etiqueta="CATEGORÍA *">
        <Selector
          opciones={CATEGORIAS_ORDENADAS.map((nombre) => ({
            valor: nombre,
            etiqueta: nombre,
          }))}
          valor={categoria}
          onCambiar={setCategoria}
        />
      </Campo>

      <Campo etiqueta="RESUMEN *">
        <TextInput
          style={[styles.input, styles.multilinea]}
          value={resumen}
          onChangeText={setResumen}
          placeholder="¿Qué hace y para qué sirve?"
          placeholderTextColor="#50864C"
          multiline
        />
      </Campo>

      <Campo etiqueta="PLATAFORMAS" ayuda="separadas por comas">
        <TextInput
          style={styles.input}
          value={plataformas}
          onChangeText={setPlataformas}
          placeholder="linux, windows, macos"
          placeholderTextColor="#50864C"
          autoCapitalize="none"
        />
      </Campo>

      <Campo etiqueta="CUERPO / COMANDO">
        <TextInput
          style={[styles.input, styles.multilinea, styles.codigo]}
          value={cuerpo}
          onChangeText={setCuerpo}
          placeholder="sudo nmap -sS -p- <IP>"
          placeholderTextColor="#50864C"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
      </Campo>

      <Campo etiqueta="EJEMPLO">
        <TextInput
          style={[styles.input, styles.multilinea, styles.codigo]}
          value={ejemplo}
          onChangeText={setEjemplo}
          placeholder="sudo nmap -sS -p 1-1000 192.168.1.50"
          placeholderTextColor="#50864C"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
      </Campo>

      <Campo etiqueta="DIFICULTAD">
        <Selector
          opciones={DIFICULTADES}
          valor={dificultad}
          onCambiar={(valor) => setDificultad(valor as Dificultad | '')}
          permitirVacio
        />
      </Campo>

      <Campo etiqueta="RIESGO">
        <Selector
          opciones={RIESGOS}
          valor={riesgo}
          onCambiar={(valor) => setRiesgo(valor as NivelRiesgo | '')}
          permitirVacio
        />
      </Campo>

      <Campo etiqueta="ADVERTENCIA">
        <TextInput
          style={[styles.input, styles.multilinea]}
          value={advertencia}
          onChangeText={setAdvertencia}
          placeholder="Usa solo en entornos autorizados."
          placeholderTextColor="#50864C"
          multiline
        />
      </Campo>

      <Campo etiqueta="NOTA">
        <TextInput
          style={[styles.input, styles.multilinea]}
          value={nota}
          onChangeText={setNota}
          placeholder="Detalle o aclaración opcional."
          placeholderTextColor="#50864C"
          multiline
        />
      </Campo>

      <Campo etiqueta="TAGS" ayuda="separadas por comas">
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="nmap, escaneo, puertos"
          placeholderTextColor="#50864C"
          autoCapitalize="none"
        />
      </Campo>

      <Campo etiqueta="REFERENCIAS" ayuda="una por línea">
        <TextInput
          style={[styles.input, styles.multilinea]}
          value={referencias}
          onChangeText={setReferencias}
          placeholder="https://..."
          placeholderTextColor="#50864C"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
      </Campo>

      {tipo === 'estrategia' ? (
        <Campo etiqueta="PASOS">
          {pasos.map((paso, indice) => (
            <View key={indice} style={styles.paso}>
              <View style={styles.pasoCabecera}>
                <Text style={styles.pasoNumero}>PASO {indice + 1}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setPasos((actuales) =>
                      actuales.filter((_, i) => i !== indice)
                    )
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar paso ${indice + 1}`}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF5252" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.inputPaso}
                value={paso.titulo ?? ''}
                onChangeText={(valor) => actualizarPaso(indice, 'titulo', valor)}
                placeholder="Título del paso"
                placeholderTextColor="#50864C"
              />
              <TextInput
                style={[styles.inputPaso, styles.multilineaPaso]}
                value={paso.detalle ?? ''}
                onChangeText={(valor) => actualizarPaso(indice, 'detalle', valor)}
                placeholder="Detalle"
                placeholderTextColor="#50864C"
                multiline
              />
              <TextInput
                style={[styles.inputPaso, styles.codigo]}
                value={paso.comando ?? ''}
                onChangeText={(valor) => actualizarPaso(indice, 'comando', valor)}
                placeholder="Comando (opcional)"
                placeholderTextColor="#50864C"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.agregarPaso}
            onPress={() => setPasos((actuales) => [...actuales, {}])}
          >
            <Ionicons name="add-outline" size={16} color="#61CF5A" />
            <Text style={styles.agregarPasoTexto}>AÑADIR PASO</Text>
          </TouchableOpacity>
        </Campo>
      ) : null}

      <TouchableOpacity
        style={[styles.botonGuardar, guardando && styles.botonDesactivado]}
        onPress={enviar}
        disabled={guardando}
        activeOpacity={0.85}
      >
        <Ionicons
          name={guardando ? 'hourglass-outline' : 'save-outline'}
          size={18}
          color="#050805"
        />
        <Text style={styles.botonGuardarTexto}>
          {guardando ? 'GUARDANDO...' : 'GUARDAR CONTENIDO'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonCancelar}
        onPress={onCancelar}
        disabled={guardando}
      >
        <Text style={styles.botonCancelarTexto}>CANCELAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.campo}>
      <View style={styles.campoEtiquetaFila}>
        <Text style={styles.etiqueta}>{etiqueta}</Text>
        {ayuda ? <Text style={styles.ayuda}>{ayuda}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Selector({
  opciones,
  valor,
  onCambiar,
  permitirVacio = false,
}: {
  opciones: { valor: string; etiqueta: string }[];
  valor: string;
  onCambiar: (valor: string) => void;
  permitirVacio?: boolean;
}) {
  return (
    <View style={styles.selector}>
      {permitirVacio ? (
        <Opcion
          etiqueta="—"
          activa={valor === ''}
          onPress={() => onCambiar('')}
        />
      ) : null}

      {opciones.map((opcion) => (
        <Opcion
          key={opcion.valor}
          etiqueta={opcion.etiqueta}
          activa={valor === opcion.valor}
          onPress={() => onCambiar(opcion.valor)}
        />
      ))}
    </View>
  );
}

function Opcion({
  etiqueta,
  activa,
  onPress,
}: {
  etiqueta: string;
  activa: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.opcion, activa && styles.opcionActiva]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: activa }}
    >
      <Text style={[styles.opcionTexto, activa && styles.opcionTextoActivo]}>
        {etiqueta}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 44,
  },

  errorCaja: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#FF5252',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },

  errorTexto: {
    color: '#FF5252',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  campo: {
    marginBottom: 16,
  },

  campoEtiquetaFila: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  etiqueta: {
    color: '#61CF5A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  ayuda: {
    color: '#50864C',
    fontSize: 9,
  },

  input: {
    backgroundColor: '#080D0A',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    minHeight: 44,
  },

  multilinea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },

  codigo: {
    fontFamily: 'monospace',
    color: '#61CF5A',
  },

  selector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  opcion: {
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#080D0A',
  },

  opcionActiva: {
    backgroundColor: '#61CF5A',
    borderColor: '#61CF5A',
  },

  opcionTexto: {
    color: '#63AD58',
    fontSize: 11,
    fontWeight: '700',
  },

  opcionTextoActivo: {
    color: '#050805',
  },

  paso: {
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#080D0A',
    gap: 6,
  },

  pasoCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pasoNumero: {
    color: '#61CF5A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  inputPaso: {
    backgroundColor: '#050805',
    borderWidth: 1,
    borderColor: '#3E6A3D',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    minHeight: 38,
  },

  multilineaPaso: {
    minHeight: 64,
    textAlignVertical: 'top',
  },

  agregarPaso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3E6A3D',
    borderRadius: 6,
    paddingVertical: 10,
  },

  agregarPasoTexto: {
    color: '#61CF5A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  botonGuardar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#61CF5A',
    borderRadius: 6,
    paddingVertical: 14,
    marginTop: 8,
  },

  botonDesactivado: {
    opacity: 0.6,
  },

  botonGuardarTexto: {
    color: '#050805',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },

  botonCancelar: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },

  botonCancelarTexto: {
    color: '#50864C',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
