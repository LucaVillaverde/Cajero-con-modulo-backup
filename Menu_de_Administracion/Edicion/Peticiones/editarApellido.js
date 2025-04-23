import chalk from "chalk";
import { editarCuentaMenu } from "../editarCuentaMenu.js";
import { editarPin } from "./editarPin.js";
import { rl, db } from "../../../Cajero/Codigo_Central/cajero.js";



export function editarApellido(cedula, opcion) {
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

    console.clear();
    rl.question("\nIngrese el nuevo Apellido: ", (input) => {
        const apellido = input.trim();
        if (!/^[A-Z][a-z]{3,}$/.test(apellido)) {
            console.clear();
            console.log(chalk.red("\n--- El apellido debe contener solo letras, empezar con mayuscula y tener por lo menos 4 caracteres ---\n"));
            setTimeout(() => {
                console.clear();
                editarApellido(cedula, opcion);
            }, 2000);
            return;
        }

        db.get('SELECT Apellido FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al buscar el apellido en la base de datos ---\n"));
                setTimeout(editarCuentaMenu, 1500);
                return;
            }
            if (!row) {
                console.clear();
                console.log(chalk.red("\n--- No se ha encontrado la cuenta en la base de datos ---\n"));
                setTimeout(editarCuentaMenu, 1500);
                return;
            }

            let apellidoDB = row.Apellido;
            if (apellidoDB == apellido) {
                console.clear();
                console.log(chalk.red("\n--- El nuevo apellido no puede ser igual al anterior ---\n"));
                setTimeout(() => {
                    console.clear();
                    editarApellido(cedula, opcion);
                }, 2000);
                return;
            }
            if (opcion == 3 || opcion == 4) {
                console.clear();
                let mensaje = opcion == 3 ? "Se ha editado con exito el apellido" : "Se ha editado con exito el nombre y el apellido";
                db.run('UPDATE Cuenta SET Apellido = ? WHERE Cedula = ?', [apellido, cedula], (err) => {
                    if (err) {
                        console.clear();
                        console.log(chalk.red("\n--- Error al editar el apellido en la base de datos ---\n"));
                        setTimeout(editarCuentaMenu, 1500);
                        return;
                    }
                    console.log(chalk.green(`\n--- ${mensaje} ---\n`));
                    setTimeout(editarCuentaMenu, 1500);
                    return;
                });
            }
            if (opcion == 6) {
                db.run('UPDATE Cuenta SET Apellido = ? WHERE Cedula = ?', [apellido, cedula], (err) => {
                    if (err) {
                        console.clear();
                        console.log(chalk.red("\n--- Error al editar el apellido en la base de datos ---\n"));
                        setTimeout(editarCuentaMenu, 1500);
                        return;
                    }
                    console.clear();
                    editarPin(cedula, opcion);
                    return;
                })
            }
            if (opcion == 7) {
                db.run('UPDATE Cuenta SET Apellido = ? WHERE Cedula = ?', [apellido, cedula], (err) => {
                    if (err) {
                        console.clear();
                        console.log(chalk.red("\n--- Error al editar el apellido en la base de datos ---\n"));
                        setTimeout(editarCuentaMenu, 1500);
                        return;
                    }
                    console.clear();
                    editarPin(cedula, opcion);
                    return;
                })
            }
        }); 
    });
}

export default editarApellido