import chalk from "chalk";
import bcrypt from "bcrypt";
import editarCuentaMenu from "../editarCuentaMenu.js";
import { rl, db } from "../../../Cajero/Codigo_Central/cajero.js";










export function editarPin(cedula, opcion) {

    if (!cedula) {
        console.clear();
        console.log(chalk.red("\n--- No se ha encontrado o no se ha pasado bien la cedula ---\n"));
        setTimeout(editarCuentaMenu, 1500);
        return;
    }
    if (!opcion) {
        console.clear();
        console.log(chalk.red("\n--- No se ha determminado correctamente que se quiere editar de la cuenta ---\n"));
        setTimeout(editarCuentaMenu, 1500);
        return;
    }

    db.get('SELECT PIN FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
        if (err) {
            console.clear();
            console.log(chalk.red("\n--- Error al buscar el PIN en la base de datos ---\n"));
            setTimeout(editarCuentaMenu, 1500);
            return;
        }
        if (!row) {
            console.clear();
            console.log(chalk.red("\n--- No se ha encontrado la cuenta en la base de datos ---\n"));
            setTimeout(editarCuentaMenu, 1500);
            return;
        }

        let hashedPinDB = row.PIN;

        rl.question("\nIngrese el nuevo PIN: ", (input) => {
            const pin = input.trim();
            if (!/^\d{4}$/.test(pin)) {
                console.clear();
                console.log(chalk.red("\n--- El pin debe tener el formato correcto (ej: 1234). ---\n"));
                setTimeout(() => {
                    console.clear();
                    editarPin(cedula, opcion);
                }, 1500);
                return;
            }
    
    
            let hashedPin = bcrypt.hashSync(pin, 10);
            let verificacion = bcrypt.compareSync(pin, hashedPinDB);
    
            if (verificacion) {
                console.clear();
                console.log(chalk.red("\n--- El nuevo PIN no puede ser igual al anterior ---\n"));
                setTimeout(() => {
                    console.clear();
                    editarPin(cedula, opcion);
                }, 1500);
                return;
            } else {
                if (opcion == 1 || opcion == 5 || opcion == 6 || opcion == 7) {
                    let mensaje = opcion == 1 ? "Se ha editado el PIN con exito" : opcion == 5 ? "Se ha editado el nombre y el PIN con exito" : opcion == 6 ? "Se ha editado el apellido y el PIN con exito" : "Se ha editado el nombre, el apellido y el PIN con exito";
                    db.run("UPDATE Cuenta SET PIN = ? WHERE Cedula = ?", [hashedPin, cedula], (err) => {
                        if (err) {
                            console.clear();
                            console.log(chalk.red("\n--- Error al editar la cuenta en la base de datos ---\n"));
                            setTimeout(editarCuentaMenu, 1500);
                            return;
                        }
                        console.clear();
                        console.log(chalk.green(`\n--- ${mensaje} ---\n`));
                        setTimeout(editarCuentaMenu, 1500);
                    });
                }
            }
        });
    });
}

export default editarPin