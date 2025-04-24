import chalk from "chalk";
import { registrarOperacion } from "./registrarOperacion.js";
import { db, cedulaGuardada } from "../Codigo_Central/cajeroMenu.js";
import { cajeroTransaccionMenu } from "../Codigo_Central/subMenus/cajeroTransaccionMenu.js";

/**
 * La funcion transaccion(cantidad, destino) se encarga de realizar una transaccion entre dos cuentas bancarias.
 * 
 * El usuario ingresa la "cantidad" de dinero que desea transferir y el "destino" de la transaccion.
 * Si la cantidad ingresada es mayor al saldo de la cuenta bancaria, se muestra un mensaje de error.
 * Si la cantidad ingresada es menor o igual al saldo de la cuenta bancaria, se realiza la transaccion y se muestra un mensaje de confirmacion.
 * Luego se llama a la funcion registrarTransaccion() para registrar la transaccion realizada.
 * En caso de error, se muestra un mensaje de error y se vuelve a llamar a la funcion cajeroTransaccion().
 * En caso de exito, se muestra un mensaje de confirmacion y se vuelve a llamar a la funcion cajero().
 */

async function obtenerSaldo(cedula) {
  return new Promise((resolve, reject) => {
    db.get("SELECT Saldo FROM Cuenta WHERE Cedula = ?", [cedula], (err, row) => {
      if (err || !row) {
        reject("Error al obtener el saldo de la base de datos.");
      } else {
        resolve(row.Saldo);
      }
    });
  });
}

async function obtenerDestino(destino) {
  return new Promise((resolve, reject) => {
    db.get("SELECT Cedula FROM Cuenta WHERE Cedula = ?", [destino], (err, row) => {
      if (err || !row) {
        reject("Error al obtener el destino de la base de datos.");
      } else {
        resolve(row.Cedula);
      }
    });
  });
}

async function actualizarSaldo(cedula, nuevoSaldo) {
  return new Promise((resolve, reject) => {
    db.run("UPDATE Cuenta SET Saldo = ? WHERE Cedula = ?", [nuevoSaldo, cedula], (err) => {
      if (err) {
        reject("Error al actualizar el saldo de la base de datos.");
      } else {
        resolve();
      }
    });
  });
}

export async function transaccion(cantidad, destino) {
  console.clear();

  // Validación de destino
  if (cedulaGuardada === destino) {
    console.error("\n--- No puedes realizar una transacción a tu propia cuenta. ---\n");
    setTimeout(cajeroTransaccionMenu, 2000);
    return;
  }

  try {
    // Obtener saldo de la cuenta origen
    const saldoPropActual = await obtenerSaldo(cedulaGuardada);

    // Verificar si el saldo es suficiente
    if (cantidad > saldoPropActual) {
      console.clear();
      console.log(chalk.red("\n--- El monto ingresado es mayor al monto de la cuenta bancaria ---"));
      setTimeout(cajeroTransaccionMenu, 2000);
      return;
    }

    // Obtener saldo y validar existencia de la cuenta destino
    await obtenerDestino(destino);
    const saldoDestino = await obtenerSaldo(destino);

    // Actualizar los saldos
    const saldoPropActualizado = saldoPropActual - cantidad;
    const saldoDestinoActualizado = saldoDestino + cantidad;

    await actualizarSaldo(cedulaGuardada, saldoPropActualizado);
    await actualizarSaldo(destino, saldoDestinoActualizado);

    // Confirmar la transacción
    console.log(chalk.green("\n--- Transferencia realizada con éxito ---"));
    console.log(chalk.green(`\n--- Su saldo actualizado: ${saldoPropActualizado}$ ---`));
    console.log(chalk.green("\n--- Gracias por utilizar nuestros servicios ---\n"));

    // Registrar la operación
    registrarOperacion(cedulaGuardada, "transaccion", cantidad, destino);

  } catch (error) {
    console.clear();
    console.error(error);
    setTimeout(cajeroTransaccionMenu, 2000);
  }
}

export default transaccion;
