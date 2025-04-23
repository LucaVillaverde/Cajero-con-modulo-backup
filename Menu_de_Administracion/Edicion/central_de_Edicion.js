import chalk from "chalk";
import { editarCuentaMenu } from "./editarCuentaMenu.js";
import menuAdministrador from "../menuAdministrador.js";
import { editarPin } from "./Peticiones/editarPin.js";
import { editarNombre } from "./Peticiones/editarNombre.js";
import { editarApellido } from "./Peticiones/editarApellido.js";




export function central_de_Edicion(cedula, opcion) {
    console.clear();
    if (!cedula) {
        console.log(chalk.red("\n--- No se ha encontrado o no se ha pasado bien la cedula ---\n"));
        setTimeout(editarCuentaMenu, 1500);
        return;
    }
    if (!opcion) {
        console.log(chalk.red("\n--- No se ha determminado correctamente que se quiere editar de la cuenta ---\n"));
        setTimeout(editarCuentaMenu, 1500);
        return;
    }

    if (opcion == 1) {
        editarPin(cedula, opcion);
    } else if (opcion == 2 || opcion == 4 || opcion == 5 || opcion == 7) {
        editarNombre(cedula, opcion);
    } else if (opcion == 3 || opcion == 6) {
        editarApellido(cedula, opcion);
    }   else if (opcion == 8) {
        menuAdministrador();
    } else {
        console.log(chalk.red("\n--- La opcion ingresada no es una opcion valida ---\n"));
        setTimeout(editarCuentaMenu, 1500);
        return;
    }
}

export default central_de_Edicion