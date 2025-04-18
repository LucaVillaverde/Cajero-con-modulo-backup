import chalk from "chalk";
import bcrypt from "bcrypt";
import { rl, db } from "./cajero.js";
import { menuAdministrador } from "./menuAdministrador.js";



/**
 * Solicita al usuario colocar el nuevo PIN para la cedula ingresada.
 * 
 * Si el PIN ingresado no cumple con el formato correcto, se muestra un mensaje de error y se vuelve a llamar a la funcion colocarPin(cedula).
 * 
 * Si el PIN ingresado cumple con el formato correcto, se hashea el PIN y se actualiza la cuenta en la base de datos.
 * 
 * @param {string} cedula 
 * @returns 
 */

function colocarPin(cedula) {
    if (!cedula) {
        console.clear();
        console.log(chalk.red("\n--- No se ha encontrado o no se ha pasado bien la cedula ---\n"));
        setTimeout(editarPinCuenta, 1500);
        return;
    }
    console.log(chalk.cyan.bgBlack("\n--- Ingrese el nuevo PIN por favor ---\n"));
    rl.question(chalk.cyan("Ingrese el nuevo PIN: "), (input) => {
        const pin = input.trim();
        if (!/^\d{4}$/.test(pin)) {
            console.clear();
            console.log(chalk.red("\n--- El pin debe tener el formato correcto (ej: 1234). ---\n"));
            setTimeout(() => {
                console.clear();
                colocarPin(cedula);
            }, 1500);
            return;
        } else {
            const hashedPin = bcrypt.hashSync(pin, 10);
            db.run('UPDATE Cuenta SET Pin = ? WHERE Cedula = ?', [hashedPin, cedula], (err) => {
                if (err) {
                    console.clear();
                    console.log(chalk.red("\n--- Error al editar la cuenta ---\n"));
                    console.log(chalk.red("\n--- Volviendo al menu de administrador ---\n"));
                    setTimeout(editarPinCuenta, 1500);
                    return;
                }
                console.clear();
                console.log(chalk.green("\n--- Cuenta editada con exito ---\n"));
                setTimeout(menuAdministrador, 1500);
            });
        }
    })
}

/**
La funcion editarPinCuenta() se encarga de editar el pin de una cuenta existente en la base de datos.

Si la cedula ingresada no existe en la base de datos, se muestra un mensaje de error y se vuelve a llamar a editarPinCuenta().

Si la cedula ingresada existe en la base de datos, se llama a la funcion colocarPin(cedula) para ingresar el nuevo pin.

*/

export function editarPinCuenta() {
    console.clear();
    
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese la Cedula por favor ---\n"));
    rl.question("Ingrese la Cedula: ", (input) => {
        const cedula = input.trim();
        if (!/^\d{7,11}-\d$/.test(cedula)) {
            console.clear();
            console.log(chalk.red("\n--- La cedula debe tener el formato correcto (ej: 12345678-9). ---\n"));
            setTimeout(editarPinCuenta, 1500);
            return;
        }
        db.get('SELECT Cedula FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- No se pudo acceder a la base de datos ---\n"));
                setTimeout(editarPinCuenta, 1500);
                return;
            }
            if (!row) {
                console.clear();
                console.log(chalk.red("\n--- La cedula no existe en la base de datos ---\n"));
                setTimeout(editarPinCuenta, 1500);
                return;
            }
            console.clear();
            colocarPin(cedula);
        })
    });
}

export default editarPinCuenta