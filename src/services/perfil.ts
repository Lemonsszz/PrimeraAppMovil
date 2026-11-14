import { updateProfile } from 'firebase/auth';
import { onValue, ref, update } from 'firebase/database';

import { auth, database } from '../firebaseconfig';

type Registro = Record<string, unknown>;
type Desuscribir = () => void;

export type PerfilUsuario = {
  nombre: string;
  email: string | null;
};

const texto = (valor: unknown): string =>
  typeof valor === 'string' ? valor.trim() : '';

/** Escucha el perfil del usuario en `Usuarios/{uid}`. */
export function subscribePerfil(
  uid: string,
  onData: (perfil: PerfilUsuario | null) => void,
  onError?: (error: Error) => void
): Desuscribir {
  return onValue(
    ref(database, `Usuarios/${uid}`),
    (snapshot) => {
      const raw = snapshot.val() as Registro | null;
      if (!raw) {
        onData(null);
        return;
      }

      onData({
        nombre: texto(raw.nombre),
        email: texto(raw.email) || null,
      });
    },
    (error) => onError?.(error as Error)
  );
}

/** Guarda el nombre visible en la base y en el perfil de Firebase Auth. */
export async function guardarPerfil(
  uid: string,
  nombre: string
): Promise<void> {
  const limpio = nombre.trim();

  await update(ref(database, `Usuarios/${uid}`), {
    nombre: limpio,
    email: auth.currentUser?.email ?? null,
    actualizadoEn: Date.now(),
  });

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: limpio });
  }
}
