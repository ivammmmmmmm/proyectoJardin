document.addEventListener('DOMContentLoaded', async function() {
    // Cargar tutores
    await cargarTutores();

    // Validar formulario antes de enviar
    document.querySelector('form').addEventListener('submit', function(e) {
        if (!validarTutoresSeleccionados()) {
            e.preventDefault();
            document.getElementById('error-tutores').style.display = 'block';
            document.getElementById('tutores-container').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

async function cargarTutores() {
    try {
        const response = await fetch('/proyectoJardin/php/obtenerTutores.php');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (data.status === 'success') {
            const container = document.getElementById('tutores-container');
            container.innerHTML = '';

            if (data.tutores.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-warning">
                        No hay tutores registrados. <a href="aniadirTutor.html">Añada un tutor primero</a>.
                    </div>`;
                return;
            }

            // Crear cuadrícula de tutores
            const grid = document.createElement('div');
            grid.className = 'row g-2';
            
            data.tutores.forEach(tutor => {
                const tutorDiv = document.createElement('div');
                tutorDiv.className = 'col-md-6';
                tutorDiv.innerHTML = `
                    <div class="form-check border rounded p-2">
                        <input class="form-check-input tutor-checkbox" type="checkbox" 
                               name="tutores[]" value="${tutor.id}" id="tutor${tutor.id}">
                        <label class="form-check-label d-block" for="tutor${tutor.id}">
                            <strong>${tutor.nombre}</strong>
                            ${tutor.telefono ? `<br><small class="text-muted">Tel: ${tutor.telefono}</small>` : ''}
                        </label>
                    </div>`;
                grid.appendChild(tutorDiv);
            });

            container.appendChild(grid);

        } else {
            throw new Error(data.message || 'Error al cargar tutores');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('tutores-container').innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los tutores. Por favor, recargue la página.
            </div>`;
    }
}

function validarTutoresSeleccionados() {
    const tutoresSeleccionados = document.querySelectorAll('.tutor-checkbox:checked');
    return tutoresSeleccionados.length > 0;
}