import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '../firebaseconfig';

export type UsuarioSesion = {
  uid: string;
  email: string | null;
  nombre: string | null;
};

function mapear(usuario: User): UsuarioSesion {
  return {
    uid: usuario.uid,
    email: usuario.email,
    nombre: usuario.displayName,
  };
}

/**
 * Usuario autenticado actual (o null en modo invitado).
 * `cargando` es true hasta que Firebase confirma el estado de sesión.
 */
export function useUsuario() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(
    auth.currentUser ? mapear(auth.currentUser) : null
  );
  const [cargando, setCargando] = useState(auth.currentUser === null);

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual ? mapear(usuarioActual) : null);
      setCargando(false);
    });

    return desuscribir;
  }, []);

  return { usuario, uid: usuario?.uid ?? null, cargando };
}
