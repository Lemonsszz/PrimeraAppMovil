import { onValue, ref, set } from 'firebase/database';

import { database } from '../firebaseconfig';
import type { Dificultad } from '../types/contenido';
import type { ProgresoRetos, ResultadoReto, Reto } from '../types/reto';

type Registro = Record<string, unknown>;
type Desuscribir = () => void;

export const RETOS_POR_DIA = 5;
export const PUNTOS_POR_ACIERTO = 10;
export const BONUS_RETO_COMPLETO = 20;

const DIFICULTADES: readonly Dificultad[] = ['basico', 'intermedio', 'avanzado'];

const texto = (valor: unknown): string =>
  typeof valor === 'string' ? valor.trim() : '';

function listaOpciones(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map(texto).filter(Boolean);
  if (valor && typeof valor === 'object') {
    return Object.values(valor as Registro).map(texto).filter(Boolean);
  }
  return [];
}

function indiceCorrecto(valor: unknown, total: number): number {
  if (typeof valor === 'number' && Number.isInteger(valor) && valor >= 0 && valor < total) {
    return valor;
  }

  const normalizado = texto(valor);
  if (/^\d+$/.test(normalizado)) {
    const numero = Number(normalizado);
    if (numero >= 0 && numero < total) return numero;
  }

  if (/^[a-dA-D]$/.test(normalizado)) {
    const numero = normalizado.toUpperCase().charCodeAt(0) - 65;
    if (numero >= 0 && numero < total) return numero;
  }

  return 0;
}

export function normalizarReto(id: string, raw: unknown): Reto {
  const registro: Registro = raw && typeof raw === 'object' ? (raw as Registro) : {};
  const opciones = listaOpciones(registro.opciones ?? registro.respuestas ?? registro.options);

  return {
    id,
    pregunta:
      texto(registro.pregunta) || texto(registro.titulo) || 'Pregunta sin título',
    opciones,
    correcta: indiceCorrecto(registro.correcta ?? registro.respuesta, opciones.length),
    explicacion: texto(registro.explicacion) || texto(registro.detalle),
    categoria: texto(registro.categoria) || 'SECURITY',
    dificultad: DIFICULTADES.includes(texto(registro.dificultad).toLowerCase() as Dificultad)
      ? (texto(registro.dificultad).toLowerCase() as Dificultad)
      : undefined,
    puntos:
      typeof registro.puntos === 'number' && registro.puntos > 0
        ? registro.puntos
        : PUNTOS_POR_ACIERTO,
  };
}

/** Escucha el banco de preguntas y entrega la lista normalizada. */
export function subscribeRetos(
  onData: (retos: Reto[]) => void,
  onError?: (error: Error) => void
): Desuscribir {
  return onValue(
    ref(database, 'retos'),
    (snapshot) => {
      const datos = snapshot.val() as Registro | null;
      const lista = datos
        ? Object.entries(datos).map(([id, raw]) => normalizarReto(id, raw))
        : [];

      lista.sort(
        (a, b) =>
          a.categoria.localeCompare(b.categoria, 'es') || a.id.localeCompare(b.id, 'es')
      );

      onData(lista.filter((reto) => reto.opciones.length >= 2));
    },
    (error) => onError?.(error as Error)
  );
}

/** Fecha local en formato YYYY-MM-DD (clave del reto diario). */
export function claveDelDia(fecha: Date = new Date()): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Hash FNV-1a: mismo día + mismo id => misma posición. */
function hash(textoEntrada: string): number {
  let valor = 2166136261;
  for (let i = 0; i < textoEntrada.length; i += 1) {
    valor ^= textoEntrada.charCodeAt(i);
    valor = Math.imul(valor, 16777619);
  }
  return valor >>> 0;
}

/**
 * Selecciona las preguntas del día de forma determinista: todos los usuarios
 * reciben el mismo reto y cambia automáticamente cada día.
 */
export function seleccionarRetosDelDia(
  retos: Reto[],
  fecha: Date = new Date(),
  cantidad: number = RETOS_POR_DIA
): Reto[] {
  const clave = claveDelDia(fecha);
  return [...retos]
    .sort((a, b) => hash(`${clave}:${a.id}`) - hash(`${clave}:${b.id}`))
    .slice(0, Math.min(cantidad, retos.length));
}

function normalizarResultado(valor: unknown): ResultadoReto | null {
  if (!valor || typeof valor !== 'object') return null;
  const registro = valor as Registro;
  const fecha = texto(registro.fecha);
  if (!fecha) return null;

  return {
    fecha,
    completado: registro.completado === true,
    correctas: typeof registro.correctas === 'number' ? registro.correctas : 0,
    total: typeof registro.total === 'number' ? registro.total : RETOS_POR_DIA,
    puntos: typeof registro.puntos === 'number' ? registro.puntos : 0,
  };
}

function normalizarProgreso(valor: unknown): ProgresoRetos | null {
  if (!valor || typeof valor !== 'object') return null;
  const registro = valor as Registro;

  return {
    puntosTotales: typeof registro.puntosTotales === 'number' ? registro.puntosTotales : 0,
    racha: typeof registro.racha === 'number' ? registro.racha : 0,
    ultimaFecha: texto(registro.ultimaFecha) || null,
    hoy: normalizarResultado(registro.hoy),
  };
}

export function subscribeProgreso(
  uid: string,
  onData: (progreso: ProgresoRetos | null) => void,
  onError?: (error: Error) => void
): Desuscribir {
  return onValue(
    ref(database, `progreso/${uid}/retos`),
    (snapshot) => onData(normalizarProgreso(snapshot.val())),
    (error) => onError?.(error as Error)
  );
}

export async function guardarProgreso(
  uid: string,
  progreso: ProgresoRetos
): Promise<void> {
  await set(ref(database, `progreso/${uid}/retos`), progreso);
}

/** Racha que corresponde al completar el reto hoy. */
export function calcularRacha(
  progreso: ProgresoRetos | null,
  hoy: string = claveDelDia()
): number {
  if (!progreso?.ultimaFecha) return 1;
  if (progreso.ultimaFecha === hoy) return Math.max(progreso.racha, 1);

  const ayer = claveDelDia(new Date(Date.now() - 24 * 60 * 60 * 1000));
  return progreso.ultimaFecha === ayer ? progreso.racha + 1 : 1;
}
