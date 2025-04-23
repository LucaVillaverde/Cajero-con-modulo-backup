import { rl, db } from "../../../Cajero/Codigo_Central/cajero.js";
import chalk from "chalk";
import { editarCuentaMenu } from "../editarCuentaMenu.js";
import { editarPin } from "./editarPin.js";
import { editarApellido } from "./editarApellido.js";






export function editarNombre(cedula, opcion) {
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
    rl.question("\nIngrese el nuevo nombre: ", (input) => {
        const nombre = input.trim();
        if (!/^[A-Z][a-z]{2,}$/.test(nombre)) {
            console.clear();
            console.log(chalk.red("\n--- El nombre debe contener solo letras y empezar con mayuscula ---\n"));
            setTimeout(() => {
                console.clear();
                editarNombre(cedula, opcion);
            }, 2000);
            return;
        }

        db.get('SELECT Nombre FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al buscar el nombre en la base de datos ---\n"));
                setTimeout(editarCuentaMenu, 1500);
                return;
            }
            if (!row) {
                console.clear();
                console.log(chalk.red("\n--- No se ha encontrado la cuenta en la base de datos ---\n"));
                setTimeout(editarCuentaMenu, 1500);
                return;
            }

            let nombreDB = row.Nombre;
            if (nombreDB == nombre) {
                console.clear();
                console.log(chalk.red("\n--- El nuevo nombre no puede ser igual al anterior ---\n"));
                setTimeout(() => {
                    console.clear();
                    editarNombre(cedula, opcion);
                }, 2000);
                return;
            } else {
                if (opcion == 2) {
                    db.run('UPDATE Cuenta SET Nombre = ? WHERE Cedula = ?', [nombre, cedula], (err) => {
                        if (err) {
                            console.clear();
                            console.log(chalk.red("\n--- Error al editar el nombre en la base de datos ---\n"));
                            setTimeout(editarCuentaMenu, 1500);
                            return;
                        }
                        console.clear();
                        console.log(chalk.green("\n--- El nombre se ha editado con exito ---\n"));
                        setTimeout(editarCuentaMenu, 1500);
                    })
                }
                if (opcion == 4) {
                    db.run('UPDATE Cuenta SET Nombre = ? WHERE Cedula = ?', [nombre, cedula], (err) => {
                        if (err) {
                            console.clear();
                            console.log(chalk.red("\n--- Error al editar el nombre en la base de datos ---\n"));
                            setTimeout(editarCuentaMenu, 1500);
                            return;
                        }
                        console.clear();
                        editarApellido(cedula, opcion);
                        return;
                    })
                }
                if (opcion == 5) {
                    db.run('UPDATE Cuenta SET Nombre = ? WHERE Cedula = ?', [nombre, cedula], (err) => {
                        if (err) {
                            console.clear();
                            console.log(chalk.red("\n--- Error al editar el nombre en la base de datos ---\n"));
                            setTimeout(editarCuentaMenu, 1500);
                            return;
                        }
                        console.clear();
                        editarPin(cedula, opcion);
                        return;
                    })
                }
                if (opcion == 7) {
                    db.run('UPDATE Cuenta SET Nombre = ? WHERE Cedula = ?', [nombre, cedula], (err) => {
                        if (err) {
                            console.clear();
                            console.log(chalk.red("\n--- Error al editar el nombre en la base de datos ---\n"));
                            setTimeout(editarCuentaMenu, 1500);
                            return;
                        }
                        editarApellido(cedula, opcion);
                        return;
                    })
                }
            }
        });
    })
}

export default editarNombre