/**
 * Añade la lectura publica del nodo `contenidos` a las reglas de Realtime Database,
 * conservando el resto de reglas existentes (escritura solo autenticada).
 *
 * Uso:
 *   node scripts/reglas-firebase.mjs --dry   # muestra las reglas actuales
 *   node scripts/reglas-firebase.mjs         # aplica el cambio
 */
import { dbRequest } from './firebase-admin.mjs';

const DRY_RUN = process.argv.includes('--dry');
const REGLA_CONTENIDOS = { '.read': true, '.write': 'auth != null' };

async function main() {
  const actuales = await dbRequest('.settings/rules.json');
  console.log('Reglas actuales:\n', JSON.stringify(actuales, null, 2), '\n');

  const reglas = { ...(actuales?.rules ?? {}) };
  if (reglas.contenidos) {
    console.log('El nodo `contenidos` ya tiene reglas:', JSON.stringify(reglas.contenidos));
    return;
  }

  reglas.contenidos = REGLA_CONTENIDOS;
  const nuevas = { rules: reglas };

  console.log('Reglas nuevas:\n', JSON.stringify(nuevas, null, 2));

  if (DRY_RUN) {
    console.log('\nNada se aplico. Ejecuta sin --dry para publicar.');
    return;
  }

  await dbRequest('.settings/rules.json', { method: 'PUT', body: nuevas });
  console.log('\nReglas publicadas.');

  const verificacion = await dbRequest('.settings/rules.json');
  console.log('Nodo `contenidos`:', JSON.stringify(verificacion?.rules?.contenidos));
}

main().catch((error) => {
  console.error('\nError:', error.message);
  process.exit(1);
});
