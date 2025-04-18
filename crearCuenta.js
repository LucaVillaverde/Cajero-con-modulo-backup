import chalk from "chalk";
import { appendFile } from "fs";

// La funcion crearCuenta() se encarga de crear una nueva cuenta en la base de datos.
// Si la cedula ingresada ya existe en la base de datos, se muestra un mensaje de error y se vuelve a llamar a crearCuenta().
// Si la cedula ingresada no existe en la base de datos, se pide el pin para la cuenta y se guarda en la base de datos.
// El pin se guarda encriptado en la base de datos.
// Se muestra un mensaje de exito y se vuelve a llamar a la funcion menuAdministrador().

function ingresarPin(cedula, nombre, apellido) {
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
        db.run('INSERT INTO Cuenta (Nombre, Apellido, Cedula, Pin, Saldo) VALUES (?, ?, ?, ?, ?)', [nombre, apellido, cedula, hashedPin, 0], (err) => {
            if (err) {
                console.clear();
                console.log(chalk.red("\n--- Error al crear la cuenta ---\n"));
                setTimeout(crearCuenta, 1500);
                return;
            }
            console.clear();
            console.log(chalk.green("\n--- Cuenta creada con exito ---\n"));
            setTimeout(menuAdministrador, 1500);
        });
    })
}

function ingresarApellido(cedula, nombre) {
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

function ingresarCedula() {
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
                    setTimeout(crearCuenta, 1500);
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

export function crearCuenta() {
    console.clear();
    console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
    ingresarCedula();
}

export default crearCuenta