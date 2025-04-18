import chalk from 'chalk';
import { cajeroTransaccion, cajeroRetiro, cajeroIngreso, cajero, reinicio, rl } from './cajero.js';



/**
La funcion consulta(tipo) se encarga de mostrar un menu segun la informacion que tenga la variable "tipo" (tipo es un string).

Si "tipo" es "transaccion", se muestra un menu con opciones para realizar otra transaccion [llamando asi a la funcion cajeroTransaccion()], ir al menu principal [llamando a cajero()] o cerrar sesion [llamando a reinicio()].

Si "tipo" es "retiro", se muestra un menu con opciones para realizar otro retiro [llamando asi a la funcion cajeroRetiro()], ir al menu principal o cerrar sesion.

Si "tipo" es "ingreso", se muestra un menu con opciones para realizar otro ingreso [llamando asi a la funcion cajeroIngreso()], ir al menu principal o cerrar sesion.

SI "tipo" no es ninguna de las tres opciones anteriores, se muestra un mensaje de error y se carga el menu principal del cajero [llamando asi a la funcion cajero()].
*/

export function consulta(tipo) {
    console.clear();

    const mensajes = {
        transaccion: "otra transacción",
        retiro: "otro retiro",
        ingreso: "otro ingreso"
    };

    const funciones = {
        transaccion: cajeroTransaccion,
        retiro: cajeroRetiro,
        ingreso: cajeroIngreso
    };

    if (!mensajes[tipo] || !funciones[tipo]) {
        console.log(chalk.red("\n--- No se ha definido el tipo de proceso a realizar ---\n"));
        setTimeout(() => {
            console.clear();
            cajero();
        }, 2000);
        return;
    }

    console.log(chalk.cyan.bgBlack(`\n--- Ingrese 1 para realizar ${mensajes[tipo]} ---`));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 2 para ir al menu principal ---"));
    console.log(chalk.cyan.bgBlack("\n--- Ingrese 3 para salir del cajero ---\n"));

    rl.question("\nIndique la opcion: ", (input) => {
        const opcion = parseInt(input);
        console.clear();

        switch (opcion) {
            case 1:
                funciones[tipo](); break;
            case 2:
                cajero(); break;
            case 3:
                reinicio(); break;
            default:
                console.log(chalk.red("\n--- Opcion no valida ---\n"));
                setTimeout(() => consulta(tipo), 2000);
        }
    });
}



export default consulta 