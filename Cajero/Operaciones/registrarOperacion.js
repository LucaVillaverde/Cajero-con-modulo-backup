import chalk from "chalk";
import { db } from "../Codigo_Central/cajeroMenu.js";
import { consulta } from "../Consultas_no_admins/consulta.js";


/**
La funcion registrarOperacion() se encarga de registrar una operacion en la base de datos.

Recibe como parametros la cedula del usuario, el tipo de operacion, el monto y el destino de la operacion.

Si el tipo de operacion es diferente de "transaccion", se establece el destino como "Ninguno".

Luego se registra la operacion en la base de datos y se muestra un mensaje de confirmacion.

Luego se llama a la funcion consulta(tipo) con la informacion de la variable "tipo" despues de 2 segundos.
*/

export function registrarOperacion(cedulaGuardada, tipo, monto, destino) {
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
                consulta(tipo, false, cedulaGuardada);
            }, 2000);
        }
    });
}

export default registrarOperacion