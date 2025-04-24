import chalk from "chalk";
import { db, rl } from "../../Cajero/Codigo_Central/cajeroMenu.js"
import { consulta } from "../../Cajero/Consultas_no_admins/consulta.js";
import { menuAdministrador } from "../menuAdministrador.js";
import bcrypt from "bcrypt";


let totalEnviadas = 0;
let totalRecibidas = 0;
let errores = 0;
let Admin = true;
let tipo = "eliminarCuenta";

/**
La funcion eliminarCuenta() se encarga de eliminar una cuenta de la base de datos.

Desde este menu se puede ingresar la cedula de la cuenta que se desea eliminar.

Si se ingresa una cedula que no existe en la base de datos se muestra un mensaje de error y se vuelve a llamar a la funcion.

Si se ingresa una cedula que si existe en la base de datos, entonces se elimina la cuenta, el historial de transacciones y se muestra un mensaje de exito.

Si hay un error al eliminar la cuenta, se muestra un mensaje de error y se vuelve a llamar a la funcion.
*/

function hacerBorrado(cedula) {
    console.clear();
    // Primero eliminamos las transacciones relacionadas
    db.run('DELETE FROM Transacciones WHERE Cedula = ? OR Destino = ?', [cedula, cedula], (err) => {
        if (err) {
            console.clear();
            console.log(chalk.red("\n--- Error al eliminar transacciones ---\n"));
            setTimeout(menuAdministrador, 1500);
            return;
        }

        // Luego eliminamos la cuenta
        db.run('DELETE FROM Cuenta WHERE Cedula = ?', [cedula], (err) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al eliminar la cuenta ---\n"));
                setTimeout(eliminarCuenta, 1500);
            } else {
                console.clear();
                console.log(chalk.green("\n--- Cuenta y transacciones eliminadas con éxito ---\n"));
                setTimeout(() => {
                console.clear();
                consulta(tipo, Admin);
                }, 1500);
            }
        });
    });
}

function confirmacion(cedula, nombre, apellido) {
    console.clear();

    console.log(chalk.cyan.bgBlack("\n --- Informacion de la cuenta, lea con atencion. ---\n"));
    console.log(chalk.cyan.bgBlack("\n ---Cedula: " + cedula + " ---\n"));
    console.log(chalk.cyan.bgBlack("\n ---Nombre: " + nombre + " ---\n"));
    console.log(chalk.cyan.bgBlack("\n ---Apellido: " + apellido + " ---\n"));
    console.log(chalk.cyan.bgBlack("\n ---Operaciones realizadas: " + totalEnviadas + " ---\n"));
    console.log(chalk.cyan.bgBlack("\n ---Transacciones recibidas: " + totalRecibidas + " ---\n"));
    console.log(chalk.yellowBright.bgBlack("\n ---------------------------------------------------------\n"));
    console.log(chalk.cyan.bgBlack("\n --- ¿Esta seguro que desea eliminar la cuenta? ---\n"));
    console.log(chalk.cyan.bgBlack("\n --- Ingrese 1 para confirmar ---\n"));
    console.log(chalk.cyan.bgBlack("\n --- Ingrese 2 para cancelar ---\n"));
    rl.question("\n Ingrese la opcion: ", (input) => {
        const opcion = parseInt(input);

        switch (opcion) {
            case 1:
                console.clear();
                console.log("");
                let dots = '.';
                let pasadas = 0;
                const maxPasadas = 4;
                
                const interval = setInterval(() => {
                    if (dots.length < 3) {
                        dots += '.';
                    } else {
                        dots = '.';
                        pasadas++;
                    }
                    process.stdout.clearLine(0); // Limpia la línea actual en la consola
                    process.stdout.cursorTo(0); // Mueve el cursor al inicio de la línea
                    process.stdout.write(chalk.green(`--- Eliminando Cuenta${dots} ---`)); // Escribe la frase con los puntos
                    if (pasadas >= maxPasadas) {
                        clearInterval(interval);
                        process.stdout.clearLine(0);
                        process.stdout.cursorTo(0);
                        hacerBorrado(cedula);
                    }
                }, 400); // Actualiza cada 0,2 segundos
                break;
            case 2:
                console.clear();
                console.log(chalk.red("\n--- Operacion cancelada ---\n"));
                setTimeout(menuAdministrador, 1500);
                break
            default:
                console.clear();
                console.log(chalk.red("\n--- Opcion no valida ---\n"));
                setTimeout(() => {
                    confirmacion(cedula, nombre, apellido);
                }, 1500);
        }
    });
}


function indicarPin(cedula, nombre, apellido) {
    if (!cedula) {
        console.clear();
        console.log(chalk.red("\n--- La cedula no fue establecida como parametro ---\n"));
        setTimeout(() => {
            indicarCedula();
        }, 2000);
        return;
    }

    if (!/^\d{7,11}-\d$/.test(cedula)) {
        console.clear();
        console.log(chalk.red("\n--- La cedula fue establecida como parametro pero no tiene el formato correcto (ej: 12345678-9). ---\n"));
        setTimeout(() => {
            indicarCedula();
        }, 2000);
        return;
    }

    rl.question("\nIngrese el PIN de la cuenta a borrar: ", (input) => {
        const pin = input.trim();
        
        if (!/^\d{4}$/.test(pin)) {
            console.clear();
            console.log(chalk.red("\n--- El pin debe tener el formato correcto (ej: 1234). ---\n"));
            setTimeout(() => {
                console.clear();
                indicarPin(cedula, nombre, apellido);
            }, 1500);
            return;
        }

        db.get('SELECT PIN FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
                setTimeout(() => {
                    console.clear();
                    eliminarCuenta();
                }, 1500);
                return;
            }
            if (!row) {
                console.clear();
                console.log(chalk.red("\n--- La cedula no existe en la base de datos o no se pudo conseguir el pin ---\n"));
                setTimeout(() => {
                    console.clear();
                    eliminarCuenta();
                }, 1500);
                return;
            }

            if (bcrypt.compareSync(pin, row.PIN)) {
                console.clear();
                console.log(chalk.green("\n--- Pin correcto ---\n"));
                setTimeout(() => {
                    confirmacion(cedula, nombre, apellido);
                }, 1000);
            } else {
                if (errores >= 3) {
                    console.clear();
                    errores = 0;
                    console.log(chalk.red("\n--- Has agotado tus intentos ---\n"));
                    setTimeout(() => {
                        console.clear();
                        menuAdministrador();
                    }, 1500);
                    return;
                } else {
                    console.clear();
                    console.log(chalk.red("\n--- Pin incorrecto ---\n"));
                    console.log(chalk.red("\n--- Te quedan " + (3 - errores) + " intentos ---\n"));
                    setTimeout(() => {
                        console.clear();
                        errores++;
                        indicarPin(cedula, nombre, apellido);
                    }, 1500);
                }
            }
        })
    });
}

function indicarCedula() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese la Cedula por favor ---\n"));

    rl.question("Ingrese la cedula de la cuenta que desea eliminar: ", (input) => {
        const cedula = input.trim();

        if (!/^\d{7,11}-\d$/.test(cedula)) {
            console.clear();    
            console.log(chalk.red("\n--- La cedula debe tener el formato correcto (ej: 12345678-9). ---\n"));
            setTimeout(indicarCedula, 1500);
            return;
        }

        db.get('SELECT Nombre, Apellido FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
                setTimeout(eliminarCuenta, 1500);
                return;
            }
            if (!row) {
                console.clear();
                console.log(chalk.red("\n--- La cuenta no existe ---\n"));
                setTimeout(eliminarCuenta, 1500);
                return;
            }

            let nombre = row.Nombre;
            let apellido = row.Apellido;

            if (nombre === null || apellido === null){
                console.clear();
                console.log(chalk.red("\n--- No se ha podido averiguar el nombre o apellido del usuario ---\n"));
                setTimeout(indicarCedula, 2000);
                return;
            }


            db.all('SELECT * FROM Transacciones WHERE Cedula = ?', [cedula], (err, rows) => {
                if (err) {
                    console.log(chalk.red("\n--- Error al obtener transacciones enviadas ---\n"));
                    return;
                }

                totalEnviadas = rows.length;
                
                db.all('SELECT * FROM Transacciones WHERE Destino = ?', [cedula], (err, rows) => {
                    if (err) {
                        console.log(chalk.red("\n--- Error al obtener transacciones recibidas ---\n"));
                        return;
                    }
                
                    totalRecibidas = rows.length;
                });
            });

            indicarPin(cedula, nombre, apellido);
        })
    })
}

export function eliminarCuenta() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 si esta seguro de eliminar una cuenta ---\n"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 si desea volver al menu principal ---\n"));

    rl.question("\nDigite la opcion: ", (input) => {
        const opcion = parseInt(input.trim());

        switch (opcion) {
            case 1:
                indicarCedula();
                break;
            case 2:
                menuAdministrador();
                break;
            default:
                console.clear();
                console.log(chalk.red("\n--- Opcion no valida ---\n"));
                setTimeout(eliminarCuenta, 1500);
        }
    });
}

export default eliminarCuenta