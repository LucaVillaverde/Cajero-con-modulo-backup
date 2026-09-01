#!/bin/bash

cd "$(dirname "$0")"

# Versión mínima requerida
MIN_NODE_VERSION="20.17.0"
MIN_NPM_VERSION="11.2.0"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js no está instalado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node -v)
echo "Node.js encontrado: $NODE_VERSION"
NODE_VERSION_NUM="${NODE_VERSION#v}"

# Comparar versión de Node
if [ "$(printf '%s\n' "$MIN_NODE_VERSION" "$NODE_VERSION_NUM" | sort -V | head -n1)" != "$MIN_NODE_VERSION" ]; then
    echo "Node.js es menor a $MIN_NODE_VERSION. Actualizando..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "npm no está instalado. Instalando..."
    sudo apt-get install -y npm
fi

NPM_VERSION=$(npm -v)
echo "npm encontrado: $NPM_VERSION"

# Comparar versión de npm
if [ "$(printf '%s\n' "$MIN_NPM_VERSION" "$NPM_VERSION" | sort -V | head -n1)" != "$MIN_NPM_VERSION" ]; then
    echo "npm es menor a $MIN_NPM_VERSION. Actualizando..."
    sudo npm install -g npm
fi

clear

# Verificar dependencias
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