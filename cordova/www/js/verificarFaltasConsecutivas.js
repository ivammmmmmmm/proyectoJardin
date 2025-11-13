/**
 * verificarFaltasConsecutivas.js — Helper para verificar faltas consecutivas en Cordova
 * 
 * Uso:
 *   verificarFaltasConsecutivas(idAlumno).then(resultado => {
 *       if (resultado.esCritico) {
 *           console.log(resultado.mensaje); // "⚠️ 5 faltas seguidas"
 *       }
 *   });
 */

async function verificarFaltasConsecutivas(idAlumno) {
    try {
        const apiUrl = getApiUrl('verificarFaltasConsecutivas.php');
        
        const response = await fetch(`${apiUrl}?idAlumno=${idAlumno}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Error desconocido');
        }
        
        return data;
    } catch (error) {
        console.error('Error al verificar faltas consecutivas:', error);
        return {
            success: false,
            esCritico: false,
            faltasConsecutivas: 0,
            mensaje: '',
            error: error.message
        };
    }
}

/**
 * Mostrar alerta si hay faltas consecutivas críticas
 */
async function mostrarAlertaFaltasConsecutivas(idAlumno) {
    const resultado = await verificarFaltasConsecutivas(idAlumno);
    
    if (resultado.esCritico) {
        // Crear alerta visual
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            <strong>⚠️ Advertencia:</strong> ${resultado.mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insertar en el formulario si existe
        const form = document.getElementById('formAgregarFalta');
        if (form) {
            form.insertAdjacentElement('afterbegin', alertDiv);
        }
        
        return true;
    }
    
    return false;
}
