App Cordova — Faltas (preparada para dominio y pruebas locales)

Resumen
- Esta copia en `cordova/www` está preparada para ejecutar solo las funciones de registrar y modificar faltas.
- Las llamadas al backend usan una base configurable en `js/config.js` (variable REMOTE_API_BASE).

Modos disponibles
- local: usa rutas relativas (../php/) — ideal si corres el proyecto en tu PC con XAMPP (http://localhost/...)
- remote: usa la URL REMOTE_API_BASE — ideal cuando tengas un dominio o un servidor accesible desde el móvil
- auto: el modo por defecto; selecciona local cuando ejecutas en navegador (localhost) y remote cuando ejecutas desde file:// (dispositivo)

Cómo configurar el dominio (cuando lo tengas)
1. Abre `cordova/www/js/config.js`.
2. Reemplaza la constante REMOTE_API_BASE por la URL pública de tu servidor, por ejemplo:
   const REMOTE_API_BASE = 'https://miservidor.com/proyectoJardin-main/php/';
3. Desde la página `index.html` (en el entorno donde pruebes) abre el panel inferior derecho y pulsa "Cambiar" hasta que el modo quede en `remote`.
   También puedes ejecutar en la consola del navegador:
   localStorage.setItem('API_MODE','remote');
   location.reload();

Pruebas locales con XAMPP (PC)
1. Asegúrate de que Apache y MySQL están corriendo (XAMPP).
2. Coloca el proyecto en htdocs (ya está en `c:\xampp\htdocs\proyectoJardin-main`).
3. Abre en el navegador: http://localhost/proyectoJardin-main/html/aniadirFaltas.html para probar en escritorio.
4. En la app Cordova (www apuntando a archivos locales) puedes usar el modo `local` para que las llamadas se dirijan a `../php/`.

Probar en un dispositivo Android (Android Studio / Cordova)
Opción A (con Cordova CLI)
- Conecta tu móvil a la misma red que tu servidor (o usa el dominio público si lo tienes).
- En la raíz del proyecto ejecuta (requiere Cordova instalado):
  cordova platform add android
  cordova prepare android
  cordova run android --device
- Si quieres apuntar a un servidor de la LAN (PC), en `config.js` puedes poner REMOTE_API_BASE = 'http://192.168.0.16/proyectoJardin-main/php/' y usar modo `remote`.

Opción B (Android Studio)
- Ejecuta `cordova build android` o abre la carpeta `platforms/android` con Android Studio.
- Instala en tu dispositivo desde Android Studio (Run).
- Asegúrate de que el dispositivo y el servidor estén en la misma red o que el dominio esté accesible.

CORS y seguridad
- Si usas `remote` con una URL distinta, asegúrate de permitir CORS en tu servidor. En PHP puedes añadir (temporalmente):
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
- Instala en la app Cordova el plugin whitelist:
  cordova plugin add cordova-plugin-whitelist
- Añade en `config.xml` las entradas:
  <access origin="*" />
  <allow-navigation href="*" />

Notas finales
- Por ahora los scripts de faltas ya usan la función `getApiUrl(endpoint)` y la global `API_BASE` para construir llamadas.
- Si quieres, puedo (a) forzar todos los scripts restantes a usar `getApiUrl`, (b) agregar un endpoint /ping para detectar disponibilidad, o (c) automatizar un fallback remoto->local si falla la llamada.

Si quieres que configure REMOTE_API_BASE ahora, pásame la URL (incluye https://) y la seteo en `js/config.js` y te dejo todo listo para compilar el APK.