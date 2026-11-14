import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '../firebaseconfig';

/**
 * Usuario autenticado actual (o null en modo invitado).
 * `cargando` es true hasta que Firebase confirma el estado de sesión.
 */
export function useUsuario() {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [cargando, setCargando] = useState(auth.currentUser === null);

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, (usuario) => {
      setUid(usuario?.uid ?? null);
      setCargando(false);
    });

    return desuscribir;
  }, []);

  return { uid, cargando };
}
