// Función para cargar datos en un select
async function cargarSelect(tipo, selectId) {
    try {
        const response = await fetch(`../php/obtenerDatos.php?tipo=${tipo}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const select = document.getElementById(selectId);
        // Limpiar opciones existentes excepto la primera (placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error(`Error cargando ${tipo}:`, error);
    }
}

// Cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos para todos los select
    cargarSelect('alumnos', 'selectAlumno');
    cargarSelect('tutores', 'selectTutor');
    cargarSelect('docentes', 'selectDocente');
    cargarSelect('salas', 'selectSala');

    // Manejar el envío del formulario
    document.querySelector('form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(this);
            const response = await fetch('../php/aniadirRegistro.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Registro guardado correctamente');
                window.location.href = 'verRegistros.html';
            } else {
                throw new Error(result.message || 'Error al guardar el registro');
            }
        } catch (error) {
            alert('Error: ' + error.message);
            console.error('Error completo:', error);
        }
    });
});