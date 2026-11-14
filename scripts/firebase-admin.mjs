/**
 * Utilidades para operar Firebase Realtime Database con la clave de servicio.
 *
 * Requiere `google-service-account.json` en la raíz del proyecto (ignorado por git).
 * El token de acceso de la cuenta de servicio tiene permisos de administrador
 * sobre la base, por lo que estas operaciones NO pasan por las reglas de seguridad.
 *
 * Uso:
 *   import { dbRequest, getAccessToken } from './firebase-admin.mjs';
 */
import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const KEY_PATH =
  process.env.GOOGLE_SERVICE_ACCOUNT ??
  path.resolve(__dirname, '..', 'google-service-account.json');

const DATABASE_URL =
  process.env.FIREBASE_DATABASE_URL ??
  'https://aplicaciones-mo-p-default-rtdb.firebaseio.com';

const SCOPE =
  'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email';

/** Scope necesario para enviar mensajes con FCM V1. */
export const SCOPE_FCM = 'https://www.googleapis.com/auth/firebase.messaging';

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

/** Lee la cuenta de servicio (client_email, private_key, project_id...). */
export async function getServiceAccount() {
  const raw = await readFile(KEY_PATH, 'utf8').catch(() => {
    throw new Error(
      `No se encontro la clave de servicio en ${KEY_PATH}. ` +
        'Descargala desde Firebase > Configuracion del proyecto > Cuentas de servicio.'
    );
  });

  return JSON.parse(raw);
}

export async function getAccessToken(scope = SCOPE) {
  const serviceAccount = await getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope,
    aud: serviceAccount.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload)
  )}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(serviceAccount.private_key, 'base64url')}`;

  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo obtener el token de servicio (${response.status}): ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * GET / PUT / PATCH / DELETE contra Realtime Database con permisos de admin.
 * @param {string} pathname Ruta relativa, por ejemplo "contenidos" o ".settings/rules".
 * @param {{ method?: string, body?: unknown, token?: string }} [options]
 */
export async function dbRequest(pathname, { method = 'GET', body, token } = {}) {
  const accessToken = token ?? (await getAccessToken());
  const cleanPath = pathname.replace(/^\//, '');
  const separator = cleanPath.includes('?') ? '&' : '?';
  const url = `${DATABASE_URL}/${cleanPath}${separator}access_token=${encodeURIComponent(
    accessToken
  )}`;

  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(`${method} /${cleanPath} -> ${response.status} ${detalle}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
