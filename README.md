# 💳 Proyecto Cajero

Sistema de cajero automático interactivo en consola hecho con Node.js.

Este proyecto personal fue desarrollado como una forma de practicar lógica de programación, gestión de archivos, bases de datos y automatización de tareas en un entorno de consola.

---

## 🚀 Funcionalidades principales

- ✔️ Ingreso con cédula y PIN encriptado (`bcrypt`)
- 🏦 Panel de administrador:
  - Crear, editar (solo edición de PIN) o eliminar cuentas
  - Visualizar historial de operaciones hechas (ingresos, retiros y transferencias)
  - Ver las cuentas existentes en la base de datos
- 🧪 Validaciones estrictas para todos los campos (se aceptan sugerencias)
- 💾 Sistema de backup:
  - Al iniciar el modulo backup inicia un respaldo independientemente a todo
  - Backup **manual** desde consola (presionando `b`)
  - Backup **automático** cada hora con `node-cron`
  - Conserva solo los últimos 10 backups (elimina los más antiguos)

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
