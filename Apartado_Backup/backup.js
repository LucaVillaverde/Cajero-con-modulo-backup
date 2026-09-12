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

// Listener para capturar señales
process.on('SIGUSR2', () => {
    logConHora('\n--- Señal SIGUSR2 recibida ---\n');
    if (enProceso) {
        logConHora('\n--- Backup en curso, esperando a que termine para cerrar ---\n', chalk.yellow);
        cerrando = true;
    } else {
        logConHora('\n--- No hay backup en curso, cerrando ahora ---\n'. chalk.green);
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

    const ahora = new Date();
    const nuevoBackup = `backup-${ahora.toISOString().replace(/[:.]/g, '-')}.db`;
    const pathNuevoBackup = path.join(carpetaBackups, nuevoBackup);

    // Mensajes
    if (mensaje) {
        console.log(chalk.cyan('\n--- Forzando el inicio del backup ---'));
    } else {
        console.log(chalk.cyan('\n--- Inicio automático del backup ---'));
        if (llamadas === 0) llamadas++;
    }
    console.log(chalk.cyan.bgBlack(`\n--- BackUp Automático número: ${llamadas} ---`));
    console.log(chalk.cyan.bgBlack(`\n--- BackUp Manual número: ${llamadasManual} ---`));

    // Rotación de backups
    if (backupsDB.length >= 10) {
        backupsDB.sort((a, b) => fs.statSync(path.join(carpetaBackups, a)).mtime - fs.statSync(path.join(carpetaBackups, b)).mtime);
        const backupAntiguo = backupsDB.shift();
        fs.unlinkSync(path.join(carpetaBackups, backupAntiguo));
        console.log(chalk.yellow(`\n--- Eliminando backup antiguo: ${backupAntiguo} ---`));
    }

    try {
        fs.copyFileSync(baseDeDatosOriginal, pathNuevoBackup);
        console.log(chalk.green(`\n--- Nuevo backup creado exitosamente: ${nuevoBackup} ---`));
    } catch (error) {
        console.log(chalk.red(`\n--- Error al crear el backup: ${error.message} ---`));
    }

    enProceso = false;
    if (cerrando) {
        console.log(chalk.cyan.bgBlack('\n--- Backup finalizado, cerrando programa ---\n'));
        process.exit(0);
    }
}

// Función para hacer backup
function intentarHacerBackup(mensaje) {
    console.clear();
    if (!fs.existsSync(baseDeDatosOriginal)) {
        console.log(chalk.red(`\n--- La base de datos original no existe: ${baseDeDatosOriginal} ---`));
        const carpetaBackups = '../../backups';
        const archivos = fs.readdirSync(carpetaBackups);
        const backupsDB = archivos.filter(file => file.endsWith('.db'));
        if (backupsDB.length > 0) {
            const ultimoBackup = backupsDB[backupsDB.length - 1];
            console.log(chalk.green(`\n--- Base de datos original encontrada: ${ultimoBackup} ---`));
            fs.copyFileSync(path.join(carpetaBackups, ultimoBackup), baseDeDatosOriginal);
            console.log(chalk.green(`\n--- Base de datos original copiada exitosamente: ${baseDeDatosOriginal} ---`));
            if (!mensaje){
                console.log(chalk.cyan('\n--- Inicio automatico del backup ---'));
                if (llamadas === 0) {
                    llamadas++;
                }
            }
            console.log(chalk.cyan.bgBlack(`\n--- BackUp Automatico numero: ${llamadas} ---`));
            console.log(chalk.green(`\n--- Tablas verificadas o creadas correctamente ---`));
        } else {
            console.log(chalk.red(`\n--- No se encontraron backups para copiar ---`));
            const db = new sqlite3.Database('miBaseDeDatos.db', (err) => {
                if (err) {
                    console.error('Error al conectar con la base de datos:', err.message);
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
                        console.log(chalk.green('--- Base de datos creada correctamente ---'));
                        console.log(chalk.green('--- Tablas verificadas o creadas correctamente ---'));
                        setTimeout(() => {
                            console.clear();
                            hacerBackup(mensaje);
                        }, 2000);
                    });
                }
            });
        }
    } else {
        console.log(chalk.green(`\n--- Base de datos original encontrada: ${baseDeDatosOriginal} ---`));
        setTimeout(() => {
            console.clear();
            hacerBackup(mensaje);
        })
        // Copiar la base de datos original al archivo de backup
    }
}

function verificarDirectorio() {
    console.clear();
    if (!fs.existsSync('../../backups')) {
        console.log(chalk.red('\n--- El directorio de respaldos no existe ---\n'));
        console.log(chalk.cyan.bgBlack('\n--- Intentando crear el directorio de respaldos ---\n'));
        setTimeout(() => {
            console.clear();
            fs.mkdir('../../backups', { recursive: true }, (err) => {
                if (err) {
                    console.error('Error al crear la carpeta de respaldos:', err);
                    console.log(chalk.cyan.bgBlack('\n--- Volviendo a intentar ---\n'));
                    setTimeout(verificarDirectorio, 2000);
                } else {
                    console.log(chalk.greenBright.bgBlack('\n--- Directorio de respaldos creado exitosamente ---\n'));
                    setTimeout(intentarHacerBackup, 2000);
                }
            });
        }, 3000);
    } else {
        console.log(chalk.greenBright.bgBlack('\n--- Directorio de respaldos encontrado ---\n'));
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
            console.log(chalk.cyan.bgBlack('\n--- Saliendo... ---'));
            process.exit();
        }
    })
} else {
    logConHora('--- Modo no interactivo detectado ---', chalk.yellow);
    logConHora('--- Solo se ejecutarán backups automaticos ---');
}

