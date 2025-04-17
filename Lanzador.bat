@echo off
cd /d %~dp0

IF EXIST verificar_DB_Dir.js (
	call node verificar_DB_Dir.js
	pause
	IF EXIST verificarDependencias.js (
		call node verificarDependencias.js
		IF ERRORLEVEL 1 (
			call npm install
			pause
		)
		pause
	) ELSE (
		echo No existe verificarDependencias.js, verifique que haya descargado todo.
		timeout /t 5
		exit /b
	)
) ELSE (
	echo No existe verificar_DB_Dir.js, verifique que haya descargado todo.
	timeout /t 5
	exit /b
)

cls

IF EXIST cajero.js (
	IF EXIST backup.js (
		echo Iniciando Programa...
		start cmd /k "cd /d %~dp0 && node backup.js"
		call node cajero.js
		timeout /t 2
		cls
		if EXIST backupEmergencia.js (
			echo Cierre del cajero detectado, iniciando backup de emergencia...
			call node backupEmergencia.js
			pause
		) ELSE (
			echo No se pudo hacer el backup de cierre del cajero.
			echo Fuerza un backup manual apretando "b" en el programa de backups.
		)
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