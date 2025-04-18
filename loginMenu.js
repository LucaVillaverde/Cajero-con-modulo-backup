import chalk from "chalk";
import bcrypt from "bcrypt";
import { rl, db, cajero } from "./cajero.js";
import { menuAdministrador } from "./menuAdministrador.js";

let errores = 0;
let cedulaDB = false;

function solicitarCedula() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Ingrese su Cedula por favor ---\n"));

    rl.question("Ingrese su número de Cédula: ", (input) => {
        const cedula = input.trim();

        if (cedula === "Administrador") {
            solicitarPin(cedula);
            return;
        }

        if (!/^\d{7,11}-\d$/.test(cedula)) {
            console.clear();
            console.log(chalk.red("\n--- La cédula debe tener el formato correcto (ej: 12345678-9). ---\n"));
            return solicitarCedula();
        }

        db.get('SELECT PIN FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
                return solicitarCedula();
            }

            if (!row) {
                console.clear();
                console.log(chalk.red("\n--- La cédula no existe en la base de datos ---\n"));
                return solicitarCedula();
            }

            cedulaDB = cedula;
            solicitarPin();
        });
    });
}

function solicitarPin(cedula) {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Ingrese su Pin por favor ---\n"));

    rl.question("Ingrese su Pin: ", (input) => {
        const pin = input.trim();

        // Caso especial: administrador
        if (cedula === "Administrador") {
            if (pin === "AdminPassword") {
                console.clear();
                return menuAdministrador();
            } else {
                console.clear();
                console.log(chalk.red("\n--- Pin incorrecto ---\n"));
                return loginMenu();
            }
        }

        if (!/^\d{4}$/.test(pin)) {
            console.clear();
            console.log(chalk.red("\n--- El pin debe tener el formato correcto (ej: 1234). ---\n"));
            return solicitarPin();
        }

        db.get('SELECT PIN, Nombre FROM Cuenta WHERE Cedula = ?', [cedulaDB], (err, rows) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
                return solicitarPin();
            }

            if (!rows) {
                console.clear();
                console.log(chalk.red("\n--- La cédula no existe en la base de datos ---\n"));
                return solicitarPin();
            }

            const hashedPin = rows.PIN;
            const verif = bcrypt.compareSync(pin, hashedPin);

            if (verif) {
                console.clear();
                console.log(chalk.green("\n--- Bienvenido " + rows.Nombre + " ---\n"));
                cajero(cedulaDB);
            } else {
                console.clear();
                console.log(chalk.red("\n--- Pin incorrecto ---\n"));
                console.log(chalk.yellow("\n--- Intentos restantes: " + (2 - errores) + " ---\n"));
                errores++;

                if (errores >= 3) {
                    console.clear();
                    console.log(chalk.red("\n--- Has llegado al límite de intentos. ---\n"));
                    console.log(chalk.red("\n--- Bloqueando. ---\n"));
                    setTimeout(() => {
                        console.clear();
                        rl.close();
                    }, 3000);
                } else {
                    setTimeout(solicitarPin, 2000);
                }
            }
        });
    });
}

/**
 * La funcion loginMenu() se encarga de solicitar al usuario su cedula y pin.
 *
 * Luego se verifica si la cedula y el pin son correctos (Tanto en formato como en base de datos).
 *
 * Si son correctos, se llama a la funcion cajero().
 *
 * Si el formato de alguno de los dos no es correcto, se muestra un mensaje de error y se vuelve a llamar a la funcion.
 *
 * Si el formato es correcto pero no se encuentra en la base de datos, se muestra un mensaje de error y se le informa al usuario que le quedan dos intentos restantes.
 *
 * Al llegar a 3 intentos fallidos, se bloquea el cajero.
 *
 * Si todo fue bien, se llama a la funcion cajero().
 */

export function loginMenu() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido al cajero ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Seleccione 1 para loguearse ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Seleccione 2 para cerrar el programa ---\n"));

    rl.question(chalk.cyan("\nSeleccione una opción: "), (input) => {
        const opcion = parseInt(input);
        switch (opcion) {
            case 1:
                solicitarCedula();
                break;
            case 2:
                console.clear();
                console.log(chalk.red("\n--- Saliendo... ---"));
                rl.close();
                process.exit(0);
            default:
                console.clear();
                console.log(chalk.red("\n--- Opción no válida ---\n"));
                setTimeout(loginMenu, 1500);
                break;
        }
    });
}

export default loginMenu;
