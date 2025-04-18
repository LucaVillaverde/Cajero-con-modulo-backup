import readline from 'readline';
import sqlite3 from 'sqlite3';
import chalk from 'chalk';
import keypress from 'keypress';
import transaccion from './transaccion.js';
import retiro from './retiro.js';
import ingreso from './ingreso.js';
import { loginMenu } from './loginMenu.js';

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

let cedulaGuardada = false;


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
    
        // La funcion cajeroIngreso() muestra el menu de ingreso y permite al usuario seleccionar una opcion para realizar una accion.
        // Las opciones disponibles son:
        // - 1: Ingresar 2000$
        // - 2: Ingresar 4000$
        // - 3: Ingresar 6000$
        // - 4: Ingresar un monto especifico
        // - 5: Ver el saldo disponible
        // - 6: Salir
        // Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroIngreso().
        // Si el usuario ingresa una opcion valida, se llama a la funcion ingreso() con el monto correspondiente.

        export function cajeroIngreso() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 si quiere ingresar 2000$ ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 si quiere ingresar 4000$ ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 si quiere ingresar 6000$ ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 si quiere ingresar un monto especifico ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 5 si quiere ver el saldo disponible ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 6 si quiere volver atras ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 7 si quiere cerrar sesion ---\n"));

            rl.question("\nDigite la opcion: ", (input) => {
                let opcion = parseInt(input);

                if (isNaN(opcion)) {
                    console.clear();
                    console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
                    setTimeout(cajeroIngreso, 1500);
                    return;
                }

                console.clear();

                switch (opcion) {
                    case 1:
                        ingreso(2000, cedulaGuardada);
                        break;
                    case 2:
                        ingreso(4000, cedulaGuardada);  
                        break;  
                    case 3:
                        ingreso(6000, cedulaGuardada);
                        break;
                    case 4:
                        rl.question("Indique el monto a ingresar: ", (input) => {
                            const monto = parseInt(input);
                            if (monto <= 500 || monto > 50000 || isNaN(monto)) {
                                console.clear();
                                console.log(chalk.red("\n--- Monto no válido. ---"));
                                setTimeout(cajeroIngreso, 2000);
                            } else {
                                ingreso(monto, cedulaGuardada);
                            }
                        })
                        break;
                    case 5:
                        db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                            if (err || !row) {
                                console.clear();
                                console.error('Error al obtener el saldo de la base de datos.');
                                setTimeout(cajero, 2000);
                                return;
                            }
                            console.clear();
                            console.log(chalk.green("\n--- Su saldo actual es de: " + row.Saldo + "$ ---"));
                            setTimeout(cajeroIngreso, 2000);
                        })
                        break;
                    case 6:
                        console.clear();
                        cajero();
                        break;
                    case 7:
                        console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajero ---"));
                        setTimeout(() => {
                            console.clear();
                            reinicio();
                        }, 1500);
                        break;
                    default:
                        console.clear();
                        console.log(chalk.red("\n--- Opcion no valida. ---"));
                        setTimeout(cajeroIngreso, 2000);
                    }
            })
        }

        // La funcion cajeroRetiro() permite al usuario retirar dinero de su cuenta bancaria
        // y se llama desde la funcion cajero().
        // La funcion cajeroRetiro() despliega un menu interactivo similar al cajero(), pero con las siguientes opciones:
        // - 1: Retirar 2000$
        // - 2: Retirar 4000$
        // - 3: Retirar 6000$
        // - 4: Retirar un monto especifico
        // - 5: Ver el saldo disponible
        // - 6: Salir
        // Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroRetiro().
        // Si el usuario ingresa una opcion valida, se llama a la funcion retirar() con el monto correspondiente.

        export function cajeroRetiro() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 1 si quiere retirar 2000$ --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 2 si quiere retirar 4000$ --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 3 si quiere retirar 6000$ --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 4 si quiere retirar un monto especifico --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 5 si quiere ver el saldo disponible --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 6 si quiere volver atras --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 7 si quiere cerrar sesion --\n"));
    
            rl.question("\nDigite la opción: ", (input) => {
                let opcion = parseInt(input);
    
                if (isNaN(opcion)) {
                    console.clear();
                    console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
                    setTimeout(cajeroRetiro, 1500);
                    return;
                }
    
                console.clear();
    
                switch (opcion) {
                    case 1:
                        retiro(2000, cedulaGuardada);
                        break;
                    case 2:
                        retiro(4000, cedulaGuardada);
                        break;
                    case 3:
                        retiro(6000, cedulaGuardada);
                        break;
                    case 4:
                        rl.question("Ingrese el monto a retirar: ", (input) => {
                            const monto = parseInt(input);
                            if (monto <= 0 || monto > 50000 || isNaN(monto)) {
                                console.clear();
                                console.log(chalk.red("\n--- Monto no válido. ---"));
                                setTimeout(cajeroRetiro, 2000);
                            } else {
                                retiro(monto, cedulaGuardada);
                            }
                        });
                        break;
                    case 5:
                        db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                            if (err || !row) {
                                console.clear();
                                console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                                setTimeout(cajeroRetiro, 2000);
                            } else {
                                console.log(chalk.green.bgBlack("\n--- El saldo disponible es de " + row.Saldo + "$ ---"));
                                console.log(chalk.green.bgBlack("\n--- Gracias por utilizar nuestros servicios ---"));
                                setTimeout(cajeroRetiro, 2000);
                            }
                        });
                        break;
                    case 6:
                        console.clear();
                        cajero();
                        break;
                    case 7:
                        console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajero ---"));
                        setTimeout(() => {
                            console.clear();
                            reinicio();
                        }, 1500);
                        break;
                    default:
                        console.log(chalk.red("\n--- Opción no válida ---"));
                        setTimeout(cajeroRetiro, 1500);
                        break;
                }
            });
        }

        // La funcion cajeroTransaccion() despliega un menu interactivo similar al cajero(), pero con las opciones de realizar una transaccion, ver el saldo disponible o salir.
        // Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion.
        // Si el usuario ingresa una opcion valida, se ejecuta una de las siguientes funciones:
        // - Realiza una transaccion si el usuario ingresa 1
        // - Muestra el saldo disponible si el usuario ingresa 2
        // - llama a la funcion cajero() para ir al menu principal si el usuario ingresa 3
        // - sino ingresa ninguna de esas opciones, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroTransaccion para que el usuario ingrese una opcion valida.

        export function cajeroTransaccion() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 para indicar el monto de la transacción y destinatario (cedula) ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 para ver el saldo disponible ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 para volver atras ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 para cerrar sesion ---\n"));
    
            rl.question("\nDigite la opcion: ", (input) => {
                let opcion = parseInt(input);
    
                if (isNaN(opcion)) {
                    console.clear();
                    console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
                    setTimeout(cajeroTransaccion, 1500);
                    return;
                }
    
                console.clear();
    
                switch (opcion) {
                    case 1:
                        rl.question("Indique el monto de la transacción: ", (input) => {
                            const monto = parseInt(input);
                            if (monto <= 0 || monto > 50000 || isNaN(monto)) {
                                console.clear();
                                console.log(chalk.red("\n--- Monto no válido. ---"));
                                setTimeout(cajeroTransaccion, 2000);
                            } else {
                                console.clear();
                                rl.question("Indique el destino de la transacción: ", (input) => {
                                    const destino = input;
                                    transaccion(monto, destino, cedulaGuardada);
                                })
                            }
                        });
                        break;
                    case 2:
                        db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                            if (err || !row) {
                                console.clear();
                                console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                                setTimeout(cajeroTransaccion, 2000);
                            } else {
                                console.log(chalk.green.bgBlack("\n--- El saldo disponible es de " + row.Saldo + "$ ---\n"));
                                setTimeout(cajeroTransaccion, 2000);
                            }
                        });
                        break;
                    case 3:
                        console.clear();
                        cajero();
                        break;
                    case 4:
                        console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajero ---"));
                        setTimeout(() => {
                            console.clear();
                            reinicio();
                        }, 1500);
                        break;
                    default:
                        console.log(chalk.red("\n--- Opción no válida ---"));
                        setTimeout(cajeroTransaccion, 1500);
                        break;
                }
            })
        }



/**
 * la funcion cajero() Muestra el menu principal del cajero y permite al usuario seleccionar 
 * una opcion para realizar una accion.
 * 
 * Se le pregunta al usuario que ingrese una opcion mediante un prompt.
 * Si el usuario ingresa una opcion que no es un numero, se muestra un 
 * mensaje de error y se vuelve a llamar a esta funcion.
 * Si el usuario ingresa una opcion numero, se ejecuta una de las 
 * siguientes funciones:
 * - cajeroRetiro() si se ingresa la opcion 1.
 * - cajeroIngreso() si se ingresa la opcion 2.
 * - cajeroTransaccion() si se ingresa la opcion 3.
 * - Se muestra el saldo actual y se vuelve a llamar a esta funcion si se 
 *   ingresa la opcion 4.
 * - Se muestra un mensaje de despedida y se sale del cajero si se ingresa la 
 *   opcion 5.
 * - Se muestra un mensaje de error y se vuelve a llamar a esta funcion si se 
 *   ingresa una opcion numero distinta de las anteriores.
 */
export function cajero(cedula) {
    cedulaGuardada = cedula;
    console.clear();

    console.log(chalk.cyan.bgBlack("\n--- Bienvenido al cajero ---"));
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
            setTimeout(() => cajero(cedulaGuardada), 1500);
            return;
        }

        switch (opcion) {
            case 1:
                console.clear();
                cajeroRetiro();
                break;
            case 2:
                console.clear();
                cajeroIngreso();
                break;
            case 3:
                console.clear();
                cajeroTransaccion();
                break;
            case 4:
                console.clear();
                db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                    if (err || !row) {
                        console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                        setTimeout(() => cajero(cedulaGuardada), 1500);
                    } else {
                        console.log(chalk.green.bgBlack(`\n--- El saldo disponible es de ${row.Saldo}$ ---`));
                        setTimeout(() => cajero(cedulaGuardada), 2500);
                    }
                });
                break;
            case 5:
                console.clear();
                console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajero ---\n"));
                reinicio();
                break;
            default:
                console.clear();
                console.log(chalk.red("\n--- Opción no válida. ---\n"));
                setTimeout(() => cajero(cedulaGuardada), 1500);
        }
    });
}

        

        // Funcion para reiniciar el cajero
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


export default cajero