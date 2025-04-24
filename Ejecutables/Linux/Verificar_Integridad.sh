#!/bin/bash

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Verificar que las dependencias listadas estén correctamente instaladas
if [[ -f ../../Verificadores_de_Integridad/verificarDependencias.js ]]; then
    echo "Verificando integridad de dependencias..."
    node ../../Verificadores_de_Integridad/verificarDependencias.js
    if [[ $? -ne 0 ]]; then
        echo "Dependencias faltantes detectadas"
        npm install
        read -p "Presiona Enter para continuar..."
    fi
else
    echo "ADVERTENCIA: Falta el archivo verificarDependencias.js. No se puede validar node_modules."
    read -p "Presiona Enter para continuar..."
    exit 1
fi

# Verificar si la base de datos y el directorio están bien
if [[ -f ../../Verificadores_de_Integridad/verificar_DB_Dir.js ]]; then
    echo "Verificando existencia y/o integridad de los archivos..."
    node ../../Verificadores_de_Integridad/verificar_DB_Dir.js
    if [[ $? -ne 0 ]]; then
        echo "Ha ocurrido un error con la base de datos o directorio."
        read -p "Presiona Enter para continuar..."
        exit 1
    fi
    read -p "Presiona Enter para continuar..."
else
    echo "ADVERTENCIA: Falta el archivo verificar_DB_Dir.js. No se puede validar la base de datos o directorio."
    read -p "Presiona Enter para continuar..."
    exit 1
fi

# Pausar al final para ver los resultados
read -p "Presiona Enter para salir..."