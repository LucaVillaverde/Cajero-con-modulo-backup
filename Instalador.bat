@echo off
cd /d %~dp0
setlocal enabledelayedexpansion

:: Verificar si Node.js está instalado
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js no está instalado.
    echo descargalo desde su sitio oficial.
    start "" "https://nodejs.org/es"
    pause
    exit /b
)
for /f "tokens=* usebackq" %%v in (`node -v`) do set "NODE_VERSION=%%v"
echo Node.js encontrado: %NODE_VERSION%

:: Quitar la "v" del inicio de la versión
set "NODE_VERSION_NUM=%NODE_VERSION:~1%"

:: Verificar si es >= 20.17.0
call :compare_versions "%NODE_VERSION_NUM%" "20.17.0"
IF %ERRORLEVEL% NEQ 0 (
    echo Se requiere Node.js v20.17.0 o superior.
    echo Considere actualizarlo
    start "" "https://nodejs.org/es"
    pause
    exit /b
)

:: Verificar si npm está instalado
where npm >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo npm no está instalado.
    echo instalando...
    npm install -g npm
    pause
    exit /b
)
for /f "tokens=* usebackq" %%v in (`npm -v`) do set "NPM_VERSION=%%v"
echo npm encontrado: %NPM_VERSION%

:: Verificar si es >= 11.2.0
call :compare_versions "%NPM_VERSION%" "11.2.0"
IF %ERRORLEVEL% NEQ 0 (
    echo Se requiere npm v11.2.0 o superior.
    echo Actualizando...
    npm install -g npm
    pause
    exit /b
)

timeout /t 2
cls

:: Revisar si node_modules ya está instalado
IF EXIST node_modules (
    echo La carpeta node_modules existe.
    echo Verificando dependencias...
    :: Verificar que las dependencias listadas estén correctamente instaladas
    IF EXIST ./Verificadores_de_Integridad/verificarDependencias.js (
    	call node ./Verificadores_de_Integridad/verificarDependencias.js
        IF ERRORLEVEL 1 (
            echo Dependencias faltantes detectadas
            call npm install
        ) else (
            echo No faltan dependencias
        )
        IF EXIST ./Verificadores_de_Integridad/verificar_DB_Dir.js (
            call node ./Verificadores_de_Integridad/verificar_DB_Dir.js
            IF ERRORLEVEL 1 (
                echo No se ha podido verificar la base de datos y/o el directorio.
                pause
            )
        ) ELSE (
            echo No existe verificar_DB_Dir.js revise que haya descargado todo.
            pause
        )
    ) ELSE (
        echo No existe verificarDependencias.js revise que haya descargado todo.
        pause
    )
) ELSE (
    echo Instalando dependencias...
    IF NOT EXIST package.json (
        echo No se ha encontrado package.json.
        echo No es posible hacer la instalacion de dependencias.
        echo Verifique que haya descargado todo el programa.
        pause
        exit /b
    )

    npm install
    REM Volver explícitamente al directorio del script por si npm lo cambia
    cd /d %~dp0

    
    IF EXIST ./Verificadores_de_Integridad/verificar_DB_Dir.js (
        call node ./Verificadores_de_Integridad/verificar_DB_Dir.js
        IF ERRORLEVEL 1 (
            echo No se ha podido verificar la base de datos y/o el directorio.
            pause
        ) else (
            pause
        )
    ) ELSE (
        echo No existe verificar_DB_Dir.js revise que haya descargado todo.
        pause
    )
)


pause

:: ========================
:: Función para comparar versiones
:compare_versions
:: Parámetro 1: versión actual
:: Parámetro 2: versión mínima
setlocal
set "v1=%~1"
set "v2=%~2"

for /f "tokens=1-3 delims=." %%a in ("%v1%") do (
    set "v1_1=%%a"
    set "v1_2=%%b"
    set "v1_3=%%c"
)
for /f "tokens=1-3 delims=." %%a in ("%v2%") do (
    set "v2_1=%%a"
    set "v2_2=%%b"
    set "v2_3=%%c"
)

if !v1_1! LSS !v2_1! exit /b 1
if !v1_1! GTR !v2_1! exit /b 0

if !v1_2! LSS !v2_2! exit /b 1
if !v1_2! GTR !v2_2! exit /b 0

if !v1_3! LSS !v2_3! exit /b 1
if !v1_3! GEQ !v2_3! exit /b 0

exit /b 1