# Proyecto Jardín

Aplicación web para la gestión integral de información de un jardín de infantes, incluyendo gestión de alumnos, docentes, tutores, faltas y registros.

## 📋 Descripción

Este proyecto es una solución completa para administrar:
- **Alumnos**: Gestión de estudiantes y su información
- **Docentes**: Registro y administración de personal docente
- **Tutores**: Asignación y seguimiento de tutores
- **Faltas**: Control y registro de inasistencias
- **Registros**: Documentación de eventos y actividades
- **Estadísticas**: Análisis de datos de faltas y salas

## 🚀 Instalación

### Requisitos previos
- PHP 7.4+
- MySQL/MariaDB
- Node.js (opcional, para proyectos con Electron/Cordova)
- XAMPP o similar stack LAMP

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/ivammmmmmmm/proyectoJardin.git
cd proyectoJardin
```

2. **Instalar dependencias grandes (si usas Node.js)**
```bash
npm install
```

3. **Configurar la base de datos**
   - Importar archivo SQL desde la carpeta `/sql`
   - Configurar credenciales en `/php/conexion.php`

4. **Configurar el servidor web**
   - Coloca la carpeta en `htdocs` de XAMPP
   - Accede a `http://localhost/proyectoJardin-main`

## 📁 Estructura del Proyecto

```
proyectoJardin/
├── bootstrap/              # Framework Bootstrap
├── bootstrap-icons-1.13.1/ # Iconografía
├── css/                    # Estilos personalizados
├── html/                   # Archivos HTML
├── js/                     # Scripts JavaScript
├── php/                    # Backend PHP
├── sql/                    # Scripts de base de datos
├── cordova/                # Configuración Cordova (móvil)
├── docs/                   # Documentación
├── img/                    # Imágenes
├── json/                   # Archivos JSON
├── scripts/                # Scripts auxiliares
└── vbs/                    # Scripts VBS
```

## 🔧 Configuración

### Conexión a Base de Datos
Edita `/php/conexion.php` con tus credenciales:
```php
$host = 'localhost';
$usuario = 'tu_usuario';
$password = 'tu_password';
$base_datos = 'tu_base_datos';
```

## 📦 Archivos Ignorados

Los siguientes archivos/carpetas NO se sincronizan en GitHub (ver `.gitignore`):
- `node_modules/` - Dependencias de Node.js
- `electron/` - Archivos de Electron
- `.env` - Variables de entorno
- Archivos de sistema operativo

### 🔄 Cómo instalar los archivos grandes después de clonar

Después de clonar el repositorio, debes instalar las dependencias que no están sincronizadas:

1. **Instalar dependencias de Node.js**
```bash
npm install
```

2. **Si usas Electron (desarrollo de aplicaciones de escritorio)**
```bash
npm install electron --save-dev
```

3. **Si usas Cordova (desarrollo de aplicaciones móviles)**
```bash
npm install -g cordova
cd cordova
cordova prepare
```

4. **Si tienes un archivo `package.json`, ejecuta:**
```bash
npm install
```
Esto instalará automáticamente todas las dependencias listadas en `package.json`

## 🔐 Seguridad

- Las credenciales sensibles se configuran en archivos locales (no sincronizados)
- No subas archivos `.env` o archivos con contraseñas
- Usa variables de entorno para datos sensibles

## 📝 Notas

- Consulta `/docs/bitacora.txt` para el historial de cambios
- Ver `/docs/cordova_guide.txt` para instrucciones de desarrollo móvil
- Ver `/docs/chartjs_sheetjs_guide.txt` para documentación de gráficos


**Última actualización**: Noviembre 2025
