import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import sqlite3 from 'sqlite3';


const baseDeDatosOriginal = './miBaseDeDatos.db'; // Asegúrate de que esta ruta sea correcta



function verificarDirectorio() {
    if (!fs.existsSync('./backups')) {
        console.log(chalk.red('\n--- El directorio de respaldos no existe ---\n'));
        console.log(chalk.cyan.bgBlack('\n--- Intentando crear el directorio de respaldos ---\n'));
        setTimeout(() => {
            fs.mkdir('./backups', { recursive: true }, (err) => {
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


function intentarHacerBackup() {
    if (!fs.existsSync(baseDeDatosOriginal)) {
        console.log(chalk.red(`\n--- La base de datos original no existe: ${baseDeDatosOriginal} ---`));
        const carpetaBackups = './backups';
        const archivos = fs.readdirSync(carpetaBackups);
        const backupsDB = archivos.filter(file => file.endsWith('.db'));
        if (backupsDB.length > 0) {
            const ultimoBackup = backupsDB[backupsDB.length - 1];
            console.log(chalk.green(`\n--- Base de datos original encontrada: ${ultimoBackup} ---`));
            fs.copyFileSync(path.join(carpetaBackups, ultimoBackup), baseDeDatosOriginal);
            console.log(chalk.green(`\n--- Base de datos original copiada exitosamente: ${baseDeDatosOriginal} ---`));
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
                            hacerBackup();
                        }, 2000);
                    });
                }
            });
        }
    } else {
        console.log(chalk.green(`\n--- Base de datos original encontrada: ${baseDeDatosOriginal} ---`));
        setTimeout(() => {
            hacerBackup();
        }, 1000)
        // Copiar la base de datos original al archivo de backup
    }
}

function hacerBackup() {
    const carpetaBackups = './backups';
    const archivos = fs.readdirSync(carpetaBackups);
    const backupsDB = archivos.filter(file => file.endsWith('.db'));

    // Crear un nuevo backup
    const ahora = new Date();
    const nuevoBackup = `backup-${ahora.toISOString().replace(/[:.]/g, '-')}.db`;
    const pathNuevoBackup = path.join(carpetaBackups, nuevoBackup);

    // Si hay más de 10 backups, eliminar los más antiguos
    if (backupsDB.length >= 10) {
        backupsDB.sort((a, b) => fs.statSync(path.join(carpetaBackups, a)).mtime - fs.statSync(path.join(carpetaBackups, b)).mtime);
        const backupAntiguo = backupsDB.shift(); // Elimina el más antiguo
        const pathBackupAntiguo = path.join(carpetaBackups, backupAntiguo);
        console.log(chalk.yellow(`\n--- Eliminando backup antiguo: ${pathBackupAntiguo} ---`));
        fs.unlinkSync(pathBackupAntiguo); // Borra el archivo más antiguo
    }

    try {
        fs.copyFileSync(baseDeDatosOriginal, pathNuevoBackup); // Copia la base de datos
        console.log(chalk.green(`\n--- Nuevo backup creado exitosamente: ${nuevoBackup} ---`));
    } catch (error) {
        console.log(chalk.red(`\n--- Error al crear el backup: ${error.message} ---`));
    }
}


verificarDirectorio();