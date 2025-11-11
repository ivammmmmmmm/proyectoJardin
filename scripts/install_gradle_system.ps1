# Script para instalar Gradle usando un instalador MSI
$gradleVersion = "8.4"
$downloadUrl = "https://downloads.gradle-dn.com/distributions/gradle-$gradleVersion-all.zip"
$installPath = "C:\Gradle"
$gradleZip = "C:\Gradle\gradle.zip"

Write-Host "Configurando Gradle..." -ForegroundColor Yellow

# Crear directorio si no existe
if (-not (Test-Path $installPath)) {
    New-Item -ItemType Directory -Force -Path $installPath | Out-Null
}

# Descargar Gradle
Write-Host "Descargando Gradle ${gradleVersion}..." -ForegroundColor Yellow
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $downloadUrl -OutFile $gradleZip

# Extraer ZIP
Write-Host "Extrayendo Gradle..." -ForegroundColor Yellow
Expand-Archive -Path $gradleZip -DestinationPath $installPath -Force
Remove-Item $gradleZip -Force

# Configurar variables de entorno a nivel sistema
Write-Host "Configurando variables de entorno..." -ForegroundColor Yellow
$gradleHome = Join-Path $installPath "gradle-$gradleVersion"
$gradleBin = Join-Path $gradleHome "bin"

# Función para agregar al Path
function Add-ToPath {
    param (
        [string]$Path
    )
    $systemPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($systemPath -notlike "*$Path*") {
        [Environment]::SetEnvironmentVariable("Path", "$systemPath;$Path", "Machine")
        $env:Path = "$env:Path;$Path"
    }
}

# Establecer GRADLE_HOME y actualizar PATH
[Environment]::SetEnvironmentVariable("GRADLE_HOME", $gradleHome, "Machine")
Add-ToPath $gradleBin

# Crear un archivo .bat para facilitar el uso de Gradle
$batchContent = @"
@echo off
set GRADLE_HOME=$gradleHome
set PATH=%GRADLE_HOME%\bin;%PATH%
"@

$batchFile = "C:\Windows\System32\gradle-env.bat"
$batchContent | Out-File -FilePath $batchFile -Encoding ASCII

Write-Host "`nGradle $gradleVersion instalado en: $gradleHome" -ForegroundColor Green
Write-Host "Variables de entorno configuradas:" -ForegroundColor Green
Write-Host "GRADLE_HOME = $gradleHome" -ForegroundColor Green
Write-Host "PATH actualizado con: $gradleBin" -ForegroundColor Green

Write-Host "`nPara activar Gradle en esta sesión, ejecuta:" -ForegroundColor Yellow
Write-Host "C:\Windows\System32\gradle-env.bat" -ForegroundColor Yellow

Write-Host "`nPara verificar la instalación después, ejecuta:" -ForegroundColor Yellow
Write-Host "gradle --version" -ForegroundColor Yellow