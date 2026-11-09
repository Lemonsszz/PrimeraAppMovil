import { Redirect } from 'expo-router';

/** Cualquier ruta inexistente vuelve al inicio en vez de mostrar el error. */
export default function NotFound() {
  return <Redirect href="/" />;
}
