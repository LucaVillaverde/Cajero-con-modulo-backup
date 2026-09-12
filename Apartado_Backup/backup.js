import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import sqlite3 from 'sqlite3';
import cron from 'node-cron';
import keypress from 'keypress';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Guardado de PID para envio de señales
const pidFile = path.resolve(__dirname, 'backup.pid');
fs.writeFileSync(pidFile, process.pid.toString());

let llamadas = 0; // Contador de backups automaticos efectuados
let llamadasManual = 0; // Contador de backups manuales efectuados
let enProceso = false; // Variable para controlar si hay un backup en proceso
let cerrando = false;

// Listeners para capturar señales
process.on('SIGUSR1', () => {
    console.log('================================================');
    logConHora('--- Señal SIGUSR1 recibida ---', chalk.yellow);
    if (enProceso) {
        logConHora('--- Backup en curso, ignorando Backup manual ---', chalk.yellow);
    } else {
        logConHora('--- No hay backup en curso, ejecutando Backup manual ---', chalk.green);
        llamadasManual++;
        hacerBackup(true);
    }
});

process.on('SIGUSR2', () => {
    console.log('================================================');
    logConHora('--- Señal SIGUSR2 recibida ---', chalk.yellow);
    if (enProceso) {
        logConHora('--- Backup en curso, esperando a que termine para cerrar ---', chalk.yellow);
        cerrando = true;
    } else {
        logConHora('--- No hay backup en curso, cerrando ahora ---', chalk.green);
        process.exit(0);
    }
});

// Formato para LOG
function logConHora(mensaje, colorFn = chalk.cyan.bgBlack) {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-UY', { hour12: false });
    console.log(colorFn(`\n[${hora}] ${mensaje}\n`));
}

// Tarea para efectuar un backup automatico cada hora

cron.schedule('0 0 * * * *', () => {
    llamadas++;
    verificarDirectorio();
});

// cron.schedule('* * * * *', () => {
//     llamadas++;
//     verificarDirectorio();
// });

const baseDeDatosOriginal = '../../miBaseDeDatos.db'; // Asegúrate de que esta ruta sea correcta

function hacerBackup(mensaje) {
    enProceso = true;
    const carpetaBackups = '../../backups';
    const archivos = fs.readdirSync(carpetaBackups);
    const backupsDB = archivos.filter(file => file.endsWith('.db'));

    // Año, mes, día
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');

    // Hora, minuto, segundo
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minuto = String(ahora.getMinutes()).padStart(2, '0');
    const segundo = String(ahora.getSeconds()).padStart(2, '0');

    const nuevoBackup = `backup-${año}-${mes}-${dia}-${hora}-${minuto}-${segundo}.db`;
    const pathNuevoBackup = path.join(carpetaBackups, nuevoBackup);

    // Mensajes
    console.log('================================================');
    if (mensaje) {
        logConHora('--- Forzando el inicio del backup ---', chalk.yellow);
    } else {
        logConHora('--- Inicio automático del backup ---', chalk.yellow);
        if (llamadas === 0) llamadas++;
    }
    logConHora(`--- BackUp Automático número: ${llamadas} ---`, chalk.yellow);
    logConHora(`--- BackUp Manual número: ${llamadasManual} ---`, chalk.yellow);

    // Rotación de backups
    if (backupsDB.length >= 10) {
        backupsDB.sort((a, b) => fs.statSync(path.join(carpetaBackups, a)).mtime - fs.statSync(path.join(carpetaBackups, b)).mtime);
        const backupAntiguo = backupsDB.shift();
        fs.unlinkSync(path.join(carpetaBackups, backupAntiguo));
        logConHora(`--- Eliminando backup antiguo: ${backupAntiguo} ---`, chalk.yellow);
    }

    try {
        fs.copyFileSync(baseDeDatosOriginal, pathNuevoBackup);
        logConHora(`--- Nuevo backup creado exitosamente: ${nuevoBackup} ---`, chalk.green);
    } catch (error) {
        logConHora(`--- Error al crear el backup: ${error.message} ---`, chalk.red);
    }

    enProceso = false;
    if (cerrando) {
        logConHora('--- Backup finalizado, cerrando programa ---', chalk.green);
        process.exit(0);
    }
}

// Función para hacer backup
function intentarHacerBackup(mensaje) {
    console.clear();
    if (!fs.existsSync(baseDeDatosOriginal)) {
        console.log('================================================');
        logConHora(`--- La base de datos original no existe: ${baseDeDatosOriginal} ---`, chalk.red);
        const carpetaBackups = '../../backups';
        const archivos = fs.readdirSync(carpetaBackups);
        const backupsDB = archivos.filter(file => file.endsWith('.db'));
        if (backupsDB.length > 0) {
            const ultimoBackup = backupsDB[backupsDB.length - 1];
            logConHora(`--- Base de datos original encontrada: ${ultimoBackup} ---`, chalk.green);
            fs.copyFileSync(path.join(carpetaBackups, ultimoBackup), baseDeDatosOriginal);
            logConHora(`--- Base de datos original copiada exitosamente: ${baseDeDatosOriginal} ---`, chalk.green);
            if (!mensaje){
                console.log('================================================');
                logConHora('--- Inicio automatico del backup ---', chalk.yellow);
                if (llamadas === 0) {
                    llamadas++;
                }
            }
            logConHora(`--- BackUp Automatico numero: ${llamadas} ---`, chalk.yellow);
            logConHora(`--- Tablas verificadas o creadas correctamente ---`, chalk.green);
        } else {
            logConHora(`--- No se encontraron backups para copiar ---`, chalk.red);
            const db = new sqlite3.Database('miBaseDeDatos.db', (err) => {
                if (err) {
                    logConHora(`Error al conectar con la base de datos: ${err.message}`, chalk.red);
                    return;
                } else {
                    // Crear las tablas si no existen (solo se ejecuta si es la primera vez o se eliminó el .db)
                    db.serialize(() => {
                        db.run(`
                            CREATE TABLE IF NOT EXISTS Cuenta (
                                Nombre TEXT NOT NULL,
                                Apellido TEXT NOT NULL,
                                Cedula TEXT PRIMARY KEY,
                                PIN TEXT NOT NULL,
                                Saldo INTEGER NOT NULL DEFAULT 0
                            )
                        `);
            
                        db.run(`
                            CREATE TABLE IF NOT EXISTS Transacciones (
                                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                                Cedula TEXT NOT NULL,
                                Tipo TEXT NOT NULL,
                                Monto INTEGER NOT NULL,
                                Destino TEXT,
                                Fecha TEXT NOT NULL
                            )
                        `);
                        logConHora('--- Base de datos creada correctamente ---', chalk.green);
                        logConHora('--- Tablas verificadas o creadas correctamente ---', chalk.green);
                        setTimeout(() => {
                            console.clear();
                            hacerBackup(mensaje);
                        }, 2000);
                    });
                }
            });
        }
    } else {
        logConHora(`--- Base de datos original encontrada: ${baseDeDatosOriginal} ---`, chalk.green);
        setTimeout(() => {
            console.clear();
            hacerBackup(mensaje);
        })
        // Copiar la base de datos original al archivo de backup
    }
}

function verificarDirectorio() {
    console.clear();
    let intentos = 0;
    if (!fs.existsSync('../../backups')) {
        console.log('================================================');
        logConHora('--- El directorio de respaldos no existe ---', chalk.red);
        logConHora('--- Intentando crear el directorio de respaldos ---', chalk.yellow);
        setTimeout(() => {
            console.clear();
            fs.mkdir('../../backups', { recursive: true }, (err) => {
                if (err) {
                    logConHora(`Error al crear la carpeta de respaldos: ${err.message}`, chalk.red);
                    if (intentos < 3) {
                        intentos++;
                        logConHora('--- Volviendo a intentar ---', chalk.yellow);
                        setTimeout(verificarDirectorio, 2000);
                    } else {
                        logConHora('--- No se pudo crear el directorio de respaldos ---', chalk.red);
                        process.exit(1);
                    }
                } else {
                    logConHora('--- Directorio de respaldos creado exitosamente ---', chalk.green);
                    setTimeout(intentarHacerBackup, 2000);
                }
            });
        }, 3000);
    } else {
        console.log('================================================');
        logConHora('--- Directorio de respaldos encontrado ---', chalk.green);
        setTimeout(intentarHacerBackup, 2000);
    }
}

if (process.stdin.isTTY) {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    console.log(chalk.cyan.bgBlack('\n--- Presiona "b" para hacer un backup manual ---\n'));
    console.log(chalk.cyan.bgBlack('\n--- Presiona "esc" para salir ---\n'));
    console.log(chalk.cyan.bgBlack('\n--- Esperando a que pase una hora para el backup automatico ---\n'));

    process.stdin.on('keypress', (ch, key) => {
        if (key && key.name === 'b') {
            llamadasManual++;
            let mensaje = true;
            intentarHacerBackup(mensaje);
        }
        if (key && key.name === 'escape') {
            logConHora('--- Saliendo... ---', chalk.yellow);
            process.exit();
        }
    })
} else {
    logConHora('--- Modo no interactivo detectado ---', chalk.yellow);
    logConHora('--- Solo se ejecutarán backups automaticos ---', chalk.yellow);
    console.log('================================================');
}

