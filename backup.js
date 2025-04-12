import fs from 'fs';
import path from 'path';
import chalk, { backgroundColorNames } from 'chalk';
import cron from 'node-cron';
import keypress from 'keypress';


let llamadas = 0;
let llamadasManual = 0;


cron.schedule('0 0 * * * *', () => {
    llamadas++;
    hacerBackup();
});



// Función para hacer backup
function hacerBackup(mensaje) {
    console.clear();
    if (mensaje){
        console.log(chalk.cyan('\n--- Forzando el inicio del backup ---'));
    } else {
        console.log(chalk.cyan('\n--- Inicio automatico del backup ---'));
        if (llamadas === 0) {
            llamadas++;
        }
    }
    console.log(chalk.cyan.bgBlack(`\n--- BackUp Automatico numero: ${llamadas} ---`));
    console.log(chalk.cyan.bgBlack(`\n--- BackUp Manual numero: ${llamadasManual} ---`));
    const carpetaBackups = './backups';
    const archivos = fs.readdirSync(carpetaBackups);
    const backupsDB = archivos.filter(file => file.endsWith('.db'));

    // Si hay más de 3 backups, eliminar los más antiguos
    if (backupsDB.length >= 6) {
        backupsDB.sort((a, b) => fs.statSync(path.join(carpetaBackups, a)).mtime - fs.statSync(path.join(carpetaBackups, b)).mtime);
        const backupAntiguo = backupsDB.shift(); // Elimina el más antiguo
        const pathBackupAntiguo = path.join(carpetaBackups, backupAntiguo);
        console.log(chalk.yellow(`\n--- Eliminando backup antiguo: ${pathBackupAntiguo} ---`));
        fs.unlinkSync(pathBackupAntiguo); // Borra el archivo más antiguo
    }

    // Crear un nuevo backup
    const ahora = new Date();
    const nuevoBackup = `backup-${ahora.toISOString().replace(/[:.]/g, '-')}.db`;
    const pathNuevoBackup = path.join(carpetaBackups, nuevoBackup);

    // Aquí debería estar la lógica de copiar los datos a la base de datos
    const baseDeDatosOriginal = './miBaseDeDatos.db'; // Asegúrate de que esta ruta sea correcta

    // Copiar la base de datos original al archivo de backup
    try {
        fs.copyFileSync(baseDeDatosOriginal, pathNuevoBackup); // Copia la base de datos
        console.log(chalk.green(`\n--- Nuevo backup creado exitosamente: ${nuevoBackup} ---`));
    } catch (error) {
        console.log(chalk.red(`\n--- Error al crear el backup: ${error.message} ---`));
    }
}

function verificarDirectorio() {
    console.clear();
    if (!fs.existsSync('./backups')) {
        console.log(chalk.red('\n--- El directorio de respaldos no existe ---\n'));
        console.log(chalk.cyan.bgBlack('\n--- Intentando crear el directorio de respaldos ---\n'));
        setTimeout(() => {
            console.clear();
            fs.mkdir('./backups', { recursive: true }, (err) => {
                if (err) {
                    console.error('Error al crear la carpeta de respaldos:', err);
                    console.log(chalk.cyan.bgBlack('\n--- Volviendo a intentar ---\n'));
                    setTimeout(verificarDirectorio, 2000);
                } else {
                    console.log(chalk.greenBright.bgBlack('\n--- Directorio de respaldos creado exitosamente ---\n'));
                    setTimeout(hacerBackup, 2000);
                }
            });
        }, 3000);
    } else {
        console.log(chalk.greenBright.bgBlack('\n--- Directorio de respaldos encontrado ---\n'));
        setTimeout(hacerBackup, 2000);
    }
}

// Configuración de keypress para capturar eventos
keypress(process.stdin);

// Cuando se presione una tecla, la función se activará
process.stdin.on('keypress', (ch, key) => {
    if (key && key.name === 'b') {
        llamadasManual++;
        let mensaje = true;
        hacerBackup(mensaje);
    }
    if (key && key.name === 'q') {
        console.log(chalk.cyan.bgBlack('\n--- Saliendo... ---'));
        process.exit();
    }
});


process.stdin.setRawMode(true);
process.stdin.resume();


console.clear();
verificarDirectorio();