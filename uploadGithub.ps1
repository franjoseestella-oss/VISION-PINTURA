$ErrorActionPreference = "Stop"

# Script para subir a GitHub via SSH (sin tokens hardcodeados)
# Usa la clave SSH configurada en: C:/Users/franj/.ssh/id_vision_pintura2

$repoName = "VISION-PINTURA"
$owner = "franjoseestella-oss"

Write-Host "Configurando remote SSH..."
git remote remove origin 2>$null
git remote add origin "git@github.com:$owner/$repoName.git"
git branch -M main

Write-Host "Pushing via SSH..."
git -c "core.sshCommand=C:/Windows/System32/OpenSSH/ssh.exe -i C:/Users/franj/.ssh/id_vision_pintura2 -o StrictHostKeyChecking=no -o IdentitiesOnly=yes" push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to https://github.com/$owner/$repoName"
}
else {
    Write-Host "Push failed with exit code: $LASTEXITCODE"
}
