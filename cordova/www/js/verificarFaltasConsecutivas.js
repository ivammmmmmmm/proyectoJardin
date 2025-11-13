// Función para verificar faltas consecutivas
async function verificarFaltasConsecutivas(idAlumno) {
    try {
        const response = await fetch('./php/verificarFaltasConsecutivas.php?idAlumno=' + idAlumno);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error al verificar faltas consecutivas:', error);
        return null;
    }
}

// Función para mostrar alerta de faltas consecutivas al lado del nombre
async function mostrarAlertaFaltasConsecutivas(idAlumno) {
    try {
        const result = await verificarFaltasConsecutivas(idAlumno);
        
        if (result && result.esCritico) {
            // Buscar el elemento que contiene el nombre del alumno
            const alumnoCheckbox = document.getElementById(`alumno_${idAlumno}`);
            if (alumnoCheckbox) {
                const alumnoDiv = alumnoCheckbox.closest('.d-flex');
                if (alumnoDiv) {
                    // Crear el badge de alerta
                    const alertBadge = document.createElement('span');
                    alertBadge.className = 'badge bg-danger ms-2';
                    alertBadge.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> ${result.faltasConsecutivas} faltas`;
                    alertBadge.title = `Este alumno tiene ${result.faltasConsecutivas} faltas consecutivas sin justificar`;
                    
                    // Insertar el badge después del nombre
                    const nombreSpan = alumnoDiv.querySelector('span');
                    if (nombreSpan) {
                        nombreSpan.appendChild(alertBadge);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error al mostrar alerta:', error);
    }
}
