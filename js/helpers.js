// Función auxiliar para parsear JSON de forma segura
async function parseJSONSafe(response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Error parseando JSON:', text);
        throw new Error(`Error parseando respuesta del servidor: ${text}`);
    }
}

// Función auxiliar para hacer peticiones fetch con manejo de errores
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await parseJSONSafe(response);
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}

// ✅ Función auxiliar para mostrar mensajes de error (corregida)
function mostrarError(mensaje, contenedor = null) {
    console.error(mensaje);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-2';
    errorDiv.textContent = mensaje;

    if (contenedor) {
        // 👇 Agregamos el mensaje al inicio sin borrar el contenido existente
        contenedor.prepend(errorDiv);
    } else {
        document.body.prepend(errorDiv);
    }

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
