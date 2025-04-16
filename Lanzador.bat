@echo off
cd /d %~dp0

IF EXIST verificar_DB_Dir.js (
	call node verificar_DB_Dir.js
	pause
)

cls

IF EXIST cajero.js (
	echo Programa cajero encontrado.
	IF EXIST backup.js (
		echo Programa backup encontrado, iniciando cajero y sistema backup....
		start cmd /k "cd /d %~dp0 && node cajero.js"
		timeout /t 2
		start cmd /k "cd /d %~dp0 && node backup.js"
		exit /b
		pause
	) else (
		echo No se ha encontrado el programa, busque manualmente "backup.js".
		pause
		exit /b
	)
) ELSE (
	echo No se ha encontrado el programa, busque manualmente "cajero.js".
	echo Sin cajero.js no tiene sentido lanzar backup.js
	pause
	exit /b
)

pause