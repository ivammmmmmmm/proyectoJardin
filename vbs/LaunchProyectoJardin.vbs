Option Explicit

' Objetos globales
Dim WshShell, fso, http
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Set http = CreateObject("MSXML2.XMLHTTP")

' Determinar rutas relativas al script
Dim scriptPath, scriptDir, projectRoot, jsonDir, xamppDir
scriptPath = WScript.ScriptFullName
scriptDir = fso.GetParentFolderName(scriptPath)
projectRoot = fso.GetParentFolderName(scriptDir)
jsonDir = fso.BuildPath(projectRoot, "json")
xamppDir = "C:\xampp"

' Función para verificar si un puerto está en uso
Function IsPortInUse(port)
    On Error Resume Next
    http.open "HEAD", "http://localhost:" & port, False
    http.send
    IsPortInUse = (http.status = 200)
    On Error GoTo 0
End Function

' Función para esperar a que Apache esté listo
Function WaitForApache()
    Dim attempts, maxAttempts
    attempts = 0
    maxAttempts = 30 ' 30 segundos máximo de espera
    
    Do While attempts < maxAttempts
        If IsPortInUse(80) Then
            WaitForApache = True
            Exit Function
        End If
        WScript.Sleep 1000 ' Esperar 1 segundo
        attempts = attempts + 1
    Loop
    WaitForApache = False
End Function

' Verificar si XAMPP existe
If Not fso.FolderExists(xamppDir) Then
    WScript.Echo "Error: XAMPP no encontrado en " & xamppDir
    WScript.Quit 1
End If

' Intentar iniciar Apache y MySQL si no están corriendo
If Not IsPortInUse(80) Then
    WScript.Echo "Iniciando servicios XAMPP..."
    WshShell.Run """" & xamppDir & "\apache_start.bat""", 0, False
    WshShell.Run """" & xamppDir & "\mysql_start.bat""", 0, False
    
    ' Esperar a que Apache esté listo
    If Not WaitForApache() Then
        WScript.Echo "Error: No se pudo iniciar Apache. Por favor:"
        WScript.Echo "1. Abre XAMPP Control Panel"
        WScript.Echo "2. Inicia Apache y MySQL manualmente"
        WScript.Echo "3. Vuelve a ejecutar este script"
        WScript.Quit 1
    End If
End If

' Verificar que npm está instalado
On Error Resume Next
WshShell.Run "npm -v", 0, True
If Err.Number <> 0 Then
    WScript.Echo "Error: Node.js/npm no está instalado"
    WScript.Echo "Por favor instala Node.js desde https://nodejs.org/"
    WScript.Quit 1
End If
On Error GoTo 0

' Cambiar al directorio json e instalar dependencias si es necesario
WshShell.CurrentDirectory = jsonDir
If Not fso.FileExists(fso.BuildPath(jsonDir, "node_modules\electron\package.json")) Then
    WScript.Echo "Instalando dependencias..."
    WshShell.Run "cmd /c npm install", 1, True
End If

' Iniciar la aplicación silenciosamente
WshShell.Run "cmd /c npm start", 0, False
