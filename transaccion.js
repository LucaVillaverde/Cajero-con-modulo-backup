import chalk from "chalk";
import { registrarOperacion } from "./registrarOperacion.js";
import { cajeroTransaccion } from "./cajero.js";
import { db } from "./cajero.js";



/**
La funcion transaccion(cantidad, destino) se encarga de realizar una transaccion entre dos cuentas bancarias.

El usuario ingresa la "cantidad" de dinero que desea transferir y el "destino" de la transaccion.

Si la cantidad ingresada es mayor al saldo de la cuenta bancaria, se muestra un mensaje de error.

Si la cantidad ingresada es menor o igual al saldo de la cuenta bancaria, se realiza la transaccion y se muestra un mensaje de confirmacion.

Luego se llama a la funcion registrarTransaccion() para registrar la transaccion realizada.

En caso de error, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroTransaccion().

En caso de exito, se muestra un mensaje de confirmacion y se vuelve a llamar a la funcion cajero().
*/

export function transaccion(cantidad, destino, cedulaGuardada) {
  console.clear();
  if (cedulaGuardada === destino) {
    console.error(
      "\n--- No puedes realizar una transacción a tu propia cuenta. ---\n"
    );
    setTimeout(cajeroTransaccion, 2000);
    return;
  } else {
    db.get(
      "SELECT Saldo FROM Cuenta WHERE Cedula = ?",
      [cedulaGuardada],
      (err, row) => {
        if (err || !row) {
          console.clear();
          console.error("Error al obtener el saldo de la base de datos.");
          setTimeout(cajeroTransaccion, 2000);
          return;
        }

        const saldoPropActual = row.Saldo;
        const saldoPropActualizado = saldoPropActual - cantidad;

        if (cantidad > saldoPropActual) {
          console.clear();
          console.log(
            chalk.red(
              "\n--- El monto ingresado es mayor al monto de la cuenta bancaria ---"
            )
          );
          setTimeout(cajeroTransaccion, 2000);
          return;
        } else {
          db.get(
            "SELECT Cedula FROM Cuenta WHERE Cedula = ?",
            [destino],
            (err, row) => {
              if (err || !row) {
                console.clear();
                console.error(
                  "Error al obtener el destino de la base de datos."
                );
                setTimeout(cajeroTransaccion, 2000);
                return;
              } else {
                db.get(
                  "SELECT Saldo FROM Cuenta WHERE Cedula = ?",
                  [destino],
                  (err, row) => {
                    if (err || !row) {
                      console.clear();
                      console.error(
                        "Error al obtener el saldo de la base de datos."
                      );
                      setTimeout(cajeroTransaccion, 2000);
                      return;
                    } else {
                      const saldoDestino = row.Saldo;
                      const saldoDestinoActualizado = saldoDestino + cantidad;
                      db.run(
                        "UPDATE Cuenta SET Saldo = ? WHERE Cedula = ?",
                        [saldoDestinoActualizado, destino],
                        (err) => {
                          if (err) {
                            console.error(
                              "Error al actualizar el saldo de la base de datos:",
                              err.message
                            );
                          } else {
                            db.run(
                              "UPDATE Cuenta SET Saldo = ? WHERE Cedula = ?",
                              [saldoPropActualizado, cedulaGuardada],
                              (err) => {
                                if (err) {
                                  console.error(
                                    "Error al actualizar el saldo de la base de datos:",
                                    err.message
                                  );
                                } else {
                                  console.log(
                                    chalk.green(
                                      "\n--- Transferencia realizada con éxito ---"
                                    )
                                  );
                                  console.log(
                                    chalk.green(
                                      "\n--- Su saldo actualizado: " +
                                        saldoPropActualizado +
                                        "$ ---"
                                    )
                                  );
                                  console.log(
                                    chalk.green(
                                      "\n--- Gracias por utilizar nuestros servicios ---\n"
                                    )
                                  );
                                  registrarOperacion(
                                    cedulaGuardada,
                                    "transaccion",
                                    cantidad,
                                    destino
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  }
}


export default transaccion