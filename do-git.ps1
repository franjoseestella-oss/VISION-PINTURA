$ErrorActionPreference = "Stop"

# Script de push via SSH (sin tokens hardcodeados)
# Asegurate de tener la clave SSH configurada: C:/Users/franj/.ssh/id_vision_pintura2

Write-Host "Inicializando push via SSH..."
git remote remove origin 2>$null
git remote add origin git@github.com:franjoseestella-oss/VISION-PINTURA.git
git branch -M main

Write-Host "Pushing via SSH..."
git -c "core.sshCommand=C:/Windows/System32/OpenSSH/ssh.exe -i C:/Users/franj/.ssh/id_vision_pintura2 -o StrictHostKeyChecking=no -o IdentitiesOnly=yes" push -u origin main -f

Write-Host "Done!"
