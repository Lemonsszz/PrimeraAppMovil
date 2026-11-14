/**
 * Migra el nodo `Comandos` al modelo unificado `contenidos`.
 *
 * - Corrige los campos mal escritos (descripción, categeoria, descripcio).
 * - Separa el comando ejecutable del nombre (`cuerpo`).
 * - Añade plataforma, dificultad, etiquetas, riesgo y advertencia.
 * - NO borra `Comandos`: queda como respaldo hasta validar la app.
 *
 * Uso:
 *   node scripts/migrar-contenidos.mjs          # migra
 *   node scripts/migrar-contenidos.mjs --dry    # solo muestra lo que haria
 */
import { dbRequest } from './firebase-admin.mjs';

const DRY_RUN = process.argv.includes('--dry');
const AHORA = Date.now();

/** Contenido curado y verificado de los 6 registros actuales. */
const CONTENIDOS = {
  C001: {
    tipo: 'comando',
    titulo: 'ip addr',
    resumen: 'Lista las interfaces de red y sus direcciones IP.',
    categoria: 'NETWORKING',
    plataformas: ['linux'],
    cuerpo: 'ip addr show',
    ejemplo: 'ip addr show eth0',
    dificultad: 'basico',
    tags: ['red', 'interfaces', 'ip'],
    riesgo: 'bajo',
  },
  C002: {
    tipo: 'comando',
    titulo: 'whoami',
    resumen: 'Muestra el nombre del usuario actual del sistema.',
    categoria: 'LINUX',
    plataformas: ['linux', 'windows', 'macos'],
    cuerpo: 'whoami',
    ejemplo: 'whoami',
    dificultad: 'basico',
    tags: ['usuario', 'identidad'],
    riesgo: 'bajo',
    nota: 'Para ver permisos y grupos del usuario usa: id',
  },
  C003: {
    tipo: 'comando',
    titulo: 'arp -a',
    resumen:
      'Muestra la tabla ARP con los equipos vistos en la red local y sus direcciones MAC.',
    categoria: 'NETWORKING',
    plataformas: ['windows', 'linux'],
    cuerpo: 'arp -a',
    ejemplo: 'arp -a',
    dificultad: 'basico',
    tags: ['arp', 'red local', 'mac'],
    riesgo: 'bajo',
  },
  C004: {
    tipo: 'comando',
    titulo: 'nmap -p',
    resumen: 'Escanea puertos abiertos en un host o en un rango de red.',
    categoria: 'NETWORKING',
    plataformas: ['linux', 'windows', 'macos'],
    cuerpo: 'nmap -p 22,80,443 192.168.1.10',
    ejemplo: 'nmap -p- 192.168.1.10   # escanea los 65535 puertos',
    dificultad: 'intermedio',
    tags: ['nmap', 'puertos', 'escaneo'],
    riesgo: 'medio',
    advertencia: 'Escanea solo redes propias o con autorización por escrito.',
  },
  C005: {
    tipo: 'comando',
    titulo: 'bettercap',
    resumen: 'Framework de reconocimiento y ataques MITM sobre redes locales.',
    categoria: 'SECURITY',
    plataformas: ['linux', 'macos'],
    cuerpo: 'bettercap -iface eth0',
    ejemplo: "bettercap -iface eth0 -eval 'net.probe on; net.show'",
    dificultad: 'avanzado',
    tags: ['mitm', 'arp spoofing', 'kali'],
    riesgo: 'alto',
    advertencia: 'Uso ofensivo: solo en laboratorios o redes con autorización.',
  },
  C0006: {
    tipo: 'comando',
    titulo: 'hydra',
    resumen:
      'Ataques de fuerza bruta con diccionarios contra servicios de autenticación.',
    categoria: 'SECURITY',
    plataformas: ['linux'],
    cuerpo: 'hydra -l admin -P rockyou.txt ssh://192.168.1.10',
    ejemplo: 'hydra -L usuarios.txt -P rockyou.txt -t 4 ssh://192.168.1.10',
    dificultad: 'avanzado',
    tags: ['kali', 'fuerza bruta', 'diccionario'],
    riesgo: 'alto',
    advertencia: 'Usar solo en sistemas propios o con autorización explícita.',
  },
};

async function main() {
  console.log(`Modo: ${DRY_RUN ? 'simulacion (no escribe)' : 'MIGRACION REAL'}\n`);

  const comandos = await dbRequest('Comandos.json');
  if (!comandos) {
    throw new Error('No existe el nodo `Comandos` o esta vacio.');
  }
  console.log('Comandos encontrados en la base:', Object.keys(comandos).join(', '));

  const existentes = (await dbRequest('contenidos.json')) ?? {};
  console.log('Contenidos existentes:', Object.keys(existentes).length, '\n');

  for (const [id, contenido] of Object.entries(CONTENIDOS)) {
    const registro = {
      ...contenido,
      creadoPor: 'migracion',
      creadoEn: AHORA,
      actualizadoEn: AHORA,
    };

    if (DRY_RUN) {
      console.log(`[dry] ${id}: ${registro.titulo} (${registro.categoria})`);
      continue;
    }

    await dbRequest(`contenidos/${id}.json`, { method: 'PUT', body: registro });
    console.log(`OK  ${id}: ${registro.titulo} (${registro.categoria})`);
  }

  if (DRY_RUN) {
    console.log('\nNada se escribio. Ejecuta sin --dry para migrar.');
    return;
  }

  const verificados = await dbRequest('contenidos.json?shallow=true');
  console.log('\nNodos en `contenidos`:', Object.keys(verificados ?? {}).join(', '));
  console.log('El nodo `Comandos` se conserva como respaldo.');
}

main().catch((error) => {
  console.error('\nError:', error.message);
  process.exit(1);
});
