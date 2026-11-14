import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

type InfoCategoria = {
  icono: NombreIcono;
  descripcion: string;
};

/** Iconos y descripciones por categoría. Las desconocidas usan el icono por defecto. */
export const CATEGORIAS: Record<string, InfoCategoria> = {
  NETWORKING: {
    icono: 'git-network-outline',
    descripcion: 'Redes, conexiones y protocolos',
  },
  LINUX: {
    icono: 'logo-tux',
    descripcion: 'Comandos y herramientas de Linux',
  },
  WINDOWS: {
    icono: 'logo-windows',
    descripcion: 'Administración del sistema Windows',
  },
  SECURITY: {
    icono: 'shield-checkmark-outline',
    descripcion: 'Seguridad, ataques y defensa',
  },
  RECON: {
    icono: 'search-circle-outline',
    descripcion: 'Reconocimiento y OSINT',
  },
  KALI: {
    icono: 'skull-outline',
    descripcion: 'Herramientas de Kali Linux',
  },
};

export const CATEGORIA_POR_DEFECTO: InfoCategoria = {
  icono: 'terminal-outline',
  descripcion: 'Comandos y técnicas',
};

export function infoCategoria(categoria: string): InfoCategoria {
  return CATEGORIAS[categoria.toUpperCase()] ?? CATEGORIA_POR_DEFECTO;
}
