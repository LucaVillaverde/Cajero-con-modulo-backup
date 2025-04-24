import readline from 'readline';
import sqlite3 from 'sqlite3';
import chalk from 'chalk';
import keypress from 'keypress';
import { cajeroRetiroMenu } from './subMenus/cajeroRetiroMenu.js';
import { cajeroIngresoMenu } from './subMenus/cajeroIngresoMenu.js';
import { cajeroTransaccionMenu } from './subMenus/cajeroTransaccionMenu.js';
import { loginMenu } from '../Login_Menu/loginMenu.js';

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Configuración de keypress para capturar eventos
keypress(process.stdin);

// Cuando se presione una tecla, la función se activará
process.stdin.on('keypress', (ch, key) => {
    if (key && key.name === 'escape') {
        console.log(chalk.cyan.bgBlack('\n--- Terminando programa... ---'));
        process.exit();
    }
});

const baseDeDatosOriginal = './miBaseDeDatos.db'; // Asegúrate de que esta ruta sea correcta

export let cedulaGuardada = false;


export const db = new sqlite3.Database(baseDeDatosOriginal, (err) => {
    console.clear();
    if (err) {
        console.log(chalk.red(`\n--- No se pudo encontrar la base de datos ---`));
            db.serialize(() => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS Cuenta (
                        Nombre TEXT NOT NULL,
                        Apellido TEXT NOT NULL,
                        Cedula TEXT PRIMARY KEY,
                        PIN TEXT NOT NULL,
                        Saldo INTEGER NOT NULL DEFAULT 0
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error al crear la tabla Cuenta:', err.message);
                    } else {
                        console.log(chalk.green('--- Tabla Cuenta creada correctamente ---'));
                    }
                });
            
                db.run(`
                    CREATE TABLE IF NOT EXISTS Transacciones (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        Cedula TEXT NOT NULL,
                        Tipo TEXT NOT NULL,
                        Monto INTEGER NOT NULL,
                        Destino TEXT,
                        Fecha TEXT NOT NULL
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error al crear la tabla Transacciones:', err.message);
                    } else {
                        console.log(chalk.green('--- Tabla Transacciones creada correctamente ---'));
                    }
                setTimeout(() => {
                    console.clear();
                    loginMenu();
                })
                });
            });  
    } else {
        console.clear();
        console.log(chalk.green('\n--- Base de datos conectada correctamente ---\n'));
        setTimeout(() => {
            console.clear();
            loginMenu();
        }, 2000);
    }
});
    





/**
 * la funcion cajeroMenu() Muestra el menu principal del cajeroMenu y permite al usuario seleccionar 
 * una opcion para realizar una accion.
 * 
 * Se le pregunta al usuario que ingrese una opcion mediante un prompt.
 * Si el usuario ingresa una opcion que no es un numero, se muestra un 
 * mensaje de error y se vuelve a llamar a esta funcion.
 * Si el usuario ingresa una opcion numero, se ejecuta una de las 
 * siguientes funciones:
 * - cajeroMenuRetiroMenu() si se ingresa la opcion 1.
 * - cajeroMenuIngresoMenu() si se ingresa la opcion 2.
 * - cajeroMenuTransaccionMenu() si se ingresa la opcion 3.
 * - Se muestra el saldo actual y se vuelve a llamar a esta funcion si se 
 *   ingresa la opcion 4.
 * - Se muestra un mensaje de despedida y se sale del cajeroMenu si se ingresa la 
 *   opcion 5.
 * - Se muestra un mensaje de error y se vuelve a llamar a esta funcion si se 
 *   ingresa una opcion numero distinta de las anteriores.
 */
export function cajeroMenu(cedula) {
    if (cedulaGuardada === false) {
        cedulaGuardada = cedula;
    }
    console.clear();

    console.log(chalk.cyan.bgBlack("\n--- Bienvenido al cajeroMenu ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 si quiere retirar dinero ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 si quiere ingresar dinero ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 si quiere realizar una transacción ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 si quiere revisar su saldo ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 5 si quiere cerrar sesion ---"));

    rl.question("\nDigite la opcion: ", (input) => {
        let opcion = parseInt(input);

        if (isNaN(opcion)) {
            console.clear();
            console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
            setTimeout(() => cajeroMenu(), 1500);
            return;
        }

        switch (opcion) {
            case 1:
                console.clear();
                cajeroRetiroMenu();
                break;
            case 2:
                console.clear();
                cajeroIngresoMenu();
                break;
            case 3:
                console.clear();
                cajeroTransaccionMenu();
                break;
            case 4:
                console.clear();
                db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                    if (err || !row) {
                        console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                        setTimeout(() => cajeroMenu(), 1500);
                    } else {
                        console.log(chalk.green.bgBlack(`\n--- El saldo disponible es de ${row.Saldo}$ ---`));
                        setTimeout(() => cajeroMenu(), 2500);
                    }
                });
                break;
            case 5:
                console.clear();
                console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajeroMenu ---\n"));
                reinicio();
                break;
            default:
                console.clear();
                console.log(chalk.red("\n--- Opción no válida. ---\n"));
                setTimeout(() => cajeroMenu(), 1500);
        }
    });
}

        

        // Funcion para reiniciar el cajeroMenu
        // arrancandolo desde 0

        export function reinicio(dato, mensaje){
            console.clear();
            if (dato === 'error') {
                console.log(chalk.red.bgBlack(`\n --- ${mensaje} ---\n`));
                setTimeout(() => {
                    console.clear();
                    cedulaGuardada = false;
                    loginMenu();
                }, 3000);
                return;
            }
            console.log(chalk.green.bgBlack("\n--- Cerrando sesion ---\n"));
            setTimeout(() => {
                console.clear();
                cedulaGuardada = false;
                loginMenu();
            }, 3000);
        }


export default cajeroMenu