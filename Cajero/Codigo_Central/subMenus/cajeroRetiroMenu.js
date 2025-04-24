import chalk from "chalk";
import { rl, db, cajeroMenu, reinicio } from "../cajeroMenu.js";
import retiro from '../../Operaciones/retiro.js';





// La funcion cajeroRetiroMenu() permite al usuario retirar dinero de su cuenta bancaria
// y se llama desde la funcion cajero().
// La funcion cajeroRetiroMenu() despliega un menu interactivo similar al cajero(), pero con las siguientes opciones:
// - 1: Retirar 2000$
// - 2: Retirar 4000$
// - 3: Retirar 6000$
// - 4: Retirar un monto especifico
// - 5: Ver el saldo disponible
// - 6: Salir
// Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroRetiroMenu().
// Si el usuario ingresa una opcion valida, se llama a la funcion retirar() con el monto correspondiente.

export function cajeroRetiroMenu() {
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
            setTimeout(cajeroRetiroMenu, 1500);
            return;
        }
    
        console.clear();
    
        switch (opcion) {
            case 1:
                retiro(2000);
                break;
            case 2:
                retiro(4000);
                break;
            case 3:
                retiro(6000);
                break;
            case 4:
                rl.question("Ingrese el monto a retirar: ", (input) => {
                    const monto = parseInt(input);
                    if (monto <= 0 || monto > 50000 || isNaN(monto)) {
                        console.clear();
                        console.log(chalk.red("\n--- Monto no válido. ---"));
                        setTimeout(cajeroRetiroMenu, 2000);
                    } else {
                        retiro(monto);
                    }
                });
                break;
            case 5:
                db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                    if (err || !row) {
                        console.clear();
                        console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                        setTimeout(cajeroRetiroMenu, 2000);
                    } else {
                        console.log(chalk.green.bgBlack("\n--- El saldo disponible es de " + row.Saldo + "$ ---"));
                        console.log(chalk.green.bgBlack("\n--- Gracias por utilizar nuestros servicios ---"));
                        setTimeout(cajeroRetiroMenu, 2000);
                    }
                });
                break;
            case 6:
                console.clear();
                cajeroMenu();
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
                setTimeout(cajeroRetiroMenu, 1500);
                break;
        }
    });
}