import readline from 'readline';
import sqlite3 from 'sqlite3';
import chalk from 'chalk';
import bcrypt from 'bcrypt';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const baseDeDatosOriginal = './miBaseDeDatos.db'; // Asegúrate de que esta ruta sea correcta
let codigoPin = false;
let cedulaGuardada = false;
let verifCed = false;
let verifPin = false;
let errores = 0;


const db = new sqlite3.Database(baseDeDatosOriginal, (err) => {
    console.clear();
    if (err) {
        console.log(chalk.red(`\n--- No se pudo encontrar la base de datos ---`));
            db.serialize(() => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS Cuenta (
                        Nombre TEXT NOT NULL,
                        Apellido TEXT NOT NULL,
                        Cedula TEXT PRIMARY KEY,
                        PIN TEXT NOT NULL,
                        Saldo INTEGER NOT NULL DEFAULT 0
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error al crear la tabla Cuenta:', err.message);
                    } else {
                        console.log(chalk.green('--- Tabla Cuenta creada correctamente ---'));
                    }
                });
            
                db.run(`
                    CREATE TABLE IF NOT EXISTS Transacciones (
                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                        Cedula TEXT NOT NULL,
                        Tipo TEXT NOT NULL,
                        Monto INTEGER NOT NULL,
                        Destino TEXT,
                        Fecha TEXT NOT NULL
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error al crear la tabla Transacciones:', err.message);
                    } else {
                        console.log(chalk.green('--- Tabla Transacciones creada correctamente ---'));
                    }
                setTimeout(() => {
                    console.clear();
                    pedirPin();
                })
                });
            });  
    } else {
        console.clear();
        console.log(chalk.green('\n--- Base de datos conectada correctamente ---\n'));
        setTimeout(() => {
            console.clear();
            pedirPin();
        }, 2000);
    }
});


    
        // La funcion crearCuenta() se encarga de crear una nueva cuenta en la base de datos.
        // Si la cedula ingresada ya existe en la base de datos, se muestra un mensaje de error y se vuelve a llamar a crearCuenta().
        // Si la cedula ingresada no existe en la base de datos, se pide el pin para la cuenta y se guarda en la base de datos.
        // El pin se guarda encriptado en la base de datos.
        // Se muestra un mensaje de exito y se vuelve a llamar a la funcion menuAdministrador().

        function crearCuenta() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese la Cedula por favor ---\n"));
            rl.question("Ingrese la Cedula: ", (input) => {
                const cedula = input.trim();
                // Se verifica si la cedula ingresada tiene el formato correcto.
                // Si no lo tiene, se muestra un mensaje de error y se vuelve a llamar a la funcion.
                if (!/^\d{7,11}-\d$/.test(cedula)) {
                    console.clear();
                    console.log(chalk.red("\n--- La cedula debe tener el formato correcto (ej: 12345678-9). ---\n"));
                    setTimeout(crearCuenta, 1500);
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
                            setTimeout(crearCuenta, 1500);
                            return;
                        }

                        console.clear();
                        console.log(chalk.cyan.bgBlack("\n--- Ingrese el nombre para la cuenta por favor ---\n"));
                        rl.question("Ingrese el nombre: ", (input) => {
                            const nombreInput = input.trim();

                            if (!/^[A-Z][a-z]{2,}$/.test(nombreInput)){
                                console.clear();
                                console.log(chalk.red.bgBlack("\n--- El nombre debe tener por lo menos 3 caracteres, tener solo letras y empezar con mayuscula. ---\n"))
                                setTimeout(crearCuenta, 2000);
                            } else {
                                console.clear();
                                console.log(chalk.cyan.bgBlack("\n--- Ingrese el apellido para la cuenta por favor--- \n"));
                                rl.question("Ingrese el apellido: ", (input) => {
                                    const apellidoInput = input.trim();
                                    
                                    if (!/^[A-Z][a-z]{3,}$/.test(apellidoInput)){
                                        console.clear();
                                        console.log(chalk.red.bgBlack("\n--- El apellido debe tener por lo menos 4 caracteres, tener solo letras y empezar con mayuscula. ---\n"));
                                        setTimeout(crearCuenta, 2000);
                                    } else {
                                        console.clear();
                                        console.log(chalk.cyan.bgBlack("\n--- Ingrese el Pin para la cuenta por favor ---\n"));
                                        rl.question("Ingrese el Pin: ", (input) => {
                                            const pin = input.trim();
                                            // Se verifica si el pin ingresado tiene el formato correcto.
                                            // Si no lo tiene, se muestra un mensaje de error y se vuelve a llamar a la funcion.
                                            if (!/^\d{4}$/.test(pin)) {
                                                console.clear();
                                                console.log(chalk.red("\n--- El pin debe tener el formato correcto (ej: 1234). ---\n"));
                                                setTimeout(crearCuenta, 1500);
                                                return;
                                            }
                                            const hashedPin = bcrypt.hashSync(pin, 10);
                                            db.run('INSERT INTO Cuenta (Nombre, Apellido, Cedula, Pin, Saldo) VALUES (?, ?, ?, ?, ?)', [nombreInput, apellidoInput, cedula, hashedPin, 0], (err) => {
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
                                });
                            }
                        });
                    });
                }
            });
        }

        // La funcion editarPinCuenta() se encarga de editar el pin de una cuenta existente en la base de datos.
        // Si la cedula ingresada no existe en la base de datos, se muestra un mensaje de error y se vuelve a llamar a editarPinCuenta().
        // Si la cedula ingresada existe en la base de datos, se muestra una solicitud de pin nuevo y se verifica si el pin ingresado tiene el formato correcto.
        // Si no lo tiene, se muestra un mensaje de error y se vuelve a llamar a editarPinCuenta().
        // Si el pin ingresado es correcto, se actualiza el pin de la cuenta en la base de datos y se muestra un mensaje de exito.
        
        function editarPinCuenta() {
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
                    console.log(chalk.cyan.bgBlack("\n--- Ingrese el nuevo PIN para la cuenta por favor ---\n"));
                    rl.question("Ingrese el PIN: ", (input) => {
                        const pin = input.trim();
                        if (!/^\d{4}$/.test(pin)) {
                            console.clear();
                            console.log(chalk.red("\n--- El pin debe tener el formato correcto (ej: 1234). ---\n"));
                            setTimeout(editarPinCuenta, 1500);
                            return;
                        } else {
                            const hashedPin = bcrypt.hashSync(pin, 10);
                            db.run('UPDATE Cuenta SET Pin = ? WHERE Cedula = ?', [hashedPin, cedula], (err) => {
                                if (err) {
                                    console.clear();
                                    console.log(chalk.red("\n--- Error al editar la cuenta ---\n"));
                                    setTimeout(editarPinCuenta, 1500);
                                    return;
                                }
                                console.clear();
                                console.log(chalk.green("\n--- Cuenta editada con exito ---\n"));
                                setTimeout(menuAdministrador, 1500);
                            });
                        }
                    })
                })
            });
        }

        // La funcion eliminarCuenta() se encarga de eliminar una cuenta de la base de datos.
        // Desde este menu se puede ingresar la cedula de la cuenta que se desea eliminar.
        // Si se ingresa una cedula que no existe en la base de datos se muestra un mensaje de error y se vuelve a llamar a la funcion.
        // Si se ingresa una cedula que si existe en la base de datos, entonces se elimina la cuenta, el historial de transacciones y se muestra un mensaje de exito.
        // Si hay un error al eliminar la cuenta, se muestra un mensaje de error y se vuelve a llamar a la funcion.


        function eliminarCuenta() {
            let nombre = null;
            let apellido = null;
            let totalEnviadas = 0;
            let totalRecibidas = 0;
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese la Cedula por favor ---\n"));
            rl.question("Ingrese la cédula de la cuenta que desea eliminar: ", (input) => {
                const cedula = input.trim();
        
                if (!/^\d{7,11}-\d$/.test(cedula)) {
                    console.clear();
                    console.log(chalk.red("\n--- La cédula debe tener el formato correcto (ej: 12345678-9). ---\n"));
                    setTimeout(eliminarCuenta, 1500);
                    return;
                }

                db.get('SELECT Nombre, Apellido FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
                    if (err) {
                        console.clear();
                        console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
                        setTimeout(menuAdministrador, 1500);
                        return;
                    }
                
                    if (!row) {
                        console.clear();
                        console.log(chalk.red("\n--- La cuenta no existe ---\n"));
                        setTimeout(eliminarCuenta, 1500);
                        return;
                    }
                
                    nombre = row.Nombre;
                    apellido = row.Apellido;

                    if (nombre === null || apellido === null){
                        console.clear();
                        console.log(chalk.red("\n--- No se ha podido averiguar el nombre o apellido del usuario ---\n"));
                        setTimeout(eliminarCuenta, 2000);
                    } else {
                        db.get('SELECT * FROM Cuenta WHERE Cedula = ?', [cedula], (err, rows) => {
                            if (err) {
                                console.clear();
                                console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
                                setTimeout(menuAdministrador, 1500);
                                return;
                            }
                
                            if (!rows) {
                                console.clear();
                                console.log(chalk.red("\n--- La cuenta no existe ---\n"));
                                setTimeout(eliminarCuenta, 1500);
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
        
                                    console.clear();
                                    console.log(chalk.cyan.bgBlack("\n--- ¿Esta seguro que desea eliminar la cuenta? ---\n"));
                                    console.log(chalk.cyan.bgBlack("\n ---Cedula: " + cedula + " ---"));
                                    console.log(chalk.cyan.bgBlack("\n ---Nombre: " + nombre + " ---"));
                                    console.log(chalk.cyan.bgBlack("\n ---Apellido: " + apellido + " ---"));
                                    console.log(chalk.cyan.bgBlack("\n ---Operaciones realizadas: " + totalEnviadas + " ---"));
                                    console.log(chalk.cyan.bgBlack("\n ---Transacciones recibidas: " + totalRecibidas + " ---\n"));
                                    rl.question("Ingrese 1 para confirmar o 2 para cancelar: ", (input) => {
                                        const opcion = parseInt(input);
                    
                                        switch (opcion) {
                                            case 1:
                                                console.clear();
                                                console.log(chalk.green("\n--- Eliminando Cuenta... ---\n"));
                                                setTimeout(() => {
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
                                                                setTimeout(menuAdministrador, 1500);
                                                            } else {
                                                                console.clear();
                                                                console.log(chalk.green("\n--- Cuenta y transacciones eliminadas con éxito ---\n"));
                                                                setTimeout(menuAdministrador, 1500);
                                                            }
                                                            setTimeout(menuAdministrador, 1500);
                                                        });
                                                    });
                                                }, 1500);
                                                break;
                                            case 2:
                                                console.clear();
                                                console.log(chalk.red("\n--- Operacion cancelada ---\n"));
                                                setTimeout(menuAdministrador, 1500);
                                                break
                                            default:
                                                console.clear();
                                                console.log(chalk.red("\n--- Opcion no valida ---\n"));
                                                setTimeout(eliminarCuenta, 1500);
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            });
        }

        // La funcion verCuentas muestra las cuentas existentes en la base de datos.
        // Las cuentas se muestran en una tabla con los campos Cedula, Nombre y Saldo.
        // Tambien se muestran botones para regresar al menu de base de datos, al menu principal del administrador o cerrar sesion.
        // Si se selecciona la opcion 1, se llama a la funcion verBaseDeDatos.
        // Si se selecciona la opcion 2, se llama a la funcion menuAdministrador.
        // Si se selecciona la opcion 3, se llama a la funcion reinicio.
        // Si se selecciona una opcion no valida, se muestra un mensaje de error y se llama a la funcion verCuentas.
        
        function verCuentas() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
            console.log(chalk.cyan.bgBlack("\n--- Estas son las cuentas existentes ---\n"));
            db.all('SELECT * FROM Cuenta', (err, rows) => {
                if (err) {
                    console.clear();
                    console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
                    setTimeout(menuAdministrador, 1500);
                    return;
                }
                if (!rows.length) {
                    console.clear();
                    console.log(chalk.red("\n--- No hay cuentas en la base de datos ---\n"));
                    console.log(chalk.cyan.bgBlack("\n--- Considere agregar alguna cuenta desde el menu administrador ---\n"));
                    setTimeout(menuAdministrador, 3000);
                    return;
                }
                console.table(rows);
                console.log(chalk.cyan.bgBlack("\n--- digite 1 para regresar al menu de base de datos ---"));
                console.log(chalk.cyan.bgBlack("\n--- digite 2 para regresar al menu principal del administrador ---"));
                console.log(chalk.cyan.bgBlack("\n--- digite 3 para cerrar sesion ---"));
                rl.question("\nDigite la opcion: ", (input) => {
                    const opcion = parseInt(input);
                    switch (opcion) {
                        case 1:
                            verBaseDeDatos();
                            break;
                        case 2:
                            menuAdministrador();
                            break;
                        case 3:
                            reinicio();
                            break;
                        default:
                            console.clear();
                            console.log(chalk.red("\n--- Opcion no valida ---\n"));
                            setTimeout(verCuentas, 1500);
                            break;
                    }
                });
            })

        }

        // La funcion verHistorial() se encarga de mostrar el historial de transacciones realizadas en la base de datos.
        // Desde este menu se pueden realizar acciones como regresar al menu de base de datos, regresar al menu principal del administrador o cerrar sesion.
        // Si se ingresa 1 se llama a la funcion verBaseDeDatos().
        // Si se ingresa 2 se llama a la funcion menuAdministrador().
        // Si se ingresa 3 se llama a la funcion reinicio().
        // Si se ingresa cualquier otra opcion se muestra un mensaje de error y se vuelve a llamar a la funcion verHistorial().

        function verHistorial() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
            console.log(chalk.cyan.bgBlack("\n--- Este es el historial de procesos realizados ---\n"));
            db.all('SELECT * FROM Transacciones', (err, rows) => {
                if (err) {
                    console.clear();
                    console.log(chalk.red("\n--- Error al consultar la base de datos ---\n"));
                    setTimeout(menuAdministrador, 1500);
                    return;
                }
                if (!rows.length) {
                    console.clear();
                    console.log(chalk.red("\n--- No hay operaciones realizadas en la base de datos ---\n"));
                    console.log(chalk.cyan.bgBlack("\n--- Considere hacer algun retiro, ingreso o transaccion desde alguna cuenta (no administrador) ---\n"));
                    setTimeout(menuAdministrador, 3000);
                    return;
                }
                console.table(rows);
                console.log(chalk.cyan.bgBlack("\n--- digite 1 para regresar al menu de base de datos ---"));
                console.log(chalk.cyan.bgBlack("\n--- digite 2 para regresar al menu principal del administrador ---"));
                console.log(chalk.cyan.bgBlack("\n--- digite 3 para cerrar sesion ---"));
                rl.question("\nDigite la opcion: ", (input) => {
                    const opcion = parseInt(input);
                    switch (opcion) {
                        case 1:
                            verBaseDeDatos();
                            break;
                        case 2:
                            menuAdministrador();
                            break;
                        case 3:
                            reinicio();
                            break;
                        default:    
                            console.clear();
                            console.log(chalk.red("\n--- Opcion no valida ---\n"));
                            setTimeout(verHistorial, 1500);
                            break;
                    }
                });
            });
        }

        // La funcion verBaseDeDatos() se encarga de mostrar el menu de base de datos.
        // Desde este menu se pueden realizar acciones como ver las cuentas existentes, ver el historial de procesos, regresar al menu principal del administrador o cerrar sesion.
        // Si se ingresa 1 se llama a la funcion verCuentas().
        // Si se ingresa 2 se llama a la funcion verHistorial().
        // Si se ingresa 3 se llama a la funcion menuAdministrador().
        // Si se ingresa 4 se llama a la funcion reinicio().
        // Si se ingresa cualquier otra opcion se muestra un mensaje de error y se vuelve a llamar a la funcion verBaseDeDatos().

        function verBaseDeDatos() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
            console.log(chalk.cyan.bgBlack("\n--- Digite 1 para ver las cuentas existentes ---"));
            console.log(chalk.cyan.bgBlack("\n--- Digite 2 para ver el historial de procesos ---"));
            console.log(chalk.cyan.bgBlack("\n--- Digite 3 para regresar al menu principal del administrador ---"));
            console.log(chalk.cyan.bgBlack("\n--- Digite 4 para cerrar sesion ---\n"));
            rl.question("\nDigite la opcion: ", (input) => {
                const opcion = parseInt(input);
                switch (opcion) {
                    case 1:
                        verCuentas();
                        break;
                    case 2:
                        verHistorial();
                        break;
                    case 3:
                        menuAdministrador();
                        break;
                    case 4:
                        reinicio();
                        break;
                    default:
                        console.clear();
                        console.log(chalk.red("\n--- Opcion no valida ---\n"));
                        setTimeout(verBaseDeDatos, 1500);
                        break;
                }
            })
        }
        
        // La funcion menuAdministrador() se encarga de mostrar el menu principal del administrador.
        // Desde este menu se pueden realizar acciones como ver la base de datos, crear una cuenta, editar el pin de una cuenta, eliminar una cuenta y cerrar sesion.
        // Si se ingresa 1 se llama a la funcion verBaseDeDatos().
        // Si se ingresa 2 se llama a la funcion crearCuenta().
        // Si se ingresa 3 se llama a la funcion editarPinCuenta().
        // Si se ingresa 4 se llama a la funcion eliminarCuenta().
        // Si se ingresa 5 se llama a la funcion reinicio().
        // Si se ingresa cualquier otra opcion se muestra un mensaje de error y se vuelve a llamar a la funcion menuAdministrador().

        function menuAdministrador() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Bienvenido Administrador ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 si quiere ver la base de datos ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 si quiere crear una cuenta ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 si quiere editar el pin de una cuenta ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 si quiere eliminar una cuenta ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 5 si quiere cerrar sesion ---\n"));
            rl.question("\nDigite la opcion: ", (input) => {
                const opcion = parseInt(input);
                switch (opcion) {
                    case 1:
                        verBaseDeDatos();
                        break;
                    case 2:
                        crearCuenta();
                        break;
                    case 3:
                        editarPinCuenta();
                        break;
                    case 4:
                        eliminarCuenta();
                        break;
                    case 5:
                        reinicio();
                        break;
                    default:
                        console.clear();
                        console.log(chalk.yellow.bgBlack("\n--- La opcion ingresada no es valida ---\n"));
                        setTimeout(menuAdministrador, 1500);
                        break;
                }
            });
        }
    
        // La funcion pedirPin() se encarga de solicitar al usuario su cedula y pin.
        // Luego se verifica si la cedula y el pin son correctos (Tanto en formato como en base de datos).
        // Si son correctos, se llama a la funcion cajero().
        // Si el formato de alguno de los dos no es correcto, se muestra un mensaje de error y se vuelve a llamar a la funcion.
        // Si el formato es correcto pero no se encuentra en la base de datos, se muestra un mensaje de error y se le informa al usuario que le quedan dos intentos restantes.
        // Al llegar a 3 intentos fallidos, se bloquea el cajero.
        // Si todo fue bien, se llama a la funcion cajero().

        function pedirPin() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Bienvenido al cajero ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese su Cedula por favor ---\n"));
            rl.question("Ingrese su número de Cédula: ", (input) => {
                const cedula = input.trim();
                
                if (cedula === "Administrador") {
                    console.clear();
                    console.log(chalk.cyan.bgBlack("\n--- Bienvenido al cajero ---"));
                    console.log(chalk.cyan.bgBlack("\n--- Ingrese su Pin por favor ---\n"));
                    rl.question("Ingrese su Pin: ", (input) => {
                        const pin = input.trim();
                        if (pin === "AdminPassword") {
                            menuAdministrador();
                        } else {
                            console.clear();
                            console.log(chalk.red("\n--- Pin incorrecto ---\n"));
                            console.log(chalk.yellow("\n--- Intentos restantes: " + (2 - errores) + " ---\n"));
                            errores++;
                            if (errores >= 3) {
                                console.clear();
                                console.log(chalk.red("\n--- Has llegado al limite de intentos. ---\n"));
                                console.log(chalk.red("\n--- Bloqueando. ---\n"));
                                setTimeout(() => {
                                    console.clear();
                                    rl.close();
                                }, 3000);                                        
                            } else {
                                setTimeout(pedirPin, 2000);
                            }
                        }
                    });
                    return;
                }
                // Se verifica si la cedula ingresada tiene el formato correcto.
                // Si no lo tiene, se muestra un mensaje de error y se vuelve a llamar a la funcion.
                if (!/^\d{7,11}-\d$/.test(cedula)) {
                    console.clear();
                    console.log(chalk.red("\n--- La cédula debe tener el formato correcto (ej: 12345678-9). ---\n"));
                    setTimeout(pedirPin, 1500);
                    return;
                }
        
                // La funcion flujoVerificacion() se encarga de verificar si la cedula ingresada existe en la base de datos.
                // Si no hay ningun error entonces retorna su valor hacia la funcion verificarCedula().
                async function flujoVerificacion() {
                    function getCedulaAsync(cedula) {
                        return new Promise((resolve, reject) => {
                            db.get('SELECT Cedula FROM Cuenta WHERE Cedula = ?', [cedula], (err, row) => {
                                if (err) return reject(err);
                                resolve(row);
                            });
                        });
                    }
        
                    // La funcion verificarCedula() se encarga de verificar si la cedula ingresada existe en la base de datos.
                    // Si la cedula existe, se guarda su valor en la variable cedulaGuardada.
                    // Si la cedula no existe, se muestra un mensaje de error y se le informa al usuario sus intentos restantes.
                    // En base a la existencia de la cedula se le asigna true o false a la variable verifCed.
                    async function verificarCedula(cedula) {
                        try {
                            const row = await getCedulaAsync(cedula);
        
                            if (!row) {
                                console.clear();
                                console.log(row);
                                console.error("\nError 404");
                                return false;
                            }
                            
                            cedulaGuardada = row.Cedula;
                            return cedula === row.Cedula;
                        } catch (err) {
                            console.clear();
                            console.error("\nError 500");
                            return false;
                        }
                    }
                    
                    // Se llama a la funcion verificarCedula() y se guarda su resultado en la variable verifCed.
                    verifCed = await verificarCedula(cedula);
        
                    // Si verifCed es true, se pide el pin.
                    if (verifCed === true) {
                        console.clear();
                        console.log(chalk.cyan.bgBlack("\n--- Bienvenido al cajero ---"));
                        console.log(chalk.cyan.bgBlack("\n--- Ingrese su PIN por favor ---\n"));
                        rl.question("Ingrese su PIN: ", (input) => {
                            const pin = input.trim();
            
                            if (!/^\d{4}$/.test(pin)) {
                                console.clear();
                                console.log(chalk.yellow("\n--- El PIN debe tener 4 dígitos ---"));
                                verifPin = false;
                                verifCed = false;
                                cedulaGuardada = false;
                                codigoPin = false;
                                setTimeout(pedirPin, 1500);
                                return;
                            }
            
                            db.get('SELECT PIN FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                                if (err) {
                                    console.error('Error al obtener el PIN:', err.message);
                                    verifPin = false;
                                    verifCed = false;
                                    cedulaGuardada = false;
                                    codigoPin = false;
                                    setTimeout(pedirPin, 1000);
                                    return;
                                }
            
                                const pinDB = row.PIN;
                                const verifHashedPin = bcrypt.compareSync(pin, pinDB);
            
                                if (!verifHashedPin) {
                                    console.clear();
                                    console.log(chalk.red("\n--- El PIN ingresado es incorrecto. ---\n"));
                                    verifPin = false;
                                    verifCed = false;
                                    cedulaGuardada = false;
                                    codigoPin = false;
                                    errores++;
                                    console.log(chalk.yellow("\n--- Intentos restantes: " + (2 - errores) + " ---\n"));
                                    if (errores >= 3) {
                                        console.clear();
                                        console.log(chalk.red("\n--- Has llegado al limite de intentos. ---\n"));
                                        console.log(chalk.red("\n--- Bloqueando. ---\n"));
                                        setTimeout(() => {
                                            console.clear();
                                            rl.close();
                                        }, 3000);                                        
                                    } else {
                                        setTimeout(pedirPin, 2000);
                                    }
                                } else {
                                    console.clear();
                                    codigoPin = pin;
                                    verifCed = true;
                                    verifPin = true;
                                    errores = 0;
                                    console.log(chalk.green("\n--- Pin correcto ---\n"));
                                    setTimeout(cajero, 1000);
                                }                                
                            });
                        });
                        // Si verifCed es false, se muestra un mensaje de error y se le informa al usuario sus intentos restantes.
                    } else {
                        console.clear();
                        console.log(chalk.red("\n--- La cedula ingresada no existe. ---\n"));
                        cedulaGuardada = 0;
                        errores++;
                        console.log(chalk.yellow("\n--- Intentos restantes: " + (3 - errores) + " ---\n"));
                        // Si los intentos fallidos son menores a 3, se vuelve a llamar a la funcion pedirPin() despues de 1.5 segundos.
                        if (errores < 3) {
                            setTimeout(pedirPin, 1500);
                        // Sino, se muestra un mensaje de error y se le informa al usuario que se bloqueo el cajero.
                        } else {
                            console.error("\n--- Demasiados intentos fallidos, bloqueando. ---\n");
                            setTimeout(() => {
                                console.clear();
                                rl.close();
                            }, 2000);
                        }
                    }
                }
        
                flujoVerificacion(); // Llamamos al flujo principal
            });
        }

        // La funcion consulta(tipo) se encarga de mostrar un menu segun la informacion que tenga la variable "tipo".
        // Si "tipo" es "transaccion", se muestra un menu con opciones para realizar otra transaccion [llamando asi a la funcion cajeroTransaccion()], ir al menu principal [llamando a cajero()] o cerrar sesion [llamando a reinicio()].
        // Si "tipo" es "retiro", se muestra un menu con opciones para realizar otro retiro [llamando asi a la funcion cajeroRetiro()], ir al menu principal o cerrar sesion.
        // Si "tipo" es "ingreso", se muestra un menu con opciones para realizar otro ingreso [llamando asi a la funcion cajeroIngreso()], ir al menu principal o cerrar sesion.
        // SI "tipo" no es ninguna de las tres opciones anteriores, se muestra un mensaje de error y se carga el menu principal del cajero [llamando asi a la funcion cajero()].

        function consulta(tipo) {
            console.clear();
            // Si "tipo" es "transaccion", se muestra un menu con opciones para realizar otra transaccion, ir al menu principal o cerrar sesion.
            if (tipo === 'transaccion') {
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 para realizar otra transacción ---"));
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 para ir al menu principal ---"));
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 para salir del cajero ---\n"));
                rl.question("\nIndique la opcion: ", (input) => {
                    let opcion = parseInt(input);

                    // Segun la opcion elegida, se ejecuta una de las siguientes funciones:
                    switch (opcion) {
                        case 1:
                            console.clear();
                            cajeroTransaccion();
                            break;
                        case 2:
                            console.clear();
                            cajero();
                            break;
                        case 3:
                            reinicio();
                            break;
                        default:
                            console.clear();
                            console.log(chalk.yellow("\n--- Opcion no valida ---\n"));
                            setTimeout(() => {
                                console.clear();
                                consulta(tipo);
                            }, 2000);
                    }
                });
            // Si "tipo" es "retiro", se muestra un menu con opciones para realizar otro retiro, ir al menu principal o cerrar sesion.
            } else if (tipo === 'retiro') {
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 para realizar otro retiro ---"));
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 para ir al menu principal ---"));
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 para salir del cajero ---\n"));
                rl.question("\nIndique la opcion: ", (input) => {
                    let opcion = parseInt(input);

                    // Segun la opcion elegida, se ejecuta una de las siguientes funciones:
                    switch (opcion) {
                        case 1:
                            console.clear();
                            cajeroRetiro();
                            break;
                        case 2:
                            console.clear();
                            cajero();
                            break;
                        case 3:
                            reinicio();
                            break;
                        default:
                            console.clear();
                            console.log(chalk.yellow("\n--- Opcion no valida ---\n"));
                            setTimeout(() => {
                                console.clear();
                                consulta(tipo);
                            }, 2000);
                    }
                });
            // Si "tipo" es "ingreso", se muestra un menu con opciones para realizar otro ingreso, ir al menu principal o cerrar sesion.
            } else if (tipo === 'ingreso') {
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 para realizar otro ingreso ---"));
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 para ir al menu principal ---"));
                console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 para salir del cajero ---"));
                rl.question("\nIndique la opcion: ", (input) => {
                    let opcion = parseInt(input);

                    // Segun la opcion elegida, se ejecuta una de las siguientes funciones:
                    switch (opcion) {
                        case 1:
                            console.clear();
                            cajeroIngreso();
                            break;
                        case 2:
                            console.clear();
                            cajero();
                            break;
                        case 3:
                            reinicio();
                            break;
                        default:
                            console.clear();
                            console.log(chalk.yellow("\n--- Opcion no valida ---\n"));
                            setTimeout(() => {
                                console.clear();
                                consulta(tipo);
                            }, 2000);
                    }
                })
            // Si "tipo" no es ninguna de las tres opciones anteriores, se muestra un mensaje de error y se carga el menu principal del cajero.
            } else {
                console.clear();
                console.log(chalk.red("\n--- No se ha definido el tipo de proceso a realizar ---\n"));
                setTimeout(() => {
                    console.clear();
                    cajero();
                }, 2000);
            }
        }

        // La funcion registrarTransaccion() se encarga de registrar una transaccion en la base de datos.
        // Recibe como parametros la cedula del usuario, el tipo de transaccion, el monto y el destino de la transaccion.
        // Si el tipo de transaccion es diferente de "transaccion", se establece el destino como "Ninguno".
        // Luego se registra la transaccion en la base de datos y se muestra un mensaje de confirmacion.
        // Luego se llama a la funcion consulta(tipo) con la informacion de la variable "tipo" despues de 2 segundos.

        function registrarTransaccion(cedulaGuardada, tipo, monto, destino) {
            const fecha = new Date().toISOString();
            if (tipo !== 'transaccion') {
                destino = "Ninguno";
            }
            db.run('INSERT INTO Transacciones (Cedula, Tipo, Monto, Destino, Fecha) VALUES (?, ?, ?, ?, ?)', [cedulaGuardada, tipo, monto, destino, fecha], function (err) {
                if (err) {
                    console.error('Error al registrar la transacción:', err.message);
                } else {
                    console.log(chalk.green("\n--- Transacción registrada con éxito ---\n"));
                    setTimeout(() => {
                        console.clear();
                        consulta(tipo);
                    }, 2000);
                }
            });
        }
        
        // La funcion transaccion(cantidad, destino) se encarga de realizar una transaccion entre dos cuentas bancarias.
        // El usuario ingresa la "cantidad" de dinero que desea transferir y el "destino" de la transaccion.
        // Si la cantidad ingresada es mayor al saldo de la cuenta bancaria, se muestra un mensaje de error.
        // Si la cantidad ingresada es menor o igual al saldo de la cuenta bancaria, se realiza la transaccion y se muestra un mensaje de confirmacion.
        // Luego se llama a la funcion registrarTransaccion() para registrar la transaccion realizada.
        // En caso de error, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroTransaccion().
        // En caso de exito, se muestra un mensaje de confirmacion y se vuelve a llamar a la funcion cajero().

        function transaccion(cantidad, destino) {
            console.clear();
            if (cedulaGuardada === destino) {
                console.error('\n--- No puedes realizar una transacción a tu propia cuenta. ---\n');
                setTimeout(cajeroTransaccion, 2000);
                return;
            } else {
                db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                    if (err || !row) {
                        console.clear();
                        console.error('Error al obtener el saldo de la base de datos.');
                        setTimeout(cajeroTransaccion, 2000);
                        return;
                    }
        
                    const saldoPropActual = row.Saldo;
                    const saldoPropActualizado = saldoPropActual - cantidad;
    
                    if (cantidad > saldoPropActual) {
                        console.clear();
                        console.log(chalk.red("\n--- El monto ingresado es mayor al monto de la cuenta bancaria ---"));
                        setTimeout(cajeroTransaccion, 2000);
                        return;
                    } else {
                        db.get('SELECT Cedula FROM Cuenta WHERE Cedula = ?', [destino], (err, row) => {
                            if (err || !row) {
                                console.clear();
                                console.error('Error al obtener el destino de la base de datos.');
                                setTimeout(cajeroTransaccion, 2000);
                                return;
                            } else {
                                db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [destino], (err, row) => {
                                    if (err || !row) {
                                        console.clear();
                                        console.error('Error al obtener el saldo de la base de datos.');
                                        setTimeout(cajeroTransaccion, 2000);
                                        return;
                                    } else {
                                        const saldoDestino = row.Saldo;
                                        const saldoDestinoActualizado = saldoDestino + cantidad;
                                        db.run('UPDATE Cuenta SET Saldo = ? WHERE Cedula = ?', [saldoDestinoActualizado, destino], (err) => {
                                            if (err) {
                                                console.error('Error al actualizar el saldo de la base de datos:', err.message);
                                            } else {
                                                db.run('UPDATE Cuenta SET Saldo = ? WHERE Cedula = ?', [saldoPropActualizado, cedulaGuardada], (err) => {
                                                    if (err) {
                                                        console.error('Error al actualizar el saldo de la base de datos:', err.message);
                                                    } else {
                                                        console.log(chalk.green("\n--- Transferencia realizada con éxito ---"));
                                                        console.log(chalk.green("\n--- Su saldo actualizado: " + saldoPropActualizado + "$ ---"));
                                                        console.log(chalk.green("\n--- Gracias por utilizar nuestros servicios ---\n"));
                                                        registrarTransaccion(cedulaGuardada, 'transaccion', cantidad, destino);
                                                    }
                                                })
                                            }
                                        })
                                    }
                                });
                            }
                        })
                    }
                });
            }
        }

        // La funcion ingreso(cantidad) se encarga de realizar un ingreso de dinero a la cuenta bancaria en base al dato "cantidad".
        // Si la cantidad es menor a 500, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroIngreso().
        // Si la cantidad es mayor o igual a 500, se realiza el ingreso y se muestra un mensaje de confirmación.
        // Luego se llama a la funcion registrarTransaccion() para registrar la transaccion realizada.
        // En caso de error, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroIngreso().
        // En caso de exito, se muestra un mensaje de confirmación y se vuelve a llamar a la funcion cajero().


        function ingreso(cantidad) {
            console.clear();
            if (cantidad < 500) {
                console.error('\n--- El monto ingresado debe ser igual o mayor a 500. ---\n');
                setTimeout(cajeroIngreso, 2000);
                return;
            } else {
                db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                    if (err || !row) {
                        console.clear();
                        console.error('Error al obtener el saldo de la base de datos.');
                        setTimeout(cajeroIngreso, 2000);
                        return;
                    }
        
                    const saldoActual = row.Saldo;
                    const saldoActualizado = saldoActual + cantidad;
        
                    db.run('UPDATE Cuenta SET Saldo = ? WHERE Cedula = ?', [saldoActualizado, cedulaGuardada], (err) => {
                        if (err) {
                            console.error('Error al actualizar el saldo de la base de datos:', err.message);
                            setTimeout(cajeroIngreso, 2000);
                        } else {
                            registrarTransaccion(cedulaGuardada, 'ingreso', cantidad, 'Ninguno');
                            console.log(chalk.green("\n--- Ingreso realizado con éxito ---"));
                            console.log(chalk.green("\n--- Su saldo actualizado: " + saldoActualizado + "$ ---"));
                            console.log(chalk.green("\n--- Gracias por utilizar nuestros servicios ---\n"));
                        }
                    });
                });
            }
        }
    

        // La funcion retiro(cantidad) se encarga de realizar un retiro de dinero de la cuenta bancaria en base al dato "cantidad".
        // Si la cantidad es mayor al saldo disponible, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroRetiro().
        // Si la cantidad es menor o igual al saldo disponible, se realiza el retiro y se muestra un mensaje de confirmación.
        // Luego se llama a la funcion registrarTransaccion() para registrar la transaccion realizada.
        // En caso de error, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroRetiro().
        // En caso de exito, se muestra un mensaje de confirmación y se vuelve a llamar a la funcion cajero().

        function retiro(cantidad) {
            console.clear();
            db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                if (err || !row) {
                    console.clear();
                    console.error('Error al obtener el saldo de la base de datos.');
                    setTimeout(cajeroRetiro, 2000);
                    return;
                }
    
                const saldoActual = row.Saldo;
                const saldoActualizado = saldoActual - cantidad;
    
                if (cantidad > saldoActual) {
                    console.clear();
                    console.log(chalk.red("\n--- El monto ingresado es mayor al monto de la cuenta bancaria ---"));
                    setTimeout(cajeroRetiro, 2000);
                    return;
                }
    
                db.run('UPDATE Cuenta SET Saldo = ? WHERE Cedula = ?', [saldoActualizado, cedulaGuardada], (err) => {
                    if (err) {
                        console.error('Error al actualizar el saldo de la base de datos:', err.message);
                    } else {
                        console.log(chalk.green("\n--- Retiro realizado con éxito ---"));
                        console.log(chalk.green("\n--- Su saldo restante: " + saldoActualizado + "$ ---"));
                        console.log(chalk.green("\n--- Gracias por utilizar nuestros servicios ---"));
                        registrarTransaccion(cedulaGuardada, 'retiro', cantidad, 'Ninguno');
                    }
                });
            });
        }

        // La funcion cajeroIngreso() muestra el menu de ingreso y permite al usuario seleccionar una opcion para realizar una accion.
        // Las opciones disponibles son:
        // - 1: Ingresar 2000$
        // - 2: Ingresar 4000$
        // - 3: Ingresar 6000$
        // - 4: Ingresar un monto especifico
        // - 5: Ver el saldo disponible
        // - 6: Salir
        // Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroIngreso().
        // Si el usuario ingresa una opcion valida, se llama a la funcion ingreso() con el monto correspondiente.

        function cajeroIngreso() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 si quiere ingresar 2000$ ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 si quiere ingresar 4000$ ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 si quiere ingresar 6000$ ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 si quiere ingresar un monto especifico ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 5 si quiere ver el saldo disponible ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 6 si quiere volver atras ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 7 si quiere cerrar sesion ---\n"));

            rl.question("\nDigite la opcion: ", (input) => {
                let opcion = parseInt(input);

                if (isNaN(opcion)) {
                    console.clear();
                    console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
                    setTimeout(cajeroIngreso, 1500);
                    return;
                }

                console.clear();

                switch (opcion) {
                    case 1:
                        ingreso(2000);
                        break;
                    case 2:
                        ingreso(4000);  
                        break;  
                    case 3:
                        ingreso(6000);
                        break;
                    case 4:
                        rl.question("Indique el monto a ingresar: ", (input) => {
                            const monto = parseInt(input);
                            if (monto <= 500 || monto > 50000 || isNaN(monto)) {
                                console.clear();
                                console.log(chalk.red("\n--- Monto no válido. ---"));
                                setTimeout(cajeroIngreso, 2000);
                            } else {
                                ingreso(monto);
                            }
                        })
                        break;
                    case 5:
                        db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                            if (err || !row) {
                                console.clear();
                                console.error('Error al obtener el saldo de la base de datos.');
                                setTimeout(cajero, 2000);
                                return;
                            }
                            console.clear();
                            console.log(chalk.green("\n--- Su saldo actual es de: " + row.Saldo + "$ ---"));
                            setTimeout(cajeroIngreso, 2000);
                        })
                        break;
                    case 6:
                        console.clear();
                        cajero();
                        break;
                    case 7:
                        console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajero ---"));
                        setTimeout(() => {
                            console.clear();
                            reinicio();
                        }, 1500);
                        break;
                    default:
                        console.clear();
                        console.log(chalk.red("\n--- Opcion no valida. ---"));
                        setTimeout(cajeroIngreso, 2000);
                    }
            })
        }

        // La funcion cajeroRetiro() permite al usuario retirar dinero de su cuenta bancaria
        // y se llama desde la funcion cajero().
        // La funcion cajeroRetiro() despliega un menu interactivo similar al cajero(), pero con las siguientes opciones:
        // - 1: Retirar 2000$
        // - 2: Retirar 4000$
        // - 3: Retirar 6000$
        // - 4: Retirar un monto especifico
        // - 5: Ver el saldo disponible
        // - 6: Salir
        // Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroRetiro().
        // Si el usuario ingresa una opcion valida, se llama a la funcion retirar() con el monto correspondiente.

        function cajeroRetiro() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 1 si quiere retirar 2000$ --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 2 si quiere retirar 4000$ --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 3 si quiere retirar 6000$ --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 4 si quiere retirar un monto especifico --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 5 si quiere ver el saldo disponible --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 6 si quiere volver atras --"));
            console.log(chalk.cyan.bgBlack("\n-- Ingrese 7 si quiere cerrar sesion --\n"));
    
            rl.question("\nDigite la opción: ", (input) => {
                let opcion = parseInt(input);
    
                if (isNaN(opcion)) {
                    console.clear();
                    console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
                    setTimeout(cajeroRetiro, 1500);
                    return;
                }
    
                console.clear();
    
                switch (opcion) {
                    case 1:
                        retiro(2000);
                        break;
                    case 2:
                        retiro(4000);
                        break;
                    case 3:
                        retiro(6000);
                        break;
                    case 4:
                        rl.question("Ingrese el monto a retirar: ", (input) => {
                            const monto = parseInt(input);
                            if (monto <= 0 || monto > 50000 || isNaN(monto)) {
                                console.clear();
                                console.log(chalk.red("\n--- Monto no válido. ---"));
                                setTimeout(cajero, 2000);
                            } else {
                                retiro(monto);
                            }
                        });
                        break;
                    case 5:
                        db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                            if (err || !row) {
                                console.clear();
                                console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                                setTimeout(cajeroRetiro, 2000);
                            } else {
                                console.log(chalk.green.bgBlack("\n--- El saldo disponible es de " + row.Saldo + "$ ---"));
                                console.log(chalk.green.bgBlack("\n--- Gracias por utilizar nuestros servicios ---"));
                                setTimeout(cajeroRetiro, 2000);
                            }
                        });
                        break;
                    case 6:
                        console.clear();
                        cajero();
                        break;
                    case 7:
                        console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajero ---"));
                        setTimeout(() => {
                            console.clear();
                            reinicio();
                        }, 1500);
                        break;
                    default:
                        console.log(chalk.red("\n--- Opción no válida ---"));
                        setTimeout(cajeroRetiro, 1500);
                        break;
                }
            });
        }

        // La funcion cajeroTransaccion() despliega un menu interactivo similar al cajero(), pero con las opciones de realizar una transaccion, ver el saldo disponible o salir.
        // Si el usuario ingresa una opcion no valida, se muestra un mensaje de error y se vuelve a llamar a la funcion.
        // Si el usuario ingresa una opcion valida, se ejecuta una de las siguientes funciones:
        // - Realiza una transaccion si el usuario ingresa 1
        // - Muestra el saldo disponible si el usuario ingresa 2
        // - llama a la funcion cajero() para ir al menu principal si el usuario ingresa 3
        // - sino ingresa ninguna de esas opciones, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroTransaccion para que el usuario ingrese una opcion valida.

        function cajeroTransaccion() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 para indicar el monto de la transacción y destinatario (cedula) ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 para ver el saldo disponible ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 para volver atras ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 para cerrar sesion ---\n"));
    
            rl.question("\nDigite la opcion: ", (input) => {
                let opcion = parseInt(input);
    
                if (isNaN(opcion)) {
                    console.clear();
                    console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
                    setTimeout(cajeroTransaccion, 1500);
                    return;
                }
    
                console.clear();
    
                switch (opcion) {
                    case 1:
                        rl.question("Indique el monto de la transacción: ", (input) => {
                            const monto = parseInt(input);
                            if (monto <= 0 || monto > 50000 || isNaN(monto)) {
                                console.clear();
                                console.log(chalk.red("\n--- Monto no válido. ---"));
                                setTimeout(cajeroTransaccion, 2000);
                            } else {
                                console.clear();
                                rl.question("Indique el destino de la transacción: ", (input) => {
                                    const destino = input;
                                    transaccion(monto, destino);
                                })
                            }
                        });
                        break;
                    case 2:
                        db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                            if (err || !row) {
                                console.clear();
                                console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                                setTimeout(cajeroTransaccion, 2000);
                            } else {
                                console.log(chalk.green.bgBlack("\n--- El saldo disponible es de " + row.Saldo + "$ ---\n"));
                                setTimeout(cajeroTransaccion, 2000);
                            }
                        });
                        break;
                    case 3:
                        console.clear();
                        cajero();
                        break;
                    case 4:
                        console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajero ---"));
                        setTimeout(() => {
                            console.clear();
                            reinicio();
                        }, 1500);
                        break;
                    default:
                        console.log(chalk.red("\n--- Opción no válida ---"));
                        setTimeout(cajeroTransaccion, 1500);
                        break;
                }
            })
        }



/**
 * la funcion cajero() Muestra el menu principal del cajero y permite al usuario seleccionar 
 * una opcion para realizar una accion.
 * 
 * Se le pregunta al usuario que ingrese una opcion mediante un prompt.
 * Si el usuario ingresa una opcion que no es un numero, se muestra un 
 * mensaje de error y se vuelve a llamar a esta funcion.
 * Si el usuario ingresa una opcion numero, se ejecuta una de las 
 * siguientes funciones:
 * - cajeroRetiro() si se ingresa la opcion 1.
 * - cajeroIngreso() si se ingresa la opcion 2.
 * - cajeroTransaccion() si se ingresa la opcion 3.
 * - Se muestra el saldo actual y se vuelve a llamar a esta funcion si se 
 *   ingresa la opcion 4.
 * - Se muestra un mensaje de despedida y se sale del cajero si se ingresa la 
 *   opcion 5.
 * - Se muestra un mensaje de error y se vuelve a llamar a esta funcion si se 
 *   ingresa una opcion numero distinta de las anteriores.
 */
        function cajero() {
            console.clear();
            console.log(chalk.cyan.bgBlack("\n--- Bienvenido al cajero ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 1 si quiere retirar dinero ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 si quiere ingresar dinero ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 si quiere realizar una transacción ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 4 si quiere revisar su saldo ---"));
            console.log(chalk.cyan.bgBlack("\n--- Ingrese 5 si quiere cerrar sesion ---"));

            rl.question("\nDigite la opcion: ", (input) => {
                let opcion = parseInt(input);
    
                if (isNaN(opcion)) {
                    console.clear();
                    console.log(chalk.yellow.bgBlack("\n--- El valor ingresado no es un número. ---"));
                    setTimeout(cajero, 1500);
                    return;
                }
    
                console.clear();
    
                switch (opcion) {
                    case 1:
                        cajeroRetiro();
                        break;
                    case 2:
                        cajeroIngreso();
                        break;
                    case 3:
                        cajeroTransaccion();
                        break;
                    case 4:
                        console.clear();
                        db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
                            if (err || !row) {
                                console.clear();
                                console.log(chalk.red("\n--- Error al obtener el saldo. ---"));
                                setTimeout(cajero, 2000);
                            } else {
                                console.log(chalk.green.bgBlack("\n--- El saldo disponible es de " + row.Saldo + "$ ---\n"));
                                setTimeout(cajero, 2000);
                            }
                        })
                        break;
                    case 5:
                        console.clear();
                        console.log(chalk.cyan.bgBlack("\n--- Gracias por usar el cajero ---\n"));    
                        reinicio();
                        break;
                    default:
                        console.clear();
                        console.log(chalk.red("\n--- Opcion no valida. ---\n"));
                        setTimeout(cajero, 1500);
                }
            });
        }
        

        // Funcion para reiniciar el cajero
        // arrancandolo desde 0

        function reinicio(dato, mensaje){
            console.clear();
            if (dato === 'error') {
                console.log(chalk.red.bgBlack(`\n --- ${mensaje} ---\n`));
                setTimeout(() => {
                    console.clear();
                    cedulaGuardada = false;
                    codigoPin = false;
                    verifCed = false;
                    verifPin = false;
                    errores = 0;
                    pedirPin();
                }, 3000);
                return;
            }
            console.log(chalk.green.bgBlack("\n--- Cerrando sesion ---\n"));
            setTimeout(() => {
                console.clear();
                cedulaGuardada = false;
                codigoPin = false;
                verifCed = false;
                verifPin = false;
                errores = 0;
                pedirPin();
            }, 3000);
        }
