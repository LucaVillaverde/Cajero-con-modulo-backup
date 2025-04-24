@echo off
cd /d %~dp0

IF EXIST ../../Verificadores_de_Integridad/verificarDependencias.js (
	call node ../../Verificadores_de_Integridad/verificarDependencias.js
	IF ERRORLEVEL 1 (
		call npm install
		pause
	)
	IF EXIST ../../Verificadores_de_Integridad/verificar_DB_Dir.js (
		call node ../../Verificadores_de_Integridad/verificar_DB_Dir.js
	) ELSE (
		echo No existe verificar_DB_Dir.js, verifique que haya descargado todo.
		pause
	)
) ELSE (
	echo No existe verificarDependencias.js, verifique que haya descargado todo.
	pause
)

cls

IF EXIST ../../Cajero/Codigo_Central/cajeroMenu.js (
	IF EXIST ../../Apartado_Backup/backup.js (
		echo Iniciando Programa...
		start cmd /k "cd /d %~dp0 && node ./Apartado_Backup/backup.js"
		call node ../../Cajero/Codigo_Central/cajeroMenu.js
		pause
		cls
		if EXIST ../../Apartado_Backup/backupEmergencia.js (
			echo Cierre del cajero detectado, iniciando backup de emergencia...
			call node ../../Apartado_Backup/backupEmergencia.js
			pause
		) ELSE (
			echo No se pudo hacer el backup de cierre del cajero.
			echo Fuerza un backup manual apretando "b" en el programa de backups.
			pause
		)
	) else (
		echo No se ha encontrado el programa, busque manualmente "backup.js".
		pause
	)
) ELSE (
	echo No se ha encontrado el programa, busque manualmente "cajero.js".
	echo Sin cajero.js no tiene sentido lanzar backup.js
	pause
)
