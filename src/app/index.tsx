import { Redirect } from 'expo-router';

/**
 * La app no tenia ruta raiz "/", por eso Expo Router mostraba la pantalla de
 * "rutas no encontradas" (de donde se entraba a Sitemap y la app se cerraba).
 * Ahora "/" siempre lleva al login.
 */
export default function Index() {
  return <Redirect href="/login" />;
}
