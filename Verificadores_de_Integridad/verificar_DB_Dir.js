import chalk from "chalk";
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constantes
const baseDeDatosOriginal = path.resolve(__dirname, "../miBaseDeDatos.db");
const carpetaBackups = path.resolve(__dirname, "../backups");
const tablasRequeridas = ["Cuenta", "Transacciones"];
const LIMITE_RESPALDOS = 10;

// Verifica y crea el directorio de respaldos
async function verificarDirectorio() {
    if (!fs.existsSync(carpetaBackups)) {
        console.log(chalk.red("\n--- El directorio de respaldos no existe ---\n"));
        try {
            await fs.promises.mkdir(carpetaBackups, { recursive: true });
            console.log(chalk.greenBright.bgBlack("\n--- Directorio de respaldos creado exitosamente ---\n"));
            return true;
        } catch (error) {
            console.error(chalk.red("\n--- Error al crear la carpeta de respaldos:", error.message, "---\n"));
            return false;
        }
    } else {
        console.log(chalk.greenBright.bgBlack("\n--- Directorio de respaldos encontrado ---\n"));
        const archivos = await fs.promises.readdir(carpetaBackups);
        const backupsDB = archivos.filter(file => file.endsWith(".db"))
            .sort((a, b) => fs.statSync(path.join(carpetaBackups, b)).mtime - fs.statSync(path.join(carpetaBackups, a)).mtime);

        // Si hay más de LIMITE_RESPALDOS, elimina los más antiguos
        if (backupsDB.length > LIMITE_RESPALDOS) {
            const backupsAEliminar = backupsDB.slice(LIMITE_RESPALDOS); // Mantén los más recientes
            for (const backup of backupsAEliminar) {
                try {
                    await fs.promises.unlink(path.join(carpetaBackups, backup));
                    console.log(chalk.red(`\n--- Eliminado backup antiguo: ${backup} ---\n`));
                } catch (error) {
                    console.error(chalk.yellow(`\n--- Error al eliminar ${backup}: ${error.message} ---\n`));
                }
            }
        }

        return true;
    }
}

// Verifica si las tablas requeridas existen
async function verificarTablasBaseDeDatos(ruta) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(ruta, (err) => {
            if (err) {
                console.error(chalk.red("Error al abrir la base de datos:", err.message));
                return reject(err);
            }
        });

        db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, rows) => {
            if (err) {
                console.error(chalk.red("Error al consultar las tablas:", err.message));
                db.close();
                return resolve(false);
            }

            const tablasExistentes = rows.map(row => row.name);
            const faltantes = tablasRequeridas.filter(tabla => !tablasExistentes.includes(tabla));

            db.close();
            resolve(faltantes.length === 0);
        });
    });
}



// Restaurar desde un backup válido
async function colocarBackupBueno() {
    console.log(chalk.cyan.bgBlack("\n--- Buscando backups válidos... ---\n"));

    const archivos = await fs.promises.readdir(carpetaBackups);
    const backupsDB = archivos.filter(file => file.endsWith(".db"))
        .sort((a, b) => fs.statSync(path.join(carpetaBackups, b)).mtime - fs.statSync(path.join(carpetaBackups, a)).mtime);

    for (const backup of backupsDB) {
        const backupPath = path.join(carpetaBackups, backup);
        const valido = await verificarTablasBaseDeDatos(backupPath);
        if (valido) {
            try {
                await fs.promises.copyFile(backupPath, baseDeDatosOriginal);
                console.log(chalk.green(`\n--- Restaurado desde backup: ${backup} ---\n`));
                return true;
            } catch (error) {
                console.error(chalk.red(`\n--- Error al restaurar backup: ${error.message} ---\n`));
                return false;
            }
        }
    }

    console.log(chalk.red("\n--- No se encontraron backups válidos ---\n"));
    return false;
}

// Maneja la existencia o restauración de la base de datos
async function manejarBaseDeDatos() {
    console.log(chalk.cyan.bgBlack("\n--- Verificando estado de la base de datos... ---\n"));

    const baseExiste = fs.existsSync(baseDeDatosOriginal);
    const baseValida = baseExiste ? await verificarTablasBaseDeDatos(baseDeDatosOriginal) : false;

    if (!baseValida) {
        if (baseExiste) {
            console.log(chalk.yellow("\n--- La base de datos original está incompleta o dañada ---\n"));
        } else {
            console.log(chalk.red("\n--- La base de datos original no existe ---\n"));
        }

        const backupBueno = await colocarBackupBueno();

        if (!backupBueno) {
            console.clear();
            console.log(chalk.yellow("\n--- No se encontraron backups válidos, creando nuevas tablas... ---\n"));
            await crearTablas();
        }
    } else {
        console.log(chalk.green("\n--- Base de datos existente y válida ---\n"));
        console.log(chalk.cyan.bgBlack("\n--- Ahora puede iniciar el Lanzador.bat ---\n"));
    }
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
            `, () => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS Transacciones (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        Cedula TEXT NOT NULL,
                        Tipo TEXT NOT NULL,
                        Monto INTEGER NOT NULL,
                        Destino TEXT,
                        Fecha TEXT NOT NULL
                    )
                `, () => {
                    db.close((err) => {
                        if (err) {
                            console.error(chalk.red('Error al cerrar la conexión con la base de datos:', err.message));
                            return reject(err);
                        } else {
                            console.log(chalk.green('\n--- Base de datos creada correctamente ---\n'));
                            console.log(chalk.cyan.bgBlack('\n--- Ahora puede iniciar el Lanzador.bat ---\n'));
                            resolve();
                        }
                    });
                });
            });
        });
    });
}



// Ejecución principal
(async () => {
    try {
        const result = await verificarDirectorio();
        console.clear();
        if (result) {
            await manejarBaseDeDatos();
        } else {
            console.error("\n--- No se encontró el directorio de backups y/o no se pudo crear ---\n");
        }
    } catch (error) {
        console.error(`Error en el flujo principal: ${error.message}`);
    }
})();