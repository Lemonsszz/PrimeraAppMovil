import type { Dificultad } from './contenido';

/** Pregunta del reto diario. */
export type Reto = {
  id: string;
  pregunta: string;
  opciones: string[];
  /** Índice de la opción correcta dentro de `opciones`. */
  correcta: number;
  explicacion: string;
  categoria: string;
  dificultad?: Dificultad;
  puntos: number;
};

/** Resultado de un reto completado. */
export type ResultadoReto = {
  fecha: string;
  completado: boolean;
  correctas: number;
  total: number;
  puntos: number;
};

/** Progreso del usuario en `progreso/{uid}/retos`. */
export type ProgresoRetos = {
  puntosTotales: number;
  racha: number;
  /** Última fecha (YYYY-MM-DD) en la que completó un reto. */
  ultimaFecha: string | null;
  hoy: ResultadoReto | null;
};
