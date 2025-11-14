      document.addEventListener('DOMContentLoaded', async function() {
        try {
          const response = await fetch('/proyectoJardin/php/obtenerTutores.php');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const data = await response.json();
          const container = document.getElementById('tutores-container');
          
          if (data.status === 'success') {
            container.innerHTML = '';

            if (data.tutores.length === 0) {
              container.innerHTML = `
                <div class="alert alert-warning">
                  No hay tutores registrados. <a href="aniadirTutor.html">Añada un tutor primero</a>.
                </div>`;
              return;
            }

            // Crear lista de tutores
            const tutoresList = document.createElement('div');
            tutoresList.className = 'list-group list-group-flush';
            
            data.tutores.forEach(tutor => {
              const tutorDiv = document.createElement('div');
              tutorDiv.className = 'list-group-item border-0 py-2';
              tutorDiv.innerHTML = `
                <div class="form-check d-flex align-items-center">
                  <input class="form-check-input tutor-checkbox me-3" type="checkbox" 
                         name="tutores[]" value="${tutor.id}" id="tutor${tutor.id}">
                  <label class="form-check-label flex-grow-1" for="tutor${tutor.id}">
                    <div class="d-flex justify-content-between align-items-center">
                      <strong>${tutor.nombre}</strong>
                      ${tutor.telefono ? `<span class="badge bg-light text-dark border"><i class="bi bi-telephone"></i> ${tutor.telefono}</span>` : ''}
                    </div>
                  </label>
                </div>`;
              tutoresList.appendChild(tutorDiv);
            });

            container.appendChild(tutoresList);
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

        // Cargar salas
        try {
          const response = await fetch('/proyectoJardin/php/obtenerSalas.php');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const data = await response.json();
          const salaSelect = document.getElementById('sala');
          
          if (data.status === 'success') {
            data.salas.forEach(sala => {
              const option = document.createElement('option');
              option.value = sala.id;
              option.textContent = sala.nombre;
              salaSelect.appendChild(option);
            });
          } else {
            throw new Error(data.message || 'Error al cargar salas');
          }
        } catch (error) {
          console.error('Error al cargar salas:', error);
        }

        // Validar formulario antes de enviar
        const form = document.querySelector('form');
        if (form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const tutoresSeleccionados = document.querySelectorAll('input[name="tutores[]"]:checked');
            console.log('Tutores seleccionados:', tutoresSeleccionados.length);
            
            if (tutoresSeleccionados.length === 0) {
              document.getElementById('error-tutores').style.display = 'block';
              document.getElementById('tutores-container').scrollIntoView({ behavior: 'smooth' });
              return;
            }
            
            // Si hay tutores, enviar el formulario de forma tradicional
            console.log('Enviando formulario con', tutoresSeleccionados.length, 'tutores');
            form.submit();
          });
        }
      });