import chalk from "chalk";
import { registrarOperacion } from "./registrarOperacion.js";
import { db, cedulaGuardada } from "../Codigo_Central/cajeroMenu.js";
import { cajeroIngresoMenu } from "../Codigo_Central/subMenus/cajeroIngresoMenu.js";


/** 
La funcion ingreso(cantidad) se encarga de realizar un ingreso de dinero a la cuenta bancaria en base al dato "cantidad".

Si la cantidad es menor a 500, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroIngreso().

Si la cantidad es mayor o igual a 500, se realiza el ingreso y se muestra un mensaje de confirmación.

Luego se llama a la funcion registrarTransaccion() para registrar la transaccion realizada.

En caso de error, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroIngreso().

En caso de exito, se muestra un mensaje de confirmación y se vuelve a llamar a la funcion cajero().
*/





export function ingreso(cantidad) {
    console.clear();
    if (cantidad < 500) {
        console.error('\n--- El monto ingresado debe ser igual o mayor a 500. ---\n');
        setTimeout(cajeroIngresoMenu, 2000);
        return;
    } else {
        db.get('SELECT Saldo FROM Cuenta WHERE Cedula = ?', [cedulaGuardada], (err, row) => {
            if (err || !row) {
                console.clear();
                console.error('Error al obtener el saldo de la base de datos.');
                setTimeout(cajeroIngresoMenu, 2000);
                return;
            }

            const saldoActual = row.Saldo;
            const saldoActualizado = saldoActual + cantidad;

            db.run('UPDATE Cuenta SET Saldo = ? WHERE Cedula = ?', [saldoActualizado, cedulaGuardada], (err) => {
                if (err) {
                    console.error('Error al actualizar el saldo de la base de datos:', err.message);
                    setTimeout(cajeroIngresoMenu, 2000);
                } else {
                    registrarOperacion(cedulaGuardada, 'ingreso', cantidad, 'Ninguno');
                    console.log(chalk.green("\n--- Ingreso realizado con éxito ---"));
                    console.log(chalk.green("\n--- Su saldo actualizado: " + saldoActualizado + "$ ---"));
                    console.log(chalk.green("\n--- Gracias por utilizar nuestros servicios ---\n"));
                }
            });
        });
    }
}

export default ingreso