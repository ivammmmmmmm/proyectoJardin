@echo off
REM Hidden launcher that starts Electron GUI without showing a persistent console window.
pushd "%~dp0.."
set USER_DATA_DIR=%TEMP%\proyectoJardin_electron_profile
if not exist "%USER_DATA_DIR%" mkdir "%USER_DATA_DIR%"

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
start "" cmd /c "npx electron . --user-data-dir \"%USER_DATA_DIR%\""

popd
exit /b 0
