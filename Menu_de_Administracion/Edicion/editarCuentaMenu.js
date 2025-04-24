import chalk from "chalk";
import { rl } from "../../Cajero/Codigo_Central/cajeroMenu.js";
import { menuAdministrador } from "../menuAdministrador.js";
import { pedirCedulaActual } from "./Peticiones/pedirCedulaActual.js";



/**
La funcion editarCuentaMenu() se encarga de mostrar el menu de edicion de cuentas.

Segun la seleccion del usuario, se llama a la funcion pedirCedulaActual(opcion) para ingresar la cedula de la cuenta que se desea editar.

El parametro "opcion" se utiliza para definir que camino segira el codigo.

si "opcion" es 1, entonces se llama a la funcion pedirCedulaActual(1) y despues de unas verificaciones le permite al administrador editar solo el PIN de la cuenta.

si "opcion" es 2, entonces se llama a la funcion pedirCedulaActual(2) y despues de unas verificaciones le permite al administrador editar unicamente el Nombre de la cuenta.

si "opcion" es 3, entonces se llama a la funcion pedirCedulaActual(3) y despues de unas verificaciones le permite al administrador editar solamente el Apellido de la cuenta.

si "opcion" es 4, entonces se llama a la funcion pedirCedulaActual(4) y despues de unas verificaciones le permite al administrador editar el Nombre y Apellido de la cuenta.

si "opcion" es 5, entonces se llama a la funcion pedirCedulaActual(5) y despues de unas verificaciones le permite al administrador editar el Nombre y PIN de la cuenta.

si "opcion" es 6, entonces se llama a la funcion pedirCedulaActual(6) y despues de unas verificaciones le permite al administrador editar el Apellido y PIN de la cuenta.

si "opcion" es 7, entonces se llama a la funcion pedirCedulaActual(7) y despues de unas verificaciones le permite al administrador editar el Nombre, Apellido y PIN de la cuenta.

Si la cedula ingresada no existe en la base de datos, se muestra un mensaje de error y se vuelve a llamar a editarPinCuenta().

Si la cedula ingresada existe en la base de datos, se llama a la funcion colocarPin(cedula) para ingresar el nuevo pin.

*/

export function editarCuentaMenu() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 si quiere editar el PIN de una cuenta ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 si quiere editar el Nombre de una cuenta ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 si quiere editar el Apellido de una cuenta ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 si quiere editar el Nombre y Apellido de una cuenta ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 5 si quiere editar la Nombre y PIN de una cuenta ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 6 si quiere editar la Apellido y PIN de una cuenta ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 7 si quiere editar el Nombre, Apellido y PIN de una cuenta ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 8 si quiere volver al menu principal ---\n"));
    rl.question("\nDigite la opcion: ", (input) => {
        const opcion = parseInt(input.trim());

        switch (opcion) {
            case 1:
                pedirCedulaActual(opcion);
                break;
            case 2:
                pedirCedulaActual(opcion);
                break;
            case 3:
                pedirCedulaActual(opcion);
                break;
            case 4:
                pedirCedulaActual(opcion);
                break;
            case 5:
                pedirCedulaActual(opcion);
                break;
            case 6:
                pedirCedulaActual(opcion);
                break;
            case 7:
                pedirCedulaActual(opcion);
                break;
            case 8:
                menuAdministrador();
                break;
            default:
                console.clear();
                console.log(chalk.red("\n--- Opcion no valida ---\n"));
                setTimeout(editarCuentaMenu, 1500);
        }
    });
}

export default editarCuentaMenu