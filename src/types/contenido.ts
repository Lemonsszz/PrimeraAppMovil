/** Tipos del contenido del "santuario" (comandos, estrategias, payloads...). */

export type TipoContenido =
  | 'comando'
  | 'estrategia'
  | 'payload'
  | 'herramienta'
  | 'cheatsheet';

export type Dificultad = 'basico' | 'intermedio' | 'avanzado';
export type NivelRiesgo = 'bajo' | 'medio' | 'alto';

export type PasoEstrategia = {
  titulo?: string;
  detalle?: string;
  comando?: string;
};

export type Contenido = {
  id: string;
  tipo: TipoContenido;
  titulo: string;
  resumen: string;
  categoria: string;
  plataformas: string[];
  /** Comando ejecutable o cuerpo principal. */
  cuerpo?: string;
  ejemplo?: string;
  /** Solo para estrategias. */
  pasos?: PasoEstrategia[];
  dificultad?: Dificultad;
  tags: string[];
  riesgo?: NivelRiesgo;
  referencias?: string[];
  nota?: string;
  advertencia?: string;
  creadoPor?: string;
  creadoEn?: number;
  actualizadoEn?: number;
};

/** Datos que se envían a la base al crear o editar un contenido (sin ID ni fechas). */
export type DatosContenido = Omit<
  Contenido,
  'id' | 'creadoPor' | 'creadoEn' | 'actualizadoEn'
>;
