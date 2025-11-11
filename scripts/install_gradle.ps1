# Script para instalar Gradle en Windows
$gradleVersion = "8.4"  # Última versión estable
$downloadUrl = "https://services.gradle.org/distributions/gradle-${gradleVersion}-bin.zip"
$gradleHome = "C:\Gradle"
$gradleZip = "C:\Gradle\gradle.zip"

# Crear directorio para Gradle
Write-Host "Creando directorio Gradle..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $gradleHome | Out-Null

# Descargar Gradle
Write-Host "Descargando Gradle ${gradleVersion}..." -ForegroundColor Yellow
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $downloadUrl -OutFile $gradleZip

# Extraer ZIP
Write-Host "Extrayendo Gradle..." -ForegroundColor Yellow
Expand-Archive -Path $gradleZip -DestinationPath $gradleHome -Force
Remove-Item $gradleZip

# Encontrar el directorio de Gradle extraído
$gradleDir = Get-ChildItem -Path $gradleHome -Filter "gradle-${gradleVersion}" -Directory | Select-Object -First 1

if ($null -eq $gradleDir) {
    Write-Host "Error: No se pudo encontrar el directorio de Gradle extraído" -ForegroundColor Red
    exit 1
}

# Configurar variable de entorno GRADLE_HOME
Write-Host "Configurando variables de entorno..." -ForegroundColor Yellow
$gradleBinPath = $gradleDir.FullName + "\bin"

# Actualizar variables de entorno para el usuario actual
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$gradleBinPath*") {
    [Environment]::SetEnvironmentVariable("GRADLE_HOME", $gradleDir.FullName, "User")
    [Environment]::SetEnvironmentVariable("Path", $userPath + ";" + $gradleBinPath, "User")
}

Write-Host "`nGradle ${gradleVersion} instalado correctamente!" -ForegroundColor Green
Write-Host "GRADLE_HOME: $($gradleDir.FullName)" -ForegroundColor Green
Write-Host "`nPor favor, reinicia tu terminal para que los cambios surtan efecto." -ForegroundColor Yellow
Write-Host "Después de reiniciar, ejecuta 'gradle --version' para verificar la instalación." -ForegroundColor Yellow