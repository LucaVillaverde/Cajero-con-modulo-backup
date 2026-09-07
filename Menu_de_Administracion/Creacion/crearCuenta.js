import chalk from "chalk";
import { rl, db } from "../../Cajero/Codigo_Central/cajeroMenu.js";
import bcrypt from "bcrypt";
import { menuAdministrador } from "../menuAdministrador.js";
import consulta from "../../Cajero/Consultas_no_admins/consulta.js";
// import { PINTesting, cedulaTesting, nombreTesting, apellidoTesting } from "../../Cajero/Codigo_Central/testingMenu.js";

let Admin = true;
let tipo = "crearCuenta";

// La funcion crearCuenta() se encarga de crear una nueva cuenta en la base de datos.
// Si la cedula ingresada ya existe en la base de datos, se muestra un mensaje de error y se vuelve a llamar a crearCuenta().
// Si la cedula ingresada no existe en la base de datos, se pide el pin para la cuenta y se guarda en la base de datos.
// El pin se guarda encriptado en la base de datos.
// Se muestra un mensaje de exito y se vuelve a llamar a la funcion menuAdministrador().

function ingresarPin(cedula, nombre, apellido) {
    if (cedula === cedulaTesting && nombre === nombreTesting && apellido === apellidoTesting) {
        let hashedPIN = bcrypt.hashSync(PINTesting, 10);
        try {
            db.run('INSERT INTO Cuenta (Nombre, Apellido, Cedula, PIN, Saldo) VALUES (?, ?, ?, ?, ?)', [nombre, apellido, cedula, hashedPIN, 0], (err) => {
                if (err) {
                    console.clear();
                    console.log(chalk.red("\n--- Error al crear la cuenta en la base de datos. ---\n"));
                    return;
                } else {
                    console.clear();
                    console.log(chalk.cyan("\n--- Verificando la creacion de la cuenta ---\n"));
                    db.get('SELECT Cedula, Nombre, Apellido, PIN FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
                        if (err || !row) {
                            console.clear();
                            let mensaje = err ? "\n--- Error al consultar la base de datos ---\n" : "\n--- No se ha encontrado la cuenta en la base de datos ---\n";
                            console.log(chalk.red(`${mensaje}`));
                            return;
                        }
                        const datosCoinciden = row.Cedula === cedula && row.Nombre === nombre && row.Apellido === apellido && bcrypt.compareSync(PINTesting, row.PIN);
                        if (datosCoinciden) {
                            console.clear();
                            console.log(chalk.green("\n--- La creacion de la cuenta fue exitosa ---\n"));
                            console.log(chalk.cyan("\n--- Datos de la cuenta ---\n"));
                            console.log(chalk.cyan(`\nCedula: ${row.Cedula}\n`));
                            console.log(chalk.cyan(`\nNombre: ${row.Nombre}\n`));
                            console.log(chalk.cyan(`\nApellido: ${row.Apellido}\n`));
                            console.log(chalk.cyan(`\nPIN: 1234\n`));
                            console.log(chalk.cyan(`\nSaldo: ${row.Saldo}\n`));
                            console.log(chalk.yellow("\n--- Continuando con el testeo de edicion de la cuenta ---\n"));
                            setTimeout(() => {
                                
                            }, 5000);
                            return;
                        }
                    })
                }
            });
        } catch (error) {
            console.clear();
            console.log(chalk.red("\n--- Error al crear la cuenta en la base de datos. ---\n"));
            setTimeout(menuAdministrador, 1500);
            return;
        }
        return;
    }
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Ingrese el Pin para la cuenta por favor ---\n"));
    rl.question("Ingrese el Pin: ", (input) => {
        const pin = input.trim();
        // Se verifica si el pin ingresado tiene el formato correcto.
        // Si no lo tiene, se muestra un mensaje de error y se vuelve a llamar a la funcion.
        if (!/^\d{4}$/.test(pin)) {
            console.clear();
            console.log(chalk.red("\n--- El pin debe tener el formato correcto (ej: 1234). ---\n"));
            setTimeout(() => {
                ingresarPin(cedula, nombre, apellido);
            });
            return;
        }
        const hashedPin = bcrypt.hashSync(pin, 10);
        db.run('INSERT INTO Cuenta (Nombre, Apellido, Cedula, PIN, Saldo) VALUES (?, ?, ?, ?, ?)', [nombre, apellido, cedula, hashedPin, 0], (err) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al crear la cuenta en la base de datos. ---\n"));
                setTimeout(menuAdministrador, 1500);
                return;
            }
            console.clear();
            console.log(chalk.green("\n--- Cuenta creada con exito ---\n"));
            setTimeout(() => {
                consulta(tipo, Admin)
            },1500);
        });
    })
}

function ingresarApellido(cedula, nombre) {
    if (cedula === cedulaTesting && nombre === nombreTesting) {
        ingresarPin(cedula, nombreTesting, apellidoTesting);
        return;
    }
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Ingrese el apellido para la cuenta por favor--- \n"));
    rl.question("Ingrese el apellido: ", (input) => {
        const apellido = input.trim();
        
        if (!/^[A-Z][a-z]{3,}$/.test(apellido)){
            console.clear();
            console.log(chalk.red.bgBlack("\n--- El apellido debe tener por lo menos 4 caracteres, tener solo letras y empezar con mayuscula. ---\n"));
            setTimeout(() => {
                ingresarApellido(cedula, nombre);
            }, 2000)
        } else {
            ingresarPin(cedula, nombre, apellido);
        }
    });
}

function ingresarNombre(cedula) {
    if (cedula === cedulaTesting) {
        ingresarApellido(cedula, nombreTesting);
        return;
    }
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Ingrese el nombre para la cuenta por favor ---\n"));
    rl.question("Ingrese el nombre: ", (input) => {
        const nombre = input.trim();

        if (!/^[A-Z][a-z]{2,}$/.test(nombre)){
            console.clear();
            console.log(chalk.red.bgBlack("\n--- El nombre debe tener por lo menos 3 caracteres, tener solo letras y empezar con mayuscula. ---\n"))
            setTimeout(() => {
                ingresarNombre(cedula);
            }, 2000)
        } else {
            ingresarApellido(cedula, nombre);
        }
    });
}

function ingresarCedula(cedulaTesting) {
    if (cedulaTesting) {
        ingresarNombre(cedulaTesting);
        return;
    }
    console.log(chalk.cyan.bgBlack("\n--- Ingrese la Cedula por favor ---\n"));
    rl.question("Ingrese la Cedula: ", (input) => {
        const cedula = input.trim();
        // Se verifica si la cedula ingresada tiene el formato correcto.
        // Si no lo tiene, se muestra un mensaje de error y se vuelve a llamar a la funcion.
        if (!/^\d{7,11}-\d$/.test(cedula)) {
            console.clear();
            console.log(chalk.red("\n--- La cedula debe tener el formato correcto (ej: 12345678-9). ---\n"));
            setTimeout(ingresarCedula, 1500);
            return;
        } else {
            db.get('SELECT Cedula FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
                if (err) {
                    console.clear();
                    console.log(chalk.red("\n--- No se pudo acceder a la base de datos ---\n"));
                    setTimeout(menuAdministrador, 1500);
                    return;
                }
                if (row) {
                    console.clear();
                    console.log(chalk.red("\n--- La cedula ya existe en la base de datos ---\n"));
                    setTimeout(ingresarCedula, 1500);
                    return;
                }
                ingresarNombre(cedula);
            });
        }
    });
}

export function crearCuenta(cedulaTesting) {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
    ingresarCedula(cedulaTesting);
}

export default crearCuenta