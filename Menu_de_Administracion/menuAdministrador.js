import chalk from "chalk";
import { rl, reinicio } from "../Cajero/Codigo_Central/cajero.js";;
import { crearCuenta } from "./Creacion/crearCuenta.js"
import { editarCuentaMenu } from "./Edicion/editarCuentaMenu.js"
import { eliminarCuenta } from "./Eliminacion/eliminarCuenta.js"
import { verBaseDeDatos } from "./Menu_Base_de_Datos/Peticiones/DB/verBaseDeDatos.js"


/**
La funcion menuAdministrador() se encarga de mostrar el menu principal del administrador.

Desde este menu se pueden realizar acciones como ver la base de datos, crear una cuenta, editar el pin de una cuenta, eliminar una cuenta y cerrar sesion.

Si se ingresa 1 se llama a la funcion verBaseDeDatos().

Si se ingresa 2 se llama a la funcion crearCuenta().

Si se ingresa 3 se llama a la funcion editarCuentaMenu().

Si se ingresa 4 se llama a la funcion eliminarCuenta().

Si se ingresa 5 se llama a la funcion reinicio().

Si se ingresa cualquier otra opcion se muestra un mensaje de error y se vuelve a llamar a la funcion menuAdministrador().
*/


export function menuAdministrador() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 si quiere ver la base de datos ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 si quiere crear una cuenta ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 para entrar al menu de editar cuenta ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 si quiere eliminar una cuenta ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 5 si quiere cerrar sesion ---\n"));
    rl.question("\nDigite la opcion: ", (input) => {
        const opcion = parseInt(input);
        switch (opcion) {
            case 1:
                verBaseDeDatos();
                break;
            case 2:
                crearCuenta();
                break;
            case 3:
                editarCuentaMenu();
                break;
            case 4:
                eliminarCuenta();
                break;
            case 5:
                reinicio();
                break;
            default:
                console.clear();
                console.log(chalk.yellow.bgBlack("\n--- La opcion ingresada no es valida ---\n"));
                setTimeout(menuAdministrador, 1500);
                break;
        }
    });
}    


export default menuAdministrador