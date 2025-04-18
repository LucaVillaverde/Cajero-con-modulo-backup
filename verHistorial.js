import chalk from "chalk";
import { db, rl, reinicio } from "./cajero.js";
import { menuAdministrador } from "./menuAdministrador.js";
import { verBaseDeDatos } from "./verBaseDeDatos.js";


/**
La funcion verHistorial() se encarga de mostrar el historial de transacciones realizadas en la base de datos.

Desde este menu se pueden realizar acciones como regresar al menu de base de datos, regresar al menu principal del administrador o cerrar sesion.

Si se ingresa 1 se llama a la funcion verBaseDeDatos().

Si se ingresa 2 se llama a la funcion menuAdministrador().

Si se ingresa 3 se llama a la funcion reinicio().

Si se ingresa cualquier otra opcion se muestra un mensaje de error y se vuelve a llamar a la funcion verHistorial().
*/



export function verHistorial() {
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

export default verHistorial