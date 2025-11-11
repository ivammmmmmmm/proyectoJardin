# Copia los assets web al directorio Android/cordova-app/www
param(
    [string]$ProjectRoot = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)\.."
)

$src = Resolve-Path "$PSScriptRoot\.."
$root = (Get-Item $src).FullName
$dest = Join-Path $root 'Android\www'

Write-Host "Preparando $dest ..."

# Crear destino
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Path $dest | Out-Null

# Carpetas a copiar (ajusta según tu proyecto)
$folders = @('html','css','js','img','bootstrap','bootstrap-icons-1.13.1','json')
foreach ($f in $folders) {
    $sourceFolder = Join-Path $root $f
    if (Test-Path $sourceFolder) {
        Write-Host "Copiando $f..."
        Copy-Item -Recurse -Force $sourceFolder -Destination (Join-Path $dest $f)
    } else {
        Write-Host "No existe: $sourceFolder"
    }
}

# Copiar archivos sueltos
$files = @('index.html')
foreach ($file in $files) {
    $s = Join-Path $root $file
    if (Test-Path $s) { Copy-Item -Force $s -Destination $dest }
}

Write-Host "Preparación completada. Ahora entra en 'Android' y crea el proyecto Cordova (cordova create .) y añade la plataforma android"
