# 💳 Proyecto Cajero

Sistema de cajero automático interactivo en consola hecho con Node.js.

Este proyecto personal fue desarrollado como una forma de practicar lógica de programación, gestión de archivos, bases de datos y automatización de tareas en un entorno de consola.

---
# ⁉️ Dudas

- ¿Que hace el Instalador.bat?
  1. Verifica que tengas NPM y Nodejs (minimo cumpliendo con los requisitos que marque mas abajo).
  2. Luego verifica si el directorio node_modules existe (si no existe entonces no hay dependencias instaladas).
     - en el caso de que exista, compara las dependencias instaladas con las dependencias que indica package.json (haciendo uso de verificarDependencias.js) e instala las faltantes.
     - si no existiese pasa a hacer 'npm install" que es para instalar las dependencias que indica el package.json.
     - si package.json no existe entonces simplemente no instala nada (intente conseguir el package.json del proyecto).
  (Recuerde que el instalador.bat no instala NPM ni Nodejs por usted, tiene que instalarlo desde sus paginas correspondientes).

- ¿Que hace el "Verificar Integridad.bat"?
  1. Como su nombre lo indica verifica la integridad haciendo uso de dos archivos javascript (verificarDependencias.js y verificar_DB_Dir.js).
     -Si alguno de los dos archivos javascript no existe entonces mandara un error.

- ¿Que hace verificarDependencias.js?
  1. Comprueba que exista la carpeta node_modules y el archivo package.json con los cuales hara una comparativa.
  2. Verifica las dependencias instaladas y las compara con las dependencias que package.json dice que el proyecto necesita.
  3. Si falta alguna dependencia entonces se le avisara al usuario y por ende tendra que usar el instalador.bat.
  4. Sino falta ninguna dependencia entonces simplemente dira que esta todo correcto.

- ¿Que hace verificar_DB_Dir.js?
  1. Comprueba la existencia del directorio backups (que si no existe lo crea).
  2. Comprueba la existencia y integridad de la base de datos en uso.
     - Si la base de datos no existe, o tiene algun problema entonces trata de conseguir un respaldo reciente.
     - Si no hay respaldo disponible entonces crea una base de datos preparada para su uso (con las tablas creadas, pero sin informacion).
---

## 🚀 Funcionalidades principales

- ✔️ Ingreso con cédula y PIN encriptado (`bcrypt`).
- 🏦 Panel de administrador:
  - Crear, editar (solo edición de PIN) o eliminar cuentas.
  - Visualizar historial de operaciones hechas (ingresos, retiros y transferencias).
  - Ver las cuentas existentes en la base de datos.
- 🧪 Validaciones estrictas para todos los campos (se aceptan sugerencias).
- 💾 Sistema de backup:
  - Al iniciar el modulo backup inicia un respaldo independientemente a todo.
  - Backup **manual** desde consola (presionando `b`).
  - Backup **automático** cada hora con `node-cron`.
  - Conserva solo los últimos 10 backups (elimina los más antiguos).
  - Salir con "Esc".

---

## 📦 Requisitos

- Node.js v20.17.0 o superior  
- npm v11.2.0 o superior

---

## 💀 Aviso

- Este proyecto se ha hecho y pensado para windows, no sé si funciona para Linux (seguramente sea alguna adaptación que haga a futuro).

- Si bien puede ejecutar primero el cajero sin problema aparente, recuerde que tiene que ejecutar el backup.js luego de terminar con el cajero.js

  - El cajero.js por si solo no hace backups, solo genera el directorio backups y la base de datos que va a usar con la configuracion que precisa.

  - El backup.js se encarga de lo siguiente:

  1. Si hay directorio y backups pero no hay una base de datos en uso, entonces copia el backup más reciente para ponerlo en uso.

  2. Si hay directorio pero no hay backups ni base de datos en uso, entonces crea una base de datos preparada (pero sin informacion) para luego generarle un respaldo por si las dudas.

  3. Si no hay directorio, backups y base de datos en uso, entonces crea el directorio, luego crea la base de datos y le hace una copia.

  4. Si no hay directorio ni backups pero si base de datos, entonces crea el directorio y luego copia la base de datos en uso para hacer el backup.

  - Por obvias razones no existe el caso de existir backups pero no el directorio...

---

## 🔐 Cuenta Administrador

1. Ejecutar `npm run cajero`, cuando se solicite la cédula, ingresá:
  - **Cédula**: `Administrador`

2. Cuando se solicite el PIN, ingresá:
  - **PIN**: `AdminPassword`

Esto habilita el menú de administración con funciones como crear, editar o eliminar cuentas, y realizar otras acciones del sistema.

---

## 📂 Instalación

1. Cloná el repositorio para tener acceso a todos sus archivos.

2. Ejecuta el "Instalador.bat".

3. Ejecute "Verificar Integridad.bat".

4. Ejecute "Lanzador.bat".

5. Todo listo, recomiendo que al cerrar el cajero vaya a la consola del backup y aprete "b" para hacer un backup manual y luego aprete "Esc" para salir.