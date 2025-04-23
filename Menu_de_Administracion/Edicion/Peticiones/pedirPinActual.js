import chalk from "chalk";
import bcrypt from "bcrypt";
import editarCuentaMenu from "../editarCuentaMenu.js";
import { central_de_Edicion } from "../central_de_Edicion.js";
import { rl, db } from "../../../Cajero/Codigo_Central/cajero.js";



export function pedirPinActual(cedula, opcion) {
    console.clear();
    if (!cedula) {
        console.clear();
        console.log(chalk.red("\n--- No se ha encontrado o no se ha pasado bien la cedula ---\n"));
        setTimeout(() => {
            console.clear();
            pedirCedulaActual(opcion);
        }, 1500);
        return;
    }
    if (!opcion) {
        console.clear();
        console.log(chalk.red("\n--- No se ha determminado correctamente que se quiere editar de la cuenta ---\n"));
        setTimeout(editarCuentaMenu, 1500);
        return;
    }
    let hashedPin;

    db.get('SELECT PIN FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
        if (err) {
            console.clear();
            console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
            console.log(chalk.red("\n--- Volviendo al menu de editar cuenta ---\n"));
            setTimeout(editarCuentaMenu, 1500);
            return;
        }
        if (!row) {
            console.clear();
            console.log(chalk.red("\n--- La cedula no existe en la base de datos ---\n"));
            setTimeout(() => {
                console.clear();
                pedirCedulaActual(opcion);
            }, 1500);
            return;
        }
        hashedPin = row.PIN;
        
    });
    console.log(chalk.cyan.bgBlack("\n--- Ingrese el PIN actual de la cuenta a editar por favor ---\n"));
    rl.question(chalk.cyan("Ingrese el PIN: "), (input) => {
        const pin = input.trim();
        if (!/^\d{4}$/.test(pin)) {
            console.clear();
            console.log(chalk.red("\n--- El pin debe tener el formato correcto (ej: 1234). ---\n"));
            setTimeout(() => {
                console.clear();
                pedirPinActual(cedula, opcion);
            }, 1500);
            return;
        } else {
            let verificacion = bcrypt.compare(pin, hashedPin);
            if (verificacion) {
                console.clear();
                console.log(chalk.green("\n--- Pin correcto ---\n"));
                setTimeout(() => {
                    console.clear();
                    central_de_Edicion(cedula, opcion);
                }, 1500);
            } else {
                console.clear();
                console.log(chalk.red("\n--- El pin ingresado es incorrecto ---\n"));
                setTimeout(() => {
                    console.clear();
                    pedirPinActual(cedula, opcion);
                }, 1500);
            }
        }
    });
}

export default pedirPinActual