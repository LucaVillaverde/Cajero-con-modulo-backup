import chalk from "chalk";
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";

const baseDeDatosOriginal = './miBaseDeDatos.db';
const carpetaBackups = './backups';
const tablasRequeridas = ['Cuenta', 'Transacciones'];

// Verifica y crea el directorio de respaldos
async function verificarDirectorio() {
    console.log(chalk.cyan.bgBlack('\n--- Verificando estado del directorio de respaldos... ---\n'));
    if (!fs.existsSync(carpetaBackups)) {
        console.log(chalk.red('\n--- El directorio de respaldos no existe ---\n'));
        console.log(chalk.cyan.bgBlack('\n--- Intentando crear el directorio de respaldos ---\n'));
        try {
            await fs.promises.mkdir(carpetaBackups, { recursive: true });
            console.log(chalk.greenBright.bgBlack('\n--- Directorio de respaldos creado exitosamente ---\n'));
            return true;
        } catch (error) {
            console.error(chalk.red('\n--- Error al crear la carpeta de respaldos:', error.message, '---\n'));
            console.log(chalk.cyan.bgBlack('\n--- Intentando nuevamente en 2 segundos ---\n'));
            await new Promise(resolve => setTimeout(resolve, 2000));
            return verificarDirectorio();
        }
    } else {
        console.log(chalk.greenBright.bgBlack('\n--- Directorio de respaldos encontrado ---\n'));
        return true;
    }
}

// Verifica si las tablas requeridas existen
async function verificarTablasBaseDeDatos(ruta) {
    return new Promise((resolve) => {
        const db = new sqlite3.Database(ruta, (err) => {
            if (err) {
                console.error(chalk.red('Error al abrir la base de datos para verificar tablas:', err.message));
                return resolve(false);
            }
        });

        db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, rows) => {
            if (err) {
                console.error(chalk.red('Error al consultar las tablas:', err.message));
                db.close();
                return resolve(false);
            }

            const tablasExistentes = rows.map(row => row.name);
            const faltantes = tablasRequeridas.filter(tabla => !tablasExistentes.includes(tabla));

            db.close();
            if (faltantes.length > 0) {
                console.log(chalk.red(`\n--- Faltan las siguientes tablas: ${faltantes.join(", ")} ---\n`));
                return resolve(false);
            }

            return resolve(true);
        });
    });
}

// Función para crear las tablas si no existen
async function crearTablas() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(baseDeDatosOriginal, (err) => {
            if (err) {
                console.error(chalk.red('Error al conectar con la base de datos:', err.message));
                return reject(err);
            }
        });

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
        });

        db.close((err) => {
            if (err) {
                console.error(chalk.red('Error al cerrar la conexión con la base de datos:', err.message));
                return reject(err);
            } else {
                console.log(chalk.green('\n--- Tablas creadas y conexión cerrada correctamente ---\n'));
                console.log(chalk.cyan.bgBlack('\n--- Ahora puede iniciar el cajero ---\n'));
                resolve();
            }
        });
    });
}

// Maneja la existencia o restauración de la base de datos
async function manejarBaseDeDatos() {
    const directorioResult = await verificarDirectorio();

    if (directorioResult) {
        console.log(chalk.cyan.bgBlack('\n--- Verificando estado de la base de datos... ---\n'));

        const baseExiste = fs.existsSync(baseDeDatosOriginal);
        const baseValida = baseExiste ? await verificarTablasBaseDeDatos(baseDeDatosOriginal) : false;

        if (!baseValida) {
            if (baseExiste) {
                console.log(chalk.yellow(`\n--- La base de datos original está incompleta o dañada ---\n`));
            } else {
                console.log(chalk.red(`\n--- La base de datos original no existe ---\n`));
            }

            const archivos = fs.readdirSync(carpetaBackups);
            const backupsDB = archivos.filter(file => file.endsWith('.db')).sort();
            
            console.log(chalk.cyan.bgBlack('\n--- Buscando backups validos... ---\n'));
            for (let i = backupsDB.length - 1; i >= 0; i--) {
                const backupPath = path.join(carpetaBackups, backupsDB[i]);
                const valido = await verificarTablasBaseDeDatos(backupPath);
                if (valido) {
                    fs.copyFileSync(backupPath, baseDeDatosOriginal);
                    console.log(chalk.green(`\n--- Restaurado desde backup: ${backupsDB[i]} ---\n`));
                    return;
                }
            }

            console.log(chalk.red('\n--- No se encontraron backups válidos ---\n'));
            console.log(chalk.cyan.bgBlack('\n--- Creando nueva base de datos... ---\n'));
            await crearTablas();
        } else {
            console.log(chalk.green('\n--- Base de datos existente y válida ---\n'));
            console.log(chalk.cyan.bgBlack('\n--- Ahora puede iniciar el cajero ---\n'));
        }
    }
}

// Ejecutar
(async () => {
    try {
        await manejarBaseDeDatos();
    } catch (error) {
        console.error(chalk.red('Error en el flujo principal:', error.message));
    }
})();
