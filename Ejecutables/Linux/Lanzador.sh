#!/bin/bash

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Variable para logging (true/false)
LOGGING=true
LOGFILE="backup.log"

# Función para pausar con tiempo fijo
pausa() {
    local segundos=$1
    echo "Esperando $segundos segundos para lectura..."
    sleep "$segundos"
}

# Verificar existencia de verificarDependencias.js
if [[ -f ../../Verificadores_de_Integridad/verificarDependencias.js ]]; then
    node ../../Verificadores_de_Integridad/verificarDependencias.js
    if [[ $? -ne 0 ]]; then
        npm install
        pausa 5
    fi

    # Verificar existencia de verificar_DB_Dir.js
    if [[ -f ../../Verificadores_de_Integridad/verificar_DB_Dir.js ]]; then
        node ../../Verificadores_de_Integridad/verificar_DB_Dir.js
    else
        echo "No existe verificar_DB_Dir.js, verifique que haya descargado todo."
        pausa 5
    fi
else
    echo "No existe verificarDependencias.js, verifique que haya descargado todo."
    pausa 5
    exit 1
fi

# Limpiar la terminal
clear

# Verificar existencia de cajeroMenu.js y backup.js
if [[ -f ../../Cajero/Codigo_Central/cajeroMenu.js ]]; then
    if [[ -f ../../Apartado_Backup/backup.js ]]; then
        echo "Iniciando Programa..."
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd \"$(dirname "$0")\" && node ../../Apartado_Backup/backup.js; exec bash" &
            sleep 1
            if [[ -f ../../Apartado_Backup/backup.pid ]]; then
                BACKUP_PID=$(cat ../../Apartado_Backup/backup.pid)
            fi
        else
            if [[ "$LOGGING" == true ]]; then
                bash -c "cd \"$(dirname "$0")\" && node ../../Apartado_Backup/backup.js" >> "$LOGFILE" 2>&1 &
            else
                bash -c "cd \"$(dirname "$0")\" && node ../../Apartado_Backup/backup.js" >/dev/null 2>&1 &
            fi
            BACKUP_PID=$!
        fi

        export BACKUP_PID
        node ../../Cajero/Codigo_Central/cajeroMenu.js
        if ps -p $BACKUP_PID > /dev/null; then
            echo "Cierre del cajero detectado, enviando señal al backup..."
            kill -USR2 $BACKUP_PID
        fi
        pausa 5
        clear

        # Verificar existencia de backupEmergencia.js
        if [[ -f ../../Apartado_Backup/backupEmergencia.js ]]; then
            echo "Cierre del cajero detectado, iniciando backup de emergencia..."
            node ../../Apartado_Backup/backupEmergencia.js
            pausa 5
        else
            echo "No se pudo hacer el backup de cierre del cajero."
            echo "Fuerza un backup manual apretando 'b' en el programa de backups."
            pausa 5
        fi
    else
        echo "No se ha encontrado el programa, busque manualmente 'backup.js'."
        pausa 5
    fi
else
    echo "No se ha encontrado el programa, busque manualmente 'cajeroMenu.js'."
    echo "Sin cajeroMenu.js no tiene sentido lanzar backup.js."
    pausa 5
fi
