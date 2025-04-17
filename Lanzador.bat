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
		start cmd /k "cd /d %~dp0 && node backup.js"
		call node cajero.js
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