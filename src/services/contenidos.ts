import { get, onValue, ref, remove, set, update } from 'firebase/database';

import { database } from '../firebaseconfig';
import type {
  Contenido,
  DatosContenido,
  Dificultad,
  NivelRiesgo,
  PasoEstrategia,
  TipoContenido,
} from '../types/contenido';

type Registro = Record<string, unknown>;
type Desuscribir = () => void;

const TIPOS: readonly TipoContenido[] = [
  'comando',
  'estrategia',
  'payload',
  'herramienta',
  'cheatsheet',
];
const DIFICULTADES: readonly Dificultad[] = ['basico', 'intermedio', 'avanzado'];
const RIESGOS: readonly NivelRiesgo[] = ['bajo', 'medio', 'alto'];

const texto = (valor: unknown): string =>
  typeof valor === 'string' ? valor.trim() : '';

function primerTexto(registro: Registro, claves: string[]): string {
  for (const clave of claves) {
    const valor = texto(registro[clave]);
    if (valor) return valor;
  }
  return '';
}

function listaTexto(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.map(texto).filter(Boolean);
  }
  if (typeof valor === 'string') {
    return valor
      .split(',')
      .map((parte) => parte.trim())
      .filter(Boolean);
  }
  return [];
}

function listaDe(registro: Registro, claves: string[]): string[] {
  for (const clave of claves) {
    const lista = listaTexto(registro[clave]);
    if (lista.length > 0) return lista;
  }
  return [];
}

function valorDe<T extends string>(
  valor: unknown,
  permitidos: readonly T[]
): T | undefined {
  const normalizado = texto(valor).toLowerCase();
  return (permitidos as readonly string[]).includes(normalizado)
    ? (normalizado as T)
    : undefined;
}

function pasosDe(valor: unknown): PasoEstrategia[] | undefined {
  if (Array.isArray(valor)) {
    const pasos = valor
      .map((paso) => {
        if (!paso || typeof paso !== 'object') return null;
        const registro = paso as Registro;
        const normalizado: PasoEstrategia = {
          titulo: primerTexto(registro, ['titulo', 'nombre', 'title']) || undefined,
          detalle:
            primerTexto(registro, ['detalle', 'descripcion', 'descripción', 'description']) ||
            undefined,
          comando:
            primerTexto(registro, ['comando', 'comandoEjemplo', 'command']) || undefined,
        };
        return normalizado.titulo || normalizado.detalle || normalizado.comando
          ? normalizado
          : null;
      })
      .filter((paso): paso is PasoEstrategia => paso !== null);

    return pasos.length > 0 ? pasos : undefined;
  }

  const unico = texto(valor);
  return unico ? [{ detalle: unico }] : undefined;
}

/**
 * Convierte un registro tal como viene de la base en un `Contenido` tipado.
 * Es tolerante con el esquema antiguo (`nombre`, `descripcion`, `categeoria`...).
 */
export function normalizarContenido(id: string, raw: unknown): Contenido {
  const registro: Registro = raw && typeof raw === 'object' ? (raw as Registro) : {};

  return {
    id,
    tipo: valorDe(registro.tipo, TIPOS) ?? 'comando',
    titulo:
      primerTexto(registro, ['titulo', 'nombre', 'title', 'comando']) || 'Sin título',
    resumen: primerTexto(registro, [
      'resumen',
      'descripcion',
      'descripción',
      'descripcio',
      'description',
    ]),
    categoria: primerTexto(registro, ['categoria', 'categeoria', 'category']) || 'SIN CATEGORÍA',
    plataformas: listaDe(registro, ['plataformas', 'plataforma', 'platform', 'platforms']).map(
      (plataforma) => plataforma.toLowerCase()
    ),
    cuerpo: primerTexto(registro, ['cuerpo', 'comandoEjemplo', 'command']) || undefined,
    ejemplo: primerTexto(registro, ['ejemplo', 'example', 'uso']) || undefined,
    pasos: pasosDe(registro.pasos),
    dificultad: valorDe(registro.dificultad, DIFICULTADES),
    tags: listaDe(registro, ['tags', 'etiquetas']),
    riesgo: valorDe(registro.riesgo, RIESGOS),
    referencias: listaDe(registro, ['referencias', 'references']),
    nota: primerTexto(registro, ['nota', 'note']) || undefined,
    advertencia: primerTexto(registro, ['advertencia', 'warning']) || undefined,
    creadoPor: primerTexto(registro, ['creadoPor']) || undefined,
    creadoEn: typeof registro.creadoEn === 'number' ? registro.creadoEn : undefined,
    actualizadoEn:
      typeof registro.actualizadoEn === 'number' ? registro.actualizadoEn : undefined,
  };
}

/** Escucha cambios del nodo `contenidos` y entrega la lista ya normalizada. */
export function subscribeContenidos(
  onData: (contenidos: Contenido[]) => void,
  onError?: (error: Error) => void
): Desuscribir {
  return onValue(
    ref(database, 'contenidos'),
    (snapshot) => {
      const datos = snapshot.val() as Registro | null;
      const lista = datos
        ? Object.entries(datos).map(([id, raw]) => normalizarContenido(id, raw))
        : [];

      lista.sort(
        (a, b) =>
          a.categoria.localeCompare(b.categoria, 'es') ||
          a.titulo.localeCompare(b.titulo, 'es')
      );

      onData(lista);
    },
    (error) => onError?.(error as Error)
  );
}

/** Escucha un contenido concreto por su ID. Entrega `null` si ya no existe. */
export function subscribeContenido(
  id: string,
  onData: (contenido: Contenido | null) => void,
  onError?: (error: Error) => void
): Desuscribir {
  return onValue(
    ref(database, `contenidos/${id}`),
    (snapshot) => {
      const raw = snapshot.val();
      onData(raw ? normalizarContenido(id, raw) : null);
    },
    (error) => onError?.(error as Error)
  );
}

/** Búsqueda local por varios términos (todos deben aparecer). */
export function filtrarContenidos(lista: Contenido[], consulta: string): Contenido[] {
  const terminos = consulta.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terminos.length === 0) return lista;

  return lista.filter((contenido) => {
    const textoBuscable = [
      contenido.titulo,
      contenido.resumen,
      contenido.categoria,
      contenido.cuerpo ?? '',
      contenido.ejemplo ?? '',
      contenido.dificultad ?? '',
      ...contenido.plataformas,
      ...contenido.tags,
    ]
      .join(' ')
      .toLowerCase();

    return terminos.every((termino) => textoBuscable.includes(termino));
  });
}

function textoONull(valor: string | undefined): string | null {
  const limpio = valor?.trim();
  return limpio ? limpio : null;
}

function listaONull(valor: string[] | undefined): string[] | null {
  const limpia = (valor ?? []).map((item) => item.trim()).filter(Boolean);
  return limpia.length > 0 ? limpia : null;
}

function pasosLimpios(
  pasos: PasoEstrategia[] | undefined
): PasoEstrategia[] | null {
  const limpios = (pasos ?? [])
    .map((paso) => ({
      titulo: paso.titulo?.trim() || undefined,
      detalle: paso.detalle?.trim() || undefined,
      comando: paso.comando?.trim() || undefined,
    }))
    .filter((paso) => paso.titulo || paso.detalle || paso.comando);

  return limpios.length > 0 ? limpios : null;
}

function cargaUtil(datos: DatosContenido): Record<string, unknown> {
  return {
    tipo: datos.tipo,
    titulo: datos.titulo.trim(),
    resumen: datos.resumen.trim(),
    categoria: datos.categoria.trim().toUpperCase(),
    plataformas: listaONull(datos.plataformas) ?? [],
    tags: listaONull(datos.tags) ?? [],
    cuerpo: textoONull(datos.cuerpo),
    ejemplo: textoONull(datos.ejemplo),
    dificultad: datos.dificultad ?? null,
    riesgo: datos.riesgo ?? null,
    advertencia: textoONull(datos.advertencia),
    nota: textoONull(datos.nota),
    referencias: listaONull(datos.referencias),
    pasos: datos.tipo === 'estrategia' ? pasosLimpios(datos.pasos) : null,
  };
}

/** Calcula el siguiente ID `C0NN` a partir de los contenidos existentes. */
async function siguienteId(): Promise<string> {
  const snapshot = await get(ref(database, 'contenidos'));
  const datos = snapshot.val() as Record<string, unknown> | null;

  let maximo = 0;
  for (const clave of Object.keys(datos ?? {})) {
    const coincidencia = /^C(\d+)$/i.exec(clave);
    if (coincidencia) {
      maximo = Math.max(maximo, Number(coincidencia[1]));
    }
  }

  return `C${String(maximo + 1).padStart(3, '0')}`;
}

/** Crea un contenido y devuelve su ID. Requiere sesión iniciada. */
export async function crearContenido(
  datos: DatosContenido,
  uid: string
): Promise<string> {
  const id = await siguienteId();
  const ahora = Date.now();

  await set(ref(database, `contenidos/${id}`), {
    ...cargaUtil(datos),
    creadoPor: uid,
    creadoEn: ahora,
    actualizadoEn: ahora,
  });

  return id;
}

/** Actualiza un contenido existente. Los campos vacíos se eliminan. */
export async function actualizarContenido(
  id: string,
  datos: DatosContenido
): Promise<void> {
  await update(ref(database, `contenidos/${id}`), {
    ...cargaUtil(datos),
    actualizadoEn: Date.now(),
  });
}

/** Elimina un contenido por su ID. */
export async function eliminarContenido(id: string): Promise<void> {
  await remove(ref(database, `contenidos/${id}`));
}
