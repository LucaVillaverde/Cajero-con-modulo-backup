@echo off
cd /d %~dp0

:: Verificar que las dependencias listadas estén correctamente instaladas
IF EXIST verificarDependencias.js (
    echo Verificando integridad de dependencias...
    call node verificarDependencias.js
    IF ERRORLEVEL 1 (
        echo Dependencias faltantes detectadas
        call npm install
    )
) ELSE (
    echo ADVERTENCIA: Falta el archivo verificarDependencias.js. No se puede validar node_modules.
    pause
    exit /b
)


timeout /t 2
cls

:: Verificar si la base de datos y el directorio están bien.
IF EXIST verificar_DB_Dir.js (
    echo Verificando existencia y/o integridad de los archivos...
    node verificar_DB_Dir.js
    IF ERRORLEVEL 1 (
        echo Ha ocurrido un error con la base de datos o directorio.
	    pause
        exit /b
    )
) ELSE (
    echo ADVERTENCIA: Falta el archivo verificar_DB_Dir.js. No se puede validar la base de datos o directorio.
    pause
    exit /b
)

:: Pausar al final para ver los resultados
pause
exit /b
