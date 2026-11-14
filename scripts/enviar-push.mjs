/**
 * Envia notificaciones push reales a los dispositivos registrados.
 *
 * Lee `tokens/{uid}` de Realtime Database con la cuenta de servicio:
 *   - si el usuario tiene `expoPushToken`, usa el servicio de push de Expo;
 *   - si solo tiene `fcmToken`, usa FCM V1 directamente con la cuenta de servicio.
 *
 * Uso:
 *   node scripts/enviar-push.mjs --titulo "Nuevo comando" --cuerpo "Mira nmap" --url "/contenido/C001"
 *   node scripts/enviar-push.mjs --uid TU_UID --titulo "Hola" --cuerpo "Prueba"
 *   node scripts/enviar-push.mjs --recordatorio          # reto diario a todos
 *   node scripts/enviar-push.mjs --recordatorio --uid X  # solo a un usuario
 *
 * Opciones:
 *   --titulo, --cuerpo, --url, --uid
 *   --recordatorio   usa los textos del reto diario
 *   --limpiar        borra los tokens que el servicio marque como invalidos
 *   --dry            muestra lo que enviaria sin enviar nada
 *
 * Requiere `google-service-account.json` en la raiz (ignorado por git).
 */
import {
  SCOPE_FCM,
  dbRequest,
  getAccessToken,
  getServiceAccount,
} from './firebase-admin.mjs';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const TAMANO_LOTE = 100;

const argv = process.argv.slice(2);

function opcion(nombre, defecto = null) {
  const indice = argv.indexOf(`--${nombre}`);
  if (indice === -1) return defecto;

  const valor = argv[indice + 1];
  return valor && !valor.startsWith('--') ? valor : true;
}

const DRY = argv.includes('--dry');
const LIMPIAR = argv.includes('--limpiar');
const RECORDATORIO = argv.includes('--recordatorio');
const UID = opcion('uid');

const TITULO =
  opcion('titulo') ||
  (RECORDATORIO ? '🔥 Tu reto diario te espera' : 'CyberVault');
const CUERPO =
  opcion('cuerpo') ||
  (RECORDATORIO
    ? 'Completa las 5 preguntas de hoy y mantén tu racha.'
    : 'Tienes una novedad en CyberVault.');
const URL_DESTINO =
  opcion('url') || (RECORDATORIO ? '/retos' : null);

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function leerTokens(valor) {
  if (!valor) return [];
  return Object.entries(valor)
    .map(([uid, datos]) => ({
      uid,
      expoPushToken: datos?.expoPushToken ?? null,
      fcmToken: datos?.fcmToken ?? null,
      plataforma: datos?.plataforma ?? null,
    }))
    .filter((entrada) => entrada.expoPushToken || entrada.fcmToken);
}

function datosPush() {
  return URL_DESTINO ? { url: URL_DESTINO } : {};
}

async function enviarExpo(entradas) {
  const mensajes = entradas.map((entrada) => ({
    to: entrada.expoPushToken,
    title: TITULO,
    body: CUERPO,
    sound: 'default',
    priority: 'high',
    data: datosPush(),
  }));

  const resultados = [];

  for (let inicio = 0; inicio < mensajes.length; inicio += TAMANO_LOTE) {
    const lote = mensajes.slice(inicio, inicio + TAMANO_LOTE);
    const entradaLote = entradas.slice(inicio, inicio + TAMANO_LOTE);

    if (DRY) {
      resultados.push(
        ...entradaLote.map((entrada) => ({
          uid: entrada.uid,
          ok: true,
          detalle: 'dry-run',
          id: null,
        }))
      );
      continue;
    }

    const respuesta = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lote),
    });

    const cuerpo = await respuesta.json().catch(() => null);

    if (!respuesta.ok || !cuerpo?.data) {
      throw new Error(
        `Expo Push respondio ${respuesta.status}: ${JSON.stringify(cuerpo)}`
      );
    }

    cuerpo.data.forEach((resultado, indice) => {
      const entrada = entradaLote[indice];
      const ok = resultado.status === 'ok';

      resultados.push({
        uid: entrada.uid,
        ok,
        detalle: ok ? 'enviado' : resultado.message ?? 'error',
        id: resultado.id ?? null,
        invalido: resultado.details?.error === 'DeviceNotRegistered',
      });
    });
  }

  return resultados;
}

/** Envia a los usuarios que solo tienen token nativo, via FCM V1. */
async function enviarFcm(entradas) {
  const cuenta = await getServiceAccount();
  const projectId = cuenta.project_id;
  const accessToken = await getAccessToken(SCOPE_FCM);

  const resultados = [];

  for (const entrada of entradas) {
    if (DRY) {
      resultados.push({ uid: entrada.uid, ok: true, detalle: 'dry-run', id: null });
      continue;
    }

    try {
      const respuesta = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token: entrada.fcmToken,
              notification: { title: TITULO, body: CUERPO },
              data: datosPush(),
              android: {
                priority: 'high',
                notification: {
                  channel_id: 'default',
                  color: '#00FF88',
                  sound: 'default',
                },
              },
            },
          }),
        }
      );

      const cuerpo = await respuesta.json().catch(() => null);
      const ok = respuesta.ok;

      resultados.push({
        uid: entrada.uid,
        ok,
        detalle: ok
          ? 'enviado (FCM)'
          : cuerpo?.error?.status ?? `HTTP ${respuesta.status}`,
        id: cuerpo?.name ?? null,
        invalido:
          !ok &&
          (cuerpo?.error?.status === 'NOT_FOUND' ||
            cuerpo?.error?.status === 'UNREGISTERED' ||
            cuerpo?.error?.details?.some?.(
              (detalle) => detalle.errorCode === 'UNREGISTERED'
            )),
      });
    } catch (error) {
      resultados.push({
        uid: entrada.uid,
        ok: false,
        detalle: error.message,
        id: null,
      });
    }
  }

  return resultados;
}

async function comprobarRecibos(resultados) {
  const ids = resultados
    .map((resultado) => resultado.id)
    .filter((id) => typeof id === 'string' && id.startsWith('0'));

  if (ids.length === 0) return [];

  await dormir(2000);

  try {
    const respuesta = await fetch(EXPO_RECEIPTS_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    const cuerpo = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !cuerpo?.data) return [];

    const porId = new Map(ids.map((id) => [id, null]));
    for (const [id, recibo] of Object.entries(cuerpo.data)) {
      porId.set(id, recibo);
    }

    return resultados
      .filter((resultado) => porId.get(resultado.id))
      .map((resultado) => ({
        uid: resultado.uid,
        recibo: porId.get(resultado.id),
      }));
  } catch {
    return [];
  }
}

async function main() {
  const crudos = await dbRequest('tokens.json');
  const todos = leerTokens(crudos).filter((entrada) => !UID || entrada.uid === UID);

  if (todos.length === 0) {
    console.log(
      UID
        ? `El usuario ${UID} no tiene token guardado. Abre la app, inicia sesion y entra a la pestana Push.`
        : 'No hay tokens guardados. Abre la app, inicia sesion y entra a la pestana Push.'
    );
    return;
  }

  const conExpo = todos.filter((entrada) => entrada.expoPushToken);
  const soloFcm = todos.filter(
    (entrada) => !entrada.expoPushToken && entrada.fcmToken
  );

  console.log(
    `Enviando a ${todos.length} dispositivo(s): ${conExpo.length} por Expo Push, ${soloFcm.length} por FCM V1.`
  );
  console.log(`Titulo: ${TITULO}`);
  console.log(`Cuerpo: ${CUERPO}`);
  if (URL_DESTINO) console.log(`Abre: ${URL_DESTINO}`);
  if (DRY) console.log('Modo --dry: no se envia nada.\n');

  const resultados = [];

  if (conExpo.length > 0) {
    resultados.push(...(await enviarExpo(conExpo)));
  }

  if (soloFcm.length > 0) {
    resultados.push(...(await enviarFcm(soloFcm)));
  }

  const exitos = resultados.filter((resultado) => resultado.ok);
  const fallos = resultados.filter((resultado) => !resultado.ok);

  console.log(`\nResultado: ${exitos.length} enviado(s), ${fallos.length} fallo(s).`);

  for (const fallo of fallos) {
    console.log(`  ! ${fallo.uid}: ${fallo.detalle}`);
  }

  if (!DRY && LIMPIAR) {
    const invalidos = resultados.filter(
      (resultado) => resultado.invalido && resultado.uid !== UID
    );

    for (const invalido of invalidos) {
      await dbRequest(`tokens/${invalido.uid}.json`, { method: 'DELETE' });
      console.log(`  - token borrado: ${invalido.uid}`);
    }
  }

  const recibos = await comprobarRecibos(exitos);

  for (const { uid, recibo } of recibos) {
    if (recibo.status === 'error') {
      console.log(
        `  ! recibo ${uid}: ${recibo.message ?? ''} ${
          recibo.details?.error ?? ''
        }`
      );
    }
  }
}

main().catch((error) => {
  console.error('\nError:', error.message);
  process.exit(1);
});
