import chalk from "chalk";
import { rl, db, cajeroMenu, reinicio, cedulaGuardada } from "../cajeroMenu.js";
import ingreso from '../../Operaciones/ingreso.js';







// La funcion cajeroIngresoMenu() muestra el menu de ingreso y permite al usuario seleccionar una opcion para realizar una accion.
// Las opciones disponibles son:
// - 1: Ingresar 2000$
// - 2: Ingresar 4000$
// - 3: Ingresar 6000$
// - 4: Ingresar un monto especifico
// - 5: Ver el saldo disponible
// - 6: Salir
// Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroIngresoMenu().
// Si el usuario ingresa una opcion valida, se llama a la funcion ingreso() con el monto correspondiente.

export function cajeroIngresoMenu() {
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
            setTimeout(cajeroIngresoMenu, 1500);
            return;
        }

        console.clear();

        switch (opcion) {
            case 1:
                ingreso(2000);
                break;
            case 2:
                ingreso(4000);  
                break;  
            case 3:
                ingreso(6000);
                break;
            case 4:
                rl.question("Indique el monto a ingresar: ", (input) => {
                    const monto = parseInt(input);
                    if (monto <= 500 || monto > 50000 || isNaN(monto)) {
                        console.clear();
                        console.log(chalk.red("\n--- Monto no válido. ---"));
                        setTimeout(cajeroIngresoMenu, 2000);
                    } else {
                        ingreso(monto);
                    }
                })
                break;
            case 5:
                db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                    if (err || !row) {
                        console.clear();
                        console.error('Error al obtener el saldo de la base de datos.');
                        setTimeout(cajeroMenu, 2000);
                        return;
                    }
                    console.clear();
                    console.log(chalk.green("\n--- Su saldo actual es de: " + row.Saldo + "$ ---"));
                    setTimeout(cajeroIngresoMenu, 2000);
                })
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
                console.clear();
                console.log(chalk.red("\n--- Opcion no valida. ---"));
                setTimeout(cajeroIngresoMenu, 2000);
            }
    })
}

export default cajeroIngresoMenu