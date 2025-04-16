@echo off
cd /d %~dp0

echo Buscando el programa...
echo ========================

timeout /t 5
cls

IF EXIST cajero.js (
	echo Programa cajero encontrado.
	timeout /t 5
	IF EXIST backup.js (
		echo Programa backup encontrado, iniciando cajero y sistema backup....
		timeout /t 5
		start cmd /k "cd /d %~dp0 && node backup.js"
		timeout /t 1
		node cajero.js
	) else (
		echo No se ha encontrado el programa, busque manualmente "backup.js".
		pause
		exit /b
	)
) ELSE (
	echo No se ha encontrado el programa, busque manualmente "cajero.js".
	pause
	exit /b
)

pause