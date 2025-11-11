# Script mejorado para preparar y construir la aplicación Cordova
# Requiere: Node.js, Java SDK, Android SDK, Cordova CLI, Gradle

# Configuración de rutas
$ErrorActionPreference = "Stop"
$baseDir = "C:\xampp\htdocs\proyectoJardin-main"
$wwwSource = "$baseDir\html"
$cssSource = "$baseDir\css"
$jsSource = "$baseDir\js"
$imgSource = "$baseDir\img"
$bootstrapSource = "$baseDir\bootstrap"
$cordovaDir = "$baseDir\cordova"
$wwwDest = "$cordovaDir\www"

# Lista de extensiones permitidas para copiar
$allowedExtensions = @("*.html", "*.js", "*.css", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.woff", "*.woff2", "*.ttf", "*.eot", "*.ico", "*.json")

# Función para verificar si un comando existe
function Test-Command($command) {
    try { Get-Command $command -ErrorAction Stop; return $true }
    catch { return $false }
}

Write-Host "Verificando requisitos..." -ForegroundColor Yellow
$missingTools = @()
foreach ($req in $requirements) {
    if (-not (Test-Command $req.Name)) {
        $missingTools += $req.Desc
    }
}

if ($missingTools.Count -gt 0) {
    Write-Host "`nFaltan las siguientes herramientas:" -ForegroundColor Red
    $missingTools | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    Write-Host "`nPor favor, instala las herramientas faltantes y vuelve a ejecutar este script." -ForegroundColor Yellow
    exit 1
}

# Limpiar y crear directorio www
Write-Host "`nPreparando directorios..." -ForegroundColor Yellow
if (Test-Path $wwwDest) {
    Remove-Item $wwwDest -Recurse -Force
}
New-Item -ItemType Directory -Path $wwwDest -Force | Out-Null

# Crear estructura de directorios en www
$directories = @("css", "js", "img", "bootstrap")
foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path "$wwwDest\$dir" -Force | Out-Null
}

# Función para copiar archivos con manejo de errores
function Copy-Files {
    param (
        [string]$source,
        [string]$destination,
        [string]$description
    )
    
    Write-Host "Copiando $description..." -ForegroundColor Yellow
    if (Test-Path $source) {
        try {
            Copy-Item -Path "$source\*" -Destination $destination -Recurse -Force -ErrorAction Stop
        }
        catch {
            $errorMessage = $_.Exception.Message
            Write-Host "Error copiando $description`: $errorMessage" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Advertencia: No se encuentra el directorio fuente $source" -ForegroundColor Yellow
    }
}

# Copiar archivos
Copy-Files -source $wwwSource -destination $wwwDest -description "archivos HTML"
Copy-Files -source $cssSource -destination "$wwwDest\css" -description "archivos CSS"
Copy-Files -source $jsSource -destination "$wwwDest\js" -description "archivos JavaScript"
Copy-Files -source $imgSource -destination "$wwwDest\img" -description "imágenes"
Copy-Files -source $bootstrapSource -destination "$wwwDest\bootstrap" -description "archivos Bootstrap"

# Corregir rutas en archivos HTML y JS
Write-Host "Ajustando rutas para versión móvil..." -ForegroundColor Yellow
Get-ChildItem -Path $wwwDest -Filter "*.html" -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace '/proyectoJardin-main/', './' | Set-Content $_.FullName
}
Get-ChildItem -Path $wwwDest -Filter "*.js" -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace '/proyectoJardin-main/', './' | Set-Content $_.FullName
}

# Configurar Cordova
Write-Host "`nConfigurando proyecto Cordova..." -ForegroundColor Yellow
Set-Location $cordovaDir

# Verificar si ya existe la plataforma Android
$platformsExists = Test-Path "$cordovaDir\platforms\android"
if (-not $platformsExists) {
    Write-Host "Agregando plataforma Android..." -ForegroundColor Yellow
    cordova platform add android
}

# Instalar plugins necesarios
Write-Host "`nInstalando plugins..." -ForegroundColor Yellow
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-network-information

# Construir APK
Write-Host "`nConstruyendo APK..." -ForegroundColor Yellow
cordova build android

if ($LASTEXITCODE -eq 0) {
    $apkPath = "$cordovaDir\platforms\android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        Write-Host "`n¡Construcción exitosa!" -ForegroundColor Green
        Write-Host "APK generado en: $apkPath" -ForegroundColor Green
    }
    else {
        Write-Host "`nNo se encontró el archivo APK en la ruta esperada." -ForegroundColor Red
    }
}
else {
    Write-Host "`nError durante la construcción." -ForegroundColor Red
}

Set-Location $baseDir