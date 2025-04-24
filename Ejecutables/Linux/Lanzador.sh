#!/bin/bash

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Verificar existencia de verificarDependencias.js
if [[ -f ../../Verificadores_de_Integridad/verificarDependencias.js ]]; then
    node ../../Verificadores_de_Integridad/verificarDependencias.js
    if [[ $? -ne 0 ]]; then
        npm install
        read -p "Presiona Enter para continuar..."
    fi

    # Verificar existencia de verificar_DB_Dir.js
    if [[ -f ../../Verificadores_de_Integridad/verificar_DB_Dir.js ]]; then
        node ../../Verificadores_de_Integridad/verificar_DB_Dir.js
    else
        echo "No existe verificar_DB_Dir.js, verifique que haya descargado todo."
        read -p "Presiona Enter para continuar..."
    fi
else
    echo "No existe verificarDependencias.js, verifique que haya descargado todo."
    read -p "Presiona Enter para continuar..."
    exit 1
fi

# Limpiar la terminal
clear

# Verificar existencia de cajeroMenu.js y backup.js
if [[ -f ../../Cajero/Codigo_Central/cajeroMenu.js ]]; then
    if [[ -f ../../Apartado_Backup/backup.js ]]; then
        echo "Iniciando Programa..."
        gnome-terminal -- bash -c "cd \"$(dirname "$0")\" && node ../../Apartado_Backup/backup.js; exec bash"
        node ../../Cajero/Codigo_Central/cajeroMenu.js
        read -p "Presiona Enter para continuar..."
        clear

        # Verificar existencia de backupEmergencia.js
        if [[ -f ../../Apartado_Backup/backupEmergencia.js ]]; then
            echo "Cierre del cajero detectado, iniciando backup de emergencia..."
            node ./Apartado_Backup/backupEmergencia.js
            read -p "Presiona Enter para continuar..."
        else
            echo "No se pudo hacer el backup de cierre del cajero."
            echo "Fuerza un backup manual apretando 'b' en el programa de backups."
            read -p "Presiona Enter para continuar..."
        fi
    else
        echo "No se ha encontrado el programa, busque manualmente 'backup.js'."
        read -p "Presiona Enter para continuar..."
    fi
else
    echo "No se ha encontrado el programa, busque manualmente 'cajeroMenu.js'."
    echo "Sin cajeroMenu.js no tiene sentido lanzar backup.js."
    read -p "Presiona Enter para continuar..."
fi