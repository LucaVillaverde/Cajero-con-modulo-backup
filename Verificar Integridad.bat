@echo off
cd /d %~dp0

:: Verificar que las dependencias listadas estén correctamente instaladas
IF EXIST verificarDependencias.js (
    echo Verificando integridad de dependencias...
    node verificarDependencias.js
    IF %ERRORLEVEL% NEQ 0 (
        echo Algunas dependencias faltan. Considera correr manualmente "npm install".
        timeout /t 10
        exit /b
    )
    timeout /t 10
) ELSE (
    echo ADVERTENCIA: Falta el archivo verificarDependencias.js. No se puede validar node_modules.
    pause
    exit /b
)

cls

:: Verificar si la base de datos y el directorio están bien.
IF EXIST verificar_DB_Dir.js (
    echo Verificando existencia y/o integridad de los archivos...
    node verificar_DB_Dir.js
    IF %ERRORLEVEL% NEQ 0 (
        echo Ha ocurrido un error con la base de datos o directorio.
        timeout /t 10
        exit /b
    )
    timeout /t 10
) ELSE (
    echo ADVERTENCIA: Falta el archivo verificar_DB_Dir.js. No se puede validar la base de datos o directorio.
    pause
    exit /b
)

:: Pausar al final para ver los resultados
exit /b
pause
