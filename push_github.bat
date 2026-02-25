@echo off
cd /d "%~dp0"

echo =========================================
echo  Subiendo a GitHub via SSH: VISION-PINTURA
echo =========================================
echo.

echo [1/4] Limpiando config local acumulado...
git config --local --unset-all credential.helper >nul 2>&1
git config --local --unset http.https://github.com.extraheader >nul 2>&1

echo [2/4] Configurando remote SSH...
git remote remove origin 2>nul
git remote add origin git@github.com:franjoseestella-oss/VISION-PINTURA.git

echo [3/4] Ajustando rama a main...
git branch -M main

echo [4/4] Haciendo push via SSH (clave sin passphrase)...
git -c core.sshCommand="C:/Windows/System32/OpenSSH/ssh.exe -i C:/Users/franj/.ssh/id_vision_pintura2 -o StrictHostKeyChecking=no -o IdentitiesOnly=yes" push -u origin main

echo.
if %ERRORLEVEL% == 0 (
    echo  ^>^> EXITO: https://github.com/franjoseestella-oss/VISION-PINTURA
) else (
    echo  ^>^> ERROR. Codigo: %ERRORLEVEL%
)
echo.
pause
