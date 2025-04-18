import chalk from "chalk";
import { rl, reinicio } from "./cajero.js";
import { verCuentas } from "./verCuentas.js";
import { verHistorial } from "./verHistorial.js";
import { menuAdministrador } from "./menuAdministrador.js";




/**
La funcion verBaseDeDatos() se encarga de mostrar el menu de base de datos.

Desde este menu se pueden realizar acciones como ver las cuentas existentes, ver el historial de procesos, regresar al menu principal del administrador o cerrar sesion.

Si se ingresa 1 se llama a la funcion verCuentas().

Si se ingresa 2 se llama a la funcion verHistorial().

Si se ingresa 3 se llama a la funcion menuAdministrador().

Si se ingresa 4 se llama a la funcion reinicio().

Si se ingresa cualquier otra opcion se muestra un mensaje de error y se vuelve a llamar a la funcion verBaseDeDatos().
*/


export function verBaseDeDatos() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
    console.log(chalk.cyan.bgBlack("\n--- Digite 1 para ver las cuentas existentes ---"));
    console.log(chalk.cyan.bgBlack("\n--- Digite 2 para ver el historial de procesos ---"));
    console.log(chalk.cyan.bgBlack("\n--- Digite 3 para regresar al menu principal del administrador ---"));
    console.log(chalk.cyan.bgBlack("\n--- Digite 4 para cerrar sesion ---\n"));
    rl.question("\nDigite la opcion: ", (input) => {
        const opcion = parseInt(input);
        switch (opcion) {
            case 1:
                verCuentas();
                break;
            case 2:
                verHistorial();
                break;
            case 3:
                menuAdministrador();
                break;
            case 4:
                reinicio();
                break;
            default:
                console.clear();
                console.log(chalk.red("\n--- Opcion no valida ---\n"));
                setTimeout(verBaseDeDatos, 1500);
                break;
        }
    })
}

export default verBaseDeDatos