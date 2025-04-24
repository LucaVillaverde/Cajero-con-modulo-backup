#!/bin/bash

cd "$(dirname "$0")"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js no está instalado."
    echo "Descargalo desde su sitio oficial: https://nodejs.org/es"
    xdg-open "https://nodejs.org/es" 2>/dev/null || echo "Abrí el link manualmente."
    read -p "Presiona ENTER para salir..."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "Node.js encontrado: $NODE_VERSION"

# Quitar la "v" del inicio de la versión
NODE_VERSION_NUM="${NODE_VERSION#v}"

# Comparar con 20.17.0
MIN_NODE_VERSION="20.17.0"
if [ "$(printf '%s\n' "$MIN_NODE_VERSION" "$NODE_VERSION_NUM" | sort -V | head -n1)" != "$MIN_NODE_VERSION" ]; then
    echo "Se requiere Node.js v$MIN_NODE_VERSION o superior."
    echo "Actualizá tu versión: https://nodejs.org/es"
    xdg-open "https://nodejs.org/es" 2>/dev/null || echo "Abrí el link manualmente."
    read -p "Presiona ENTER para salir..."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "npm no está instalado. Intentando instalarlo..."
    sudo apt update && sudo apt install -y npm
    if ! command -v npm &> /dev/null; then
        echo "Fallo la instalación de npm."
        exit 1
    fi
fi

NPM_VERSION=$(npm -v)
echo "npm encontrado: $NPM_VERSION"

# Comparar con 11.2.0
MIN_NPM_VERSION="11.2.0"
if [ "$(printf '%s\n' "$MIN_NPM_VERSION" "$NPM_VERSION" | sort -V | head -n1)" != "$MIN_NPM_VERSION" ]; then
    echo "Se requiere npm v$MIN_NPM_VERSION o superior."
    echo "Actualizando npm..."
    npm install -g npm
fi

clear

# Verificar node_modules y dependencias
if [ -d "../../node_modules" ]; then
    echo "La carpeta node_modules existe."
    echo "Verificando dependencias..."

    if [ -f "../../Verificadores_de_Integridad/verificarDependencias.js" ]; then
        node ../../Verificadores_de_Integridad/verificarDependencias.js
        if [ $? -ne 0 ]; then
            echo "Dependencias faltantes detectadas. Ejecutando npm install..."
            npm install
        else
            echo "No faltan dependencias."
        fi

        if [ -f "../../Verificadores_de_Integridad/verificar_DB_Dir.js" ]; then
            node ../../Verificadores_de_Integridad/verificar_DB_Dir.js
            if [ $? -ne 0 ]; then
                echo "No se pudo verificar la base de datos o directorio."
                read -p "Presiona ENTER para continuar..."
            fi
        else
            echo "No se encuentra verificar_DB_Dir.js"
            read -p "Presiona ENTER para continuar..."
        fi
    else
        echo "No se encuentra verificarDependencias.js"
        read -p "Presiona ENTER para continuar..."
    fi
else
    echo "Instalando dependencias..."
    if [ ! -f "../../package.json" ]; then
        echo "No se encontró package.json. Verificá que descargaste todo el proyecto."
        read -p "Presiona ENTER para salir..."
        exit 1
    fi

    npm install

    if [ -f "../../Verificadores_de_Integridad/verificar_DB_Dir.js" ]; then
        node ../../Verificadores_de_Integridad/verificar_DB_Dir.js
        if [ $? -ne 0 ]; then
            echo "No se pudo verificar la base de datos o directorio."
        fi
    else
        echo "No se encuentra verificar_DB_Dir.js"
    fi

    read -p "Presiona ENTER para continuar..."
fi
