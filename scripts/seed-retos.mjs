/**
 * Carga el banco de preguntas del reto diario en el nodo `retos`.
 *
 * - Es idempotente: vuelve a escribir los mismos IDs (upsert).
 * - `correcta` es el índice (0 = A) dentro de `opciones`.
 * - `puntos` se mantiene en 10 para que coincida con la puntuación de la app.
 *
 * Uso:
 *   node scripts/seed-retos.mjs          # carga/actualiza
 *   node scripts/seed-retos.mjs --dry    # solo muestra lo que haria
 */
import { dbRequest } from './firebase-admin.mjs';

const DRY_RUN = process.argv.includes('--dry');
const AHORA = Date.now();
const PUNTOS = 10;

/** Banco de preguntas verificado (30 preguntas). */
const RETOS = [
  {
    pregunta: '¿Qué herramienta se usa habitualmente para escanear puertos abiertos?',
    opciones: ['nmap', 'dig', 'tcpdump', 'whois'],
    correcta: 0,
    explicacion: 'nmap es el escáner de puertos y servicios de referencia en pentesting.',
    categoria: 'NETWORKING',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando muestra la tabla ARP en Windows?',
    opciones: ['arp -a', 'netstat -an', 'ipconfig /all', 'route print'],
    correcta: 0,
    explicacion: 'arp -a lista las direcciones IP y MAC que el equipo conoce en la red local.',
    categoria: 'NETWORKING',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando muestra el nombre del usuario actual en Linux?',
    opciones: ['whoami', 'pwd', 'hostname', 'uname -a'],
    correcta: 0,
    explicacion: 'whoami devuelve el usuario efectivo con el que se ejecuta la sesión.',
    categoria: 'LINUX',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando lista archivos con sus permisos, dueño y fecha?',
    opciones: ['chmod', 'chown', 'ls -l', 'cp -r'],
    correcta: 2,
    explicacion: 'ls -l muestra el detalle largo: permisos, propietario, grupo, tamaño y fecha.',
    categoria: 'LINUX',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando cambia los permisos de un archivo en Linux?',
    opciones: ['chown', 'chmod', 'umask', 'passwd'],
    correcta: 1,
    explicacion: 'chmod modifica los permisos; chown cambia el propietario.',
    categoria: 'LINUX',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando eleva privilegios de forma temporal en Linux?',
    opciones: ['su', 'sudo', 'doas', 'sudoers'],
    correcta: 1,
    explicacion: 'sudo ejecuta un comando como otro usuario (normalmente root).',
    categoria: 'LINUX',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Dónde se guardan las cuentas de usuario en Linux?',
    opciones: ['/etc/shadow', '/etc/passwd', '/etc/group', '/var/log/auth.log'],
    correcta: 1,
    explicacion: '/etc/passwd contiene las cuentas; /etc/shadow guarda los hashes de contraseña.',
    categoria: 'LINUX',
    dificultad: 'intermedio',
  },
  {
    pregunta: '¿Dónde se almacenan los hashes de contraseñas en Linux?',
    opciones: ['/etc/passwd', '/etc/shadow', '/etc/hosts', '/root/.bashrc'],
    correcta: 1,
    explicacion: '/etc/shadow solo es legible por root y contiene los hashes de las contraseñas.',
    categoria: 'LINUX',
    dificultad: 'intermedio',
  },
  {
    pregunta: '¿Qué comando busca archivos con el bit SUID activado?',
    opciones: [
      'find / -perm -4000 -type f 2>/dev/null',
      'ls -la / | grep suid',
      'grep -r 4000 /etc',
      'chmod 4000 /',
    ],
    correcta: 0,
    explicacion:
      'find con -perm -4000 localiza binarios SUID, un paso clásico en la escalada de privilegios.',
    categoria: 'LINUX',
    dificultad: 'avanzado',
  },
  {
    pregunta: '¿Qué comando muestra los procesos en tiempo real en Linux?',
    opciones: ['ps aux', 'top', 'jobs', 'kill -9'],
    correcta: 1,
    explicacion: 'top refresca la lista de procesos y su consumo de CPU y memoria.',
    categoria: 'LINUX',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando busca patrones de texto dentro de archivos?',
    opciones: ['sed', 'awk', 'grep', 'cut'],
    correcta: 2,
    explicacion: 'grep filtra líneas que coinciden con un patrón o expresión regular.',
    categoria: 'LINUX',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando lista los procesos en Windows?',
    opciones: ['tasklist', 'taskkill', 'netstat', 'dir'],
    correcta: 0,
    explicacion: 'tasklist enumera los procesos; taskkill los finaliza.',
    categoria: 'WINDOWS',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando muestra la configuración de red completa en Windows?',
    opciones: ['ipconfig /all', 'ipconfig /release', 'netstat -r', 'netsh trace'],
    correcta: 0,
    explicacion: 'ipconfig /all muestra adaptadores, IP, máscara, puerta de enlace y DNS.',
    categoria: 'WINDOWS',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando muestra las conexiones de red activas y sus PID en Windows?',
    opciones: ['netstat -ano', 'route print', 'arp -a', 'nslookup'],
    correcta: 0,
    explicacion: 'netstat -ano incluye todas las conexiones, puertos en escucha y el PID asociado.',
    categoria: 'WINDOWS',
    dificultad: 'intermedio',
  },
  {
    pregunta: '¿Qué comando gestiona el firewall desde la línea de comandos en Windows?',
    opciones: ['netsh advfirewall', 'firewall.cpl', 'sfc /scannow', 'gpupdate /force'],
    correcta: 0,
    explicacion: 'netsh advfirewall permite consultar y modificar perfiles y reglas del firewall.',
    categoria: 'WINDOWS',
    dificultad: 'intermedio',
  },
  {
    pregunta: '¿Qué significa MITM?',
    opciones: [
      'Man-in-the-Middle',
      'Machine-Integrated Threat Module',
      'Multi-Interface Traffic Monitor',
      'Managed Internal Threat Map',
    ],
    correcta: 0,
    explicacion:
      'Un ataque Man-in-the-Middle intercepta o altera la comunicación entre dos partes.',
    categoria: 'SECURITY',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Para qué sirve Hydra?',
    opciones: [
      'Para fuerza bruta de credenciales contra servicios',
      'Para escanear puertos',
      'Para analizar tráfico de red',
      'Para enumerar subdominios',
    ],
    correcta: 0,
    explicacion:
      'Hydra prueba diccionarios de usuarios y contraseñas contra SSH, FTP, HTTP y otros servicios.',
    categoria: 'SECURITY',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué herramienta de Kali se usa para ARP spoofing y análisis MITM?',
    opciones: ['bettercap', 'hashcat', 'john', 'gobuster'],
    correcta: 0,
    explicacion:
      'bettercap realiza reconocimiento, sniffing y ataques MITM en redes locales.',
    categoria: 'SECURITY',
    dificultad: 'avanzado',
  },
  {
    pregunta: '¿Qué herramienta se usa para crackear hashes con GPU?',
    opciones: ['hashcat', 'hydra', 'sqlmap', 'nikto'],
    correcta: 0,
    explicacion: 'hashcat está optimizado para recuperar contraseñas a partir de hashes.',
    categoria: 'SECURITY',
    dificultad: 'intermedio',
  },
  {
    pregunta: '¿Qué significa CVE?',
    opciones: [
      'Common Vulnerabilities and Exposures',
      'Certified Vulnerability Engine',
      'Cyber Validation Environment',
      'Common Vector Exploit',
    ],
    correcta: 0,
    explicacion:
      'CVE es el catálogo público de vulnerabilidades con un identificador único (CVE-AAAA-NNNN).',
    categoria: 'SECURITY',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué es un exploit?',
    opciones: [
      'Un código que aprovecha una vulnerabilidad',
      'Un tipo de firewall',
      'Una base de datos de contraseñas',
      'Un protocolo de red',
    ],
    correcta: 0,
    explicacion:
      'El exploit aprovecha un fallo para ejecutar acciones no autorizadas; el payload es lo que se ejecuta después.',
    categoria: 'SECURITY',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué es el phishing?',
    opciones: [
      'Ingeniería social para robar credenciales',
      'Un escaneo de puertos',
      'Una técnica de cifrado',
      'Un ataque de fuerza bruta',
    ],
    correcta: 0,
    explicacion:
      'El phishing engaña a la víctima con mensajes o webs falsas para que entregue datos o ejecute archivos.',
    categoria: 'SECURITY',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué significa OSINT?',
    opciones: [
      'Inteligencia de fuentes abiertas',
      'Sistema operativo integrado',
      'Open Security Interface',
      'Organización de seguridad internacional',
    ],
    correcta: 0,
    explicacion:
      'OSINT es la recopilación de información a partir de fuentes públicas: redes, DNS, webs y filtraciones.',
    categoria: 'RECON',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué hace `nmap -sV`?',
    opciones: [
      'Detecta la versión de los servicios',
      'Escanea solo UDP',
      'Intenta fuerza bruta',
      'Captura paquetes',
    ],
    correcta: 0,
    explicacion:
      'La opción -sV identifica el servicio y su versión en cada puerto abierto.',
    categoria: 'RECON',
    dificultad: 'intermedio',
  },
  {
    pregunta: '¿Qué hace `nmap -sS`?',
    opciones: [
      'Escaneo SYN (half-open)',
      'Escaneo de versiones',
      'Escaneo UDP',
      'Escanear sin resolver DNS',
    ],
    correcta: 0,
    explicacion:
      'El escaneo SYN no completa la conexión TCP, lo que lo hace más rápido y sigiloso.',
    categoria: 'RECON',
    dificultad: 'avanzado',
  },
  {
    pregunta: '¿Qué herramienta enumera subdominios y directorios web?',
    opciones: ['gobuster', 'tcpdump', 'hashcat', 'netcat'],
    correcta: 0,
    explicacion:
      'gobuster fuerza recursos web y DNS a partir de diccionarios.',
    categoria: 'RECON',
    dificultad: 'intermedio',
  },
  {
    pregunta: '¿Qué puerto usa HTTPS por defecto?',
    opciones: ['80', '443', '22', '8080'],
    correcta: 1,
    explicacion: 'HTTPS usa el puerto 443 por defecto; HTTP usa el 80.',
    categoria: 'NETWORKING',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué puerto usa SSH por defecto?',
    opciones: ['21', '22', '23', '25'],
    correcta: 1,
    explicacion: 'SSH escucha en el puerto 22 por defecto.',
    categoria: 'NETWORKING',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué protocolo traduce nombres de dominio a direcciones IP?',
    opciones: ['DNS', 'DHCP', 'ARP', 'FTP'],
    correcta: 0,
    explicacion:
      'DNS resuelve dominios a IP; ARP traduce IP a MAC dentro de la red local.',
    categoria: 'NETWORKING',
    dificultad: 'basico',
  },
  {
    pregunta: '¿Qué comando captura tráfico de red en Linux?',
    opciones: ['tcpdump', 'nmap', 'dig', 'ss'],
    correcta: 0,
    explicacion:
      'tcpdump captura e inspecciona paquetes; requiere privilegios elevados.',
    categoria: 'NETWORKING',
    dificultad: 'intermedio',
  },
  {
    pregunta: '¿Qué significa XSS?',
    opciones: [
      'Cross-Site Scripting',
      'Cross-Server Security',
      'External Script Source',
      'XML Secure Schema',
    ],
    correcta: 0,
    explicacion:
      'XSS inyecta JavaScript en una página para ejecutarlo en el navegador de otra víctima.',
    categoria: 'SECURITY',
    dificultad: 'intermedio',
  },
];

/** Convierte el arreglo a un objeto con IDs estables (R001...R030). */
function construirRegistros() {
  return Object.fromEntries(
    RETOS.map((reto, indice) => {
      const id = `R${String(indice + 1).padStart(3, '0')}`;
      return [
        id,
        {
          ...reto,
          puntos: PUNTOS,
          creadoPor: 'seed',
          creadoEn: AHORA,
          actualizadoEn: AHORA,
        },
      ];
    })
  );
}

async function main() {
  const registros = construirRegistros();
  console.log(`Modo: ${DRY_RUN ? 'simulacion (no escribe)' : 'CARGA REAL'}`);
  console.log(`Preguntas: ${Object.keys(registros).length}\n`);

  for (const [id, reto] of Object.entries(registros)) {
    const etiqueta = `${id} [${reto.categoria}] ${reto.pregunta}`;
    if (DRY_RUN) {
      console.log(`[dry] ${etiqueta}`);
      continue;
    }
    await dbRequest(`retos/${id}.json`, { method: 'PUT', body: reto });
    console.log(`OK  ${etiqueta}`);
  }

  if (DRY_RUN) {
    console.log('\nNada se escribio. Ejecuta sin --dry para cargar.');
    return;
  }

  const verificados = await dbRequest('retos.json?shallow=true');
  console.log('\nNodos en `retos`:', Object.keys(verificados ?? {}).join(', '));
}

main().catch((error) => {
  console.error('\nError:', error.message);
  process.exit(1);
});
