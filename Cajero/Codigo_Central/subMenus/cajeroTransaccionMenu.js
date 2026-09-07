import chalk from "chalk";
import { rl, db, cajeroMenu, reinicio, cedulaGuardada } from "../cajeroMenu.js";
import transaccion from '../../Operaciones/transaccion.js';









// La funcion cajeroTransaccionMenu() despliega un menu interactivo similar al cajero(), pero con las opciones de realizar una transaccion, ver el saldo disponible o salir.
// Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion.
// Si el usuario ingresa una opcion valida, se ejecuta una de las siguientes funciones:
// - Realiza una transaccion si el usuario ingresa 1
// - Muestra el saldo disponible si el usuario ingresa 2
// - llama a la funcion cajero() para ir al menu principal si el usuario ingresa 3
// - sino ingresa ninguna de esas opciones, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroTransaccionMenu para que el usuario ingrese una opcion valida.

export function cajeroTransaccionMenu() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 para indicar el destinatario (cedula) y el monto de la transacción ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 para ver el saldo disponible ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 para volver atras ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 para cerrar sesion ---\n"));
    
    rl.question("\nDigite la opcion: ", (input) => {
        let opcion = parseInt(input);
    
        if (isNaN(opcion)) {
            console.clear();
            console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
            setTimeout(cajeroTransaccionMenu, 1500);
            return;
        }
    
        console.clear();
    
        switch (opcion) {
            case 1:
                rl.question(chalk.cyanBright("\nIndique la cedula del destinatario: "), (input) => {
                    const destino = input.trim();

                    if(!/^\d{7,11}-\d$/.test(destino)) {
                        console.clear();
                        console.log(chalk.red("\n--- La cedula debe tener el formato correcto (ej: 12345678-9). ---\n"));
                        setTimeout(cajeroTransaccionMenu, 2000);
                        return;
                    }

                    if (destino === cedulaGuardada) {
                        console.clear();
                        console.log(chalk.redBright("\n--- No puedes realizar una transacción a tu propia cuenta ---\n"));
                        setTimeout(cajeroTransaccionMenu, 2000);
                        return;
                    }

                    console.clear();

                    console.log(chalk.cyan.bgBlack("\n--- Indique monto de la transacción para " + destino + " ---"));
                    rl.question(chalk.cyanBright("\nIndique el monto de la transacción: "), (input) => {
                        const monto = parseInt(input);
                        if (monto <= 0 || monto > 50000 || isNaN(monto)) {
                            console.clear();
                            let mensaje = monto <= 0 ? "No podemos realizar transacciones con un monto negativo o neutro." : monto > 50000 ? "No podemos realizar transacciones con un monto mayor a 50.000$." : "Monto no valido, asegurese de haber ingresado un numero.";
                            console.log(chalk.redBright(`\n--- ${mensaje} ---\n`));
                            setTimeout(cajeroTransaccionMenu, 2000);
                        } else {
                            console.clear();
                            transaccion(monto, destino);
                        }
                    })
                })
                break;
            case 2:
                db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                    if (err || !row) {
                        console.clear();
                        console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                        setTimeout(cajeroTransaccionMenu, 2000);
                    } else {
                        console.log(chalk.green.bgBlack("\n--- El saldo disponible es de " + row.Saldo + "$ ---\n"));
                        setTimeout(cajeroTransaccionMenu, 2000);
                    }
                });
                break;
            case 3:
                console.clear();
                cajeroMenu();
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
                setTimeout(cajeroTransaccionMenu, 1500);
                break;
        }
    })
}

export default cajeroTransaccionMenu