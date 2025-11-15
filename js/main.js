const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Always load via HTTP server since we need PHP
  const localUrl = 'http://localhost/proyectoJardin/html/index.html';
  console.log('Loading app via HTTP:', localUrl);
  
  win.loadURL(localUrl, { extraHeaders: 'Cache-Control: no-cache' }).catch(err => {
    console.error('Error loading URL', localUrl, err);
    win.webContents.loadURL(`data:text/html,
      <h1>Error al iniciar la aplicación</h1>
      <p>No se pudo cargar la aplicación. Por favor:</p>
      <ol>
        <li>Verifica que XAMPP está corriendo (Apache y MySQL)</li>
        <li>Comprueba que la carpeta del proyecto está en <code>C:\\xampp\\htdocs\\proyectoJardin</code></li>
        <li>Abre <a href="http://localhost/proyectoJardin/html/index.html">http://localhost/proyectoJardin/html/index.html</a> en el navegador para probar si el servidor funciona</li>
      </ol>
    `);
  });

  // DevTools disabled in production
  // win.webContents.openDevTools();
}

app.whenReady().then(async () => {
  // Limpiar la caché antes de crear la ventana
  await session.defaultSession.clearCache();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // On Windows & Linux quit the app when all windows are closed
  if (process.platform !== 'darwin') app.quit();
});
