import chalk from "chalk";
import { editarCuentaMenu } from "../editarCuentaMenu.js";
import { pedirPinActual } from "./pedirPinActual.js";   
import { rl, db } from "../../../Cajero/Codigo_Central/cajeroMenu.js";


/**
 * @param {number} opcion
 * opcion es un numero que se utiliza para definir que camino segira el codigo
 * 
 * Esta funcion se encarga de pedir la cedula de la cuenta que se desea editar y comprobar que existe en la base de datos
 * 
 * Luego de la comprobacion se llama a la funcion pedirPinActual(cedula) para ingresar el PIN actual de la cuenta
 */


export function pedirCedulaActual(opcion) {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Ingrese la Cedula de la cuenta a editar por favor ---\n"));
    rl.question("Ingrese la Cedula: ", (input) => {
        const cedula = input.trim();
        if (!/^\d{7,11}-\d$/.test(cedula)) {
            console.clear();
            console.log(chalk.red("\n--- La cedula debe tener el formato correcto (ej: 12345678-9). ---\n"));
            setTimeout(() => {
                pedirCedulaActual(opcion);
            }, 1500);
            return;
        }
        db.get('SELECT Cedula FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- No se pudo acceder a la base de datos ---\n"));
                setTimeout(editarCuentaMenu, 1500);
                return;
            }
            if (!row) {
                console.clear();
                console.log(chalk.red("\n--- La cedula no existe en la base de datos ---\n"));
                setTimeout(() => {
                    pedirCedulaActual(opcion);
                }, 2000);
                return;
            }
            pedirPinActual(cedula, opcion);
        })
    });
}

export default pedirCedulaActual