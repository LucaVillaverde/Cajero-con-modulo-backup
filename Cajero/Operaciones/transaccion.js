import chalk from "chalk";
import { registrarOperacion } from "./registrarOperacion.js";
import { rl, db, cedulaGuardada } from "../Codigo_Central/cajeroMenu.js";
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
        resolve(1);
      }
    });
  });
}

export async function transaccion(cantidad, destino) {
  console.clear();
  
  let existenciaDestino = await obtenerDestino(destino); // Esperar a que se tenga la informacion el destino
  if (String(existenciaDestino).trim() === String(destino).trim()){
    let saldoDestino = await obtenerSaldo(destino); // Declarar saldoDestino para despues guardar el saldo de la cuenta destino
    let saldoPropActual = await obtenerSaldo(cedulaGuardada); // Declarar saldoPropActual para despues guardar el saldo de la cuenta origen

    // Actualizar los saldos
    let saldoPropActualizado = saldoPropActual - cantidad; // Declarar saldoPropActualizado para despues guardar el nuevo saldo de la cuenta origen
    let saldoDestinoActualizado = saldoDestino + cantidad; // Declarar saldoDestinoActualizado para despues guardar el nuevo saldo de la cuenta destino

    // Validación de destino
    if (cedulaGuardada === destino) {
      console.error("\n--- No puedes realizar una transacción a tu propia cuenta. ---\n");
      setTimeout(cajeroTransaccionMenu, 2000);
      return;
    }

    // Verificar si el saldo es suficiente
    if (cantidad > saldoPropActual) {
      console.clear();
      console.log(chalk.red("\n--- El monto ingresado es mayor al monto de la cuenta bancaria ---"));
      setTimeout(cajeroTransaccionMenu, 2000);
      return;
    }

    try {
      console.log(chalk.yellow.bgBlack("\n Informacion de la transacción: "));
      console.log(chalk.yellow.bgBlack(`\n--- Cuenta origen: ${cedulaGuardada} ---`));
      console.log(chalk.yellow.bgBlack(`\n--- Cuenta destino: ${destino} ---`));
      console.log(chalk.yellow.bgBlack(`\n--- Monto a transferir al destino: ${cantidad}$ ---`));
      console.log(`\n-----------------------------------------`);
      console.log(chalk.cyan.bgBlack("\n--- ¿Desea realizar la transacción? ---"));
      console.log(chalk.cyan.bgBlack("\n--- Digite 1 si esta seguro de realizar la transacción ---"));
      console.log(chalk.cyan.bgBlack("\n--- Digite 2 si desea cancelar la transacción ---"));
      rl.question("\nSeleccione una opcion: ", async(input) => {
        const opcion = parseInt(input);

        switch (opcion) {
          case 1:
            console.clear();
            const resultPropio = await actualizarSaldo(cedulaGuardada, saldoPropActualizado);
            const resultDestino = await actualizarSaldo(destino, saldoDestinoActualizado);

            if (resultPropio !== 1 || resultDestino !== 1) {
              console.error("\n--- Hubo un problema con la actualización de saldo. ---\n");
          
              if (!(resultPropio !== 1 && resultDestino !== 1)) { // Solo actualizar si no fallaron ambos
                  if (resultPropio !== 1) await actualizarSaldo(cedulaGuardada, saldoPropActual);
                  if (resultDestino !== 1) await actualizarSaldo(destino, saldoDestino);
              }
          
              setTimeout(cajeroTransaccionMenu, 2000);
              return;
          }
        
            // Informar al usuario que se realizo la transacción
            console.log(chalk.green("\n--- Transferencia realizada con éxito ---"));
            console.log(chalk.green(`\n--- Su saldo actualizado: ${saldoPropActualizado}$ ---`));
            console.log(chalk.green("\n--- Gracias por utilizar nuestros servicios ---\n"));
        
            // Registrar la operación
            registrarOperacion(cedulaGuardada, "transaccion", cantidad, destino);
            break;
          case 2:
            cajeroTransaccionMenu();
            break;
          default:
            console.clear();
            console.log(chalk.red("\n--- Opcion no valida ---"));
            setTimeout(() => {
              transaccion(cantidad, destino);
            }, 2000);
            break;
        }
      });

    } catch (error) {
      console.clear();
      console.error(error);
      setTimeout(cajeroTransaccionMenu, 2000);
    }
  } else {
    console.clear();
    console.log(chalk.red("\n--- El destinatario no existe ---"));
    setTimeout(cajeroTransaccionMenu, 2000);
  }
}

export default transaccion;
