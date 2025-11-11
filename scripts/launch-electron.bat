@echo off
REM Consolidated launcher for Electron GUI
pushd "%~dp0.."

REM Create a log file to capture output for debugging
set LOGFILE=%TEMP%\proyectoJardin_launch_log.txt
echo Launch started at %DATE% %TIME%>"%LOGFILE%"

REM Ensure a writable user-data directory to avoid cache permission errors
set USER_DATA_DIR=%TEMP%\proyectoJardin_electron_profile
if not exist "%USER_DATA_DIR%" mkdir "%USER_DATA_DIR%"

echo Using user-data-dir=%USER_DATA_DIR%>>"%LOGFILE%" 2>&1

REM Prefer packaged electron.exe if present
if exist "node_modules\electron\dist\electron.exe" (
    start "" "%~dp0..\node_modules\electron\dist\electron.exe" . --user-data-dir "%USER_DATA_DIR%"
    goto :eof
)

REM Fallback to electron.cmd in .bin
if exist "node_modules\.bin\electron.cmd" (
    start "" "%~dp0..\node_modules\.bin\electron.cmd" . --user-data-dir "%USER_DATA_DIR%"
    goto :eof
)

REM Final fallback to npx (requires npm in PATH)
echo Running npx electron ...>>"%LOGFILE%" 2>&1
start "" cmd /c "npx electron . --user-data-dir \"%USER_DATA_DIR%\" >>\"%LOGFILE%\" 2>&1"

popd
exit /b 0
