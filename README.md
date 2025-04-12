# 💳 TesteoCajero

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
  - Al iniciar el modulo backup inicia su primer respaldo (Se haya hecho hace 5 minutos alguno o no, lo hara igual).
  - Backup **manual** desde consola (presionando `b`)
  - Backup **automático** cada hora con `node-cron`
  - Conserva solo los últimos 5 backups (elimina los más antiguos)

---

## 📦 Requisitos

- Node.js v20.17.0 o superior  
- npm v11.2.0 o superior

---

## 🔐 Cuenta Administrador

- Al ejecutar `npm run cajero`, cuando se solicite la cédula, ingresá:
  - **Cédula**: `Administrador`
- Cuando se solicite el PIN, ingresá:
  - **PIN**: `AdminPassword`

Esto habilita el menú de administración con funciones como crear, editar o eliminar cuentas, y realizar otras acciones del sistema.

---

## 📂 Instalación

1. Cloná el repositorio para tener acceso a todos sus archivos.

2. Abre un cmd / powershell (o terminal como le quieras decir) desde la carpeta del proyecto.

3. Asegurate de instalar las dependencias con "npm install".

4. Usar "npm run cajero" para iniciar el sistema principal.

4. Usar "npm run backup" para ejecutar el modulo de backup.
    - Presionar "b" para forzar un backup (un backup manual).
    - Presionar "q" para cerrar el modulo backup.
