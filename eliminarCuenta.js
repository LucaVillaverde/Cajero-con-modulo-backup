




/**
La funcion eliminarCuenta() se encarga de eliminar una cuenta de la base de datos.

Desde este menu se puede ingresar la cedula de la cuenta que se desea eliminar.

Si se ingresa una cedula que no existe en la base de datos se muestra un mensaje de error y se vuelve a llamar a la funcion.

Si se ingresa una cedula que si existe en la base de datos, entonces se elimina la cuenta, el historial de transacciones y se muestra un mensaje de exito.

Si hay un error al eliminar la cuenta, se muestra un mensaje de error y se vuelve a llamar a la funcion.
*/


export function eliminarCuenta() {
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

export default eliminarCuenta