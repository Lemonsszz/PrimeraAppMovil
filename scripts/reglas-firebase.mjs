/**
 * Publica las reglas de Realtime Database que necesita la app, conservando
 * el resto de reglas existentes:
 *
 * - `contenidos`: lectura publica, escritura autenticada.
 * - `retos`: lectura publica (el invitado puede jugar), escritura autenticada.
 * - `progreso/{uid}`: solo el dueno puede leer y escribir su progreso.
 * - `tokens/{uid}`: solo el dueno guarda su token de push; los scripts de envio
 *   lo leen con la cuenta de servicio (admin, no pasa por reglas).
 *
 * Uso:
 *   node scripts/reglas-firebase.mjs --dry   # muestra el resultado
 *   node scripts/reglas-firebase.mjs         # publica
 */
import { dbRequest } from './firebase-admin.mjs';

const DRY_RUN = process.argv.includes('--dry');

const REGLAS_NUEVAS = {
  contenidos: { '.read': true, '.write': 'auth != null' },
  retos: { '.read': true, '.write': 'auth != null' },
  progreso: {
    $uid: {
      '.read': 'auth != null && auth.uid == $uid',
      '.write': 'auth != null && auth.uid == $uid',
    },
  },
  tokens: {
    $uid: {
      '.read': 'auth != null && auth.uid == $uid',
      '.write': 'auth != null && auth.uid == $uid',
    },
  },
};

function iguales(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  const actuales = await dbRequest('.settings/rules.json');
  const reglas = { ...(actuales?.rules ?? {}) };

  let cambios = 0;
  for (const [nodo, regla] of Object.entries(REGLAS_NUEVAS)) {
    if (iguales(reglas[nodo], regla)) {
      console.log(`= ${nodo}: ya estaba configurado`);
      continue;
    }
    reglas[nodo] = regla;
    cambios += 1;
    console.log(`+ ${nodo}: se anade/actualiza`);
  }

  if (cambios === 0) {
    console.log('\nNo hay cambios que publicar.');
    return;
  }

  const nuevas = { rules: reglas };
  console.log('\nReglas resultantes:\n', JSON.stringify(nuevas, null, 2));

  if (DRY_RUN) {
    console.log('\nNada se aplico. Ejecuta sin --dry para publicar.');
    return;
  }

  await dbRequest('.settings/rules.json', { method: 'PUT', body: nuevas });
  console.log(`\nReglas publicadas (${cambios} nodo(s) actualizado(s)).`);

  const verificacion = (await dbRequest('.settings/rules.json'))?.rules ?? {};
  for (const nodo of Object.keys(REGLAS_NUEVAS)) {
    console.log(`  ${nodo}:`, JSON.stringify(verificacion[nodo]));
  }
}

main().catch((error) => {
  console.error('\nError:', error.message);
  process.exit(1);
});
