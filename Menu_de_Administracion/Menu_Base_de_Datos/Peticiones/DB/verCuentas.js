import chalk from "chalk";
import { db, rl, reinicio } from "../../../../Cajero/Codigo_Central/cajeroMenu.js";
import { menuAdministrador } from "../../../menuAdministrador.js";
import { verBaseDeDatos } from "./verBaseDeDatos.js";


/**
La funcion verCuentas muestra las cuentas existentes en la base de datos.

Las cuentas se muestran en una tabla con los campos Cedula, Nombre y Saldo.

Tambien se muestran botones para regresar al menu de base de datos, al menu principal del administrador o cerrar sesion.

Si se selecciona la opcion 1, se llama a la funcion verBaseDeDatos.

Si se selecciona la opcion 2, se llama a la funcion menuAdministrador.

Si se selecciona la opcion 3, se llama a la funcion reinicio.

Si se selecciona una opcion no valida, se muestra un mensaje de error y se llama a la funcion verCuentas.
*/


export function verCuentas() {
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
    });
}

export default verCuentas