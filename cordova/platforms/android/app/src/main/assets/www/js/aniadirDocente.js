document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Cargar las salas al inicio
    await cargarSalas();

    // Agregar el evento submit al formulario
    const form = document.querySelector('form');
    if (!form) {
      console.error('No se encontró el formulario');
      return;
    }

    form.addEventListener('submit', function(e) {
      if (!validarSalasSeleccionadas()) {
        e.preventDefault();
        document.getElementById('error-turno').style.display = 'block';
      }
    });
  } catch (error) {
    console.error('Error en la inicialización:', error);
  }
});

async function cargarSalas() {
  try {
    const container = document.getElementById('salas-container');
    if (!container) {
      console.error('No se encontró el contenedor de salas');
      return;
    }

    container.innerHTML = '<div class="alert alert-info">Cargando salas...</div>';

    const response = await fetch('../php/obtenerSalasConTurnos.php');
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    container.innerHTML = ''; // Limpiar contenedor
    
    // Verificar la estructura de datos
    if (!data || !data.datos || !Array.isArray(data.datos)) {
      throw new Error('Formato de datos inválido');
    }

    const salas = data.datos;
    if (salas.length === 0) {
      container.innerHTML = '<div class="alert alert-warning">No hay salas disponibles</div>';
      return;
    }

    // Agrupar salas por turno
    const salasPorTurno = {};
    salas.forEach(sala => {
      const turnoNombre = sala.turno || 'Sin turno';
      if (!salasPorTurno[turnoNombre]) {
        salasPorTurno[turnoNombre] = [];
      }
      salasPorTurno[turnoNombre].push(sala);
    });

    // Crear checkboxes agrupados por turno
    Object.entries(salasPorTurno).forEach(([turno, salasTurno]) => {
      const turnoDiv = document.createElement('div');
      turnoDiv.className = 'mb-3';
      turnoDiv.innerHTML = `<strong class="d-block mb-2">${turno}</strong>`;

      salasTurno.forEach(sala => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'form-check';
        checkboxDiv.innerHTML = `
          <input class="form-check-input sala-checkbox" type="checkbox" 
                 name="salas[]" value="${sala.id}" 
                 data-turno="${sala.idTurno}" id="sala${sala.id}">
          <label class="form-check-label" for="sala${sala.id}">
            Sala ${sala.nombre}
          </label>
        `;
        turnoDiv.appendChild(checkboxDiv);
      });

      container.appendChild(turnoDiv);
    });

    // Agregar event listeners a los checkboxes
    document.querySelectorAll('.sala-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', validarSalasSeleccionadas);
    });

  } catch (error) {
    console.error('Error en cargarSalas:', error);
    const container = document.getElementById('salas-container');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger">
          Error al cargar las salas: ${error.message}
          <br>
          <button class="btn btn-outline-light mt-2" onclick="cargarSalas()">
            Reintentar
          </button>
        </div>
      `;
    }
  }
}

function validarSalasSeleccionadas() {
  const checkboxesSeleccionados = document.querySelectorAll('.sala-checkbox:checked');
  const turnosSeleccionados = new Set();
  const errorTurno = document.getElementById('error-turno');
  
  checkboxesSeleccionados.forEach(checkbox => {
    turnosSeleccionados.add(checkbox.dataset.turno);
  });

  // Si hay más de un checkbox seleccionado del mismo turno
  if (checkboxesSeleccionados.length > turnosSeleccionados.size) {
    errorTurno.style.display = 'block';
    return false;
  }

  errorTurno.style.display = 'none';
  return true;
}

            // Si hay más de un checkbox seleccionado del mismo turno
            if (checkboxesSeleccionados.length > turnosSeleccionados.size) {
              errorTurno.style.display = 'block';
              return false;
            }

            errorTurno.style.display = 'none';
            return true;
          
