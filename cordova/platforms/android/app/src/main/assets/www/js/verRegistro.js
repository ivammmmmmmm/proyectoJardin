// URL base para las peticiones API
const API_BASE = 'http://localhost/proyectoJardin-main';

// Esperar a que el DOM esté completamente cargado
window.addEventListener('load', function() {
    console.log('DOM y recursos cargados completamente');
    initializeRegistros();
});

function initializeRegistros() {
    // Obtener referencias a los elementos del DOM
    const accordion = document.querySelector('#accordionRegistros');
    const searchInput = document.querySelector('#buscarRegistro');
    
    // Verificar que los elementos existan
    if (!accordion) {
        console.error('Error: No se encontró el elemento #accordionRegistros');
        return;
    }

    // Configurar el buscador si existe
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const items = accordion.querySelectorAll('.accordion-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // Cargar los registros
    loadRegistros();
}

function loadRegistros() {
    const accordion = document.querySelector('#accordionRegistros');
    
    // Verificar nuevamente que el elemento exista
    if (!accordion) {
        console.error('Error: No se encontró el elemento #accordionRegistros al cargar registros');
        return;
    }

    // Mostrar mensaje de carga
    accordion.innerHTML = `
        <div class="alert alert-info">
            <i class="bi bi-hourglass-split"></i> Cargando registros...
        </div>
    `;

    // Realizar la petición al servidor
    fetch(`${API_BASE}/php/verRegistros.php`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Limpiar el contenedor
            accordion.innerHTML = '';
            
            // Verificar que tengamos datos válidos
            const registros = Array.isArray(data) ? data : [];
            
            if (registros.length === 0) {
                accordion.innerHTML = `
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> No hay registros disponibles.
                    </div>
                `;
                return;
            }

            // Crear elementos para cada registro
            registros.forEach((registro, index) => {
                const item = document.createElement('div');
                item.className = 'accordion-item bg-dark border-secondary';
                item.innerHTML = `
                    <h2 class="accordion-header" id="heading${index}">
                        <button class="accordion-button collapsed bg-dark text-light" type="button" 
                                data-bs-toggle="collapse" data-bs-target="#collapse${index}" 
                                aria-expanded="false" aria-controls="collapse${index}">
                            <strong>${formatDate(registro.fecha)}</strong> - ${registro.alumno_nombre || 'Sin nombre'}
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse" 
                         aria-labelledby="heading${index}" data-bs-parent="#accordionRegistros">
                        <div class="accordion-body text-light">
                            <p><strong>Tutor:</strong> ${registro.tutor_nombre || 'No asignado'}</p>
                            <p><strong>Docente:</strong> ${registro.docente_nombre || 'No asignado'}</p>
                            <p><strong>Sala:</strong> ${registro.sala_nombre || 'No asignada'}</p>
                            <p><strong>Medio Utilizado:</strong> ${registro.medioUtilizado || 'No especificado'}</p>
                            <p><strong>Causa:</strong> ${registro.causa || 'No especificada'}</p>
                            <hr class="border-secondary">
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-warning btn-sm" onclick="editarRegistro(${registro.id})">
                                    <i class="bi bi-pencil"></i> Editar
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="eliminarRegistro(${registro.id})">
                                    <i class="bi bi-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                accordion.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error al cargar registros:', error);
            accordion.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error al cargar los registros: ${error.message}
                </div>
            `;
        });
}

function formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function editarRegistro(id) {
    if (!id) {
        console.error('ID de registro no válido');
        return;
    }
    window.location.href = `${API_BASE}/html/modificarRegistros.html?id=${id}`;
}

function eliminarRegistro(id) {
    if (!id) {
        console.error('ID de registro no válido');
        return;
    }

    if (!confirm('¿Está seguro de que desea eliminar este registro?')) {
        return;
    }

    fetch(`${API_BASE}/php/eliminarRegistro.php?id=${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Recargar la lista de registros
            loadRegistros();
        } else {
            throw new Error(data.error || 'Error al eliminar el registro');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar el registro: ' + error.message);
    });
}
