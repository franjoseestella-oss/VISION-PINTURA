@echo off
echo =======================================================
echo   Iniciando Aplicacion con Entorno Virtual (.venv)
echo =======================================================

IF EXIST ".venv\Scripts\activate.bat" (
    echo [INFO] Activando .venv...
    call .venv\Scripts\activate.bat
) ELSE (
    echo [WARN] No se encontro .venv\Scripts\activate.bat
    echo Asegurate de haber credo el entorno virtual.
)

echo [INFO] Ejecutando start_app.py...
python start_app.py
pause
