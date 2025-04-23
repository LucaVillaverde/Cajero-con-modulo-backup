import chalk from "chalk";
import { registrarOperacion } from "./registrarOperacion.js";
import { cajeroRetiro, db, cedulaGuardada } from "../Codigo_Central/cajero.js";


/** 
La funcion retiro(cantidad) se encarga de realizar un retiro de dinero de la cuenta bancaria en base al dato "cantidad".

Si la cantidad es mayor al saldo disponible, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroRetiro().

Si la cantidad es menor o igual al saldo disponible, se realiza el retiro y se muestra un mensaje de confirmación.

Luego se llama a la funcion registrarTransaccion() para registrar la transaccion realizada.

En caso de error, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroRetiro().

En caso de exito, se muestra un mensaje de confirmación y se vuelve a llamar a la funcion cajero().
*/



export function retiro(cantidad) {
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
                registrarOperacion(cedulaGuardada, 'retiro', cantidad, 'Ninguno');
            }
        });
    });
}

export default retiro