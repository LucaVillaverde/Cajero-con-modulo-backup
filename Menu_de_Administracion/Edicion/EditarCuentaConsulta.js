import chalk from "chalk";
import { rl } from "../cajero.js";
import { pedirPinActual } from "./pedirPinActual.js";
import { editarCuentaMenu } from "./editarCuentaMenu.js";
import { pedirCedulaActual } from "./pedirCedulaActual.js";

function consulta(){
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 para volver a intentarlo ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 para volver al menu de editar cuenta ---\n"));
    rl.question("\nDigite la opcion: ", (input) => {
        const opcion = parseInt(input.trim());

        switch (opcion) {
            case 1:
                pedirPinActual(cedula);
                break;
            case 2:
                editarCuentaMenu();
                break;
            default:
                console.clear();
                console.log(chalk.red("\n--- Opcion no valida ---\n"));
                setTimeout(() => {
                    console.clear();
                    pedirPinActual(cedula);
                }, 1500);
        }
    });
}