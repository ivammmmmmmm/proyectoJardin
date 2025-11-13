  // Versión de script para depuración: si sigue apareciendo el error, comprueba este mensaje en la consola
  console.log('modificarAlumno.js cargado - versión segura ' + new Date().toISOString());

  /**
       * Array global que almacena todos los alumnos cargados del servidor.
       * Se utiliza para el filtrado y búsqueda sin necesidad de recargar del servidor.
       */
      let todosLosAlumnos = [];

      /**
       * Filtra la lista de alumnos según el texto de búsqueda.
       * @param {string} terminoBusqueda - Texto ingresado por el usuario para filtrar
       * @returns {Array} Lista de alumnos que coinciden con el término de búsqueda
       */
      function filtrarAlumnos(terminoBusqueda) {
        const termino = (terminoBusqueda || '').toString().toLowerCase();
        return todosLosAlumnos.filter(alumno => {
          const nombre = `${(alumno && alumno.nombre) || ''} ${(alumno && alumno.apellido) || ''}`.toLowerCase();
          const dni = ((alumno && alumno.dni) || '').toString().toLowerCase();
          return nombre.includes(termino) || dni.includes(termino);
        });
      }

      /**
       * Muestra la lista de alumnos en la interfaz.
       * Crea elementos HTML dinámicamente para cada alumno incluyendo:
       * - Información básica (nombre, apellido, ID)
       * - Botones de acción (eliminar, modificar, ver info)
       * - Panel colapsable con información detallada
       * 
       * @param {Array} alumnos - Lista de alumnos a mostrar
       */
      function mostrarAlumnos(alumnos) {
        // Obtiene el contenedor principal de la lista
        const listaAlumnos = document.getElementById('alumnosLista');
        // Limpia el contenedor antes de agregar nuevos elementos
        listaAlumnos.innerHTML = '';
        
        // Actualiza el contador de resultados mostrados
        document.getElementById('contadorResultados').textContent = 
          `Mostrando ${alumnos.length} ${alumnos.length === 1 ? 'alumno' : 'alumnos'}`; 

        if (alumnos.length === 0) {
          listaAlumnos.innerHTML = '<div class="alert alert-info">No se encontraron alumnos que coincidan con la búsqueda.</div>';
          return;
        }

        alumnos.forEach((alumno, idx) => {
          const item = document.createElement('div');
          item.className = 'list-group-item bg-dark text-light mb-2';

          item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="bi bi-person fs-3 me-3 text-light"></i>
                <div>
                  <h6 class="mb-0 text-light">${alumno.nombre} ${alumno.apellido}</h6>
                  <small class="text-light">ID: ${alumno.id}</small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-danger btn-sm" onclick="eliminarAlumno('${alumno.id}')">Eliminar</button>
                <button class="btn btn-secondary btn-sm" onclick="modificarAlumno('${alumno.id}')">Modificar</button>
                <button class="btn btn-info btn-sm text-white"
                        data-bs-toggle="collapse"
                        data-bs-target="#infoAlumno${idx}"
                        aria-expanded="false"
                        aria-controls="infoAlumno${idx}">
                  Ver Info.
                </button>
              </div>
            </div>

            <!-- Info oculta -->
            <div class="collapse mt-3" id="infoAlumno${idx}" data-bs-parent="#alumnosLista">
              <div class="p-3 bg-secondary rounded">
                <p><strong>DNI:</strong> ${alumno.dni}</p>
                <p><strong>Dirección:</strong> ${alumno.direccion}</p>
                <p><strong>Fecha de Nacimiento:</strong> ${alumno.fecha_nacimiento}</p>
                <p><strong>Edad:</strong> ${alumno.edad} años</p>

                </div>
            </div>
          `;
          listaAlumnos.appendChild(item);
        });
      }

      /**
       * Inicialización cuando el DOM está listo.
       * Configura el buscador y carga los datos iniciales de alumnos.
       */
      document.addEventListener('DOMContentLoaded', function() {
        const buscador = document.getElementById('buscador');
        if (buscador) {
          let debounceTimer = null;
          buscador.addEventListener('input', function (e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              const termino = e.target.value || '';
              const resultados = filtrarAlumnos(termino);
              mostrarAlumnos(resultados);
            }, 120);
          });
        } else {
          console.debug('modificarAlumno.js: #buscador no presente en esta página');
        }

        // Cargar alumnos desde el servidor y mostrarlos
        fetch('./php/verAlumno.php?ajax=1')
          .then(response => response.json())
          .then(data => {
            todosLosAlumnos = data; // Guardar todos los alumnos
            mostrarAlumnos(todosLosAlumnos); // Mostrar inicialmente todos
          })
          .catch(error => {
            const lista = document.getElementById('alumnosLista');
            if (lista) lista.innerHTML = '<div class="alert alert-danger">Error al cargar los alumnos.</div>';
            console.error('Error:', error);
          });
      });

      /**
       * Elimina un alumno del sistema.
       * Muestra un diálogo de confirmación y realiza la petición al servidor.
       * Recarga la página si la eliminación es exitosa.
       * 
       * @param {string} id - ID del alumno a eliminar
       */
      function eliminarAlumno(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
          // Enviar id tanto en query string como en body (POST) para compatibilidad
          const fd = new FormData();
          fd.append('id', id);
          fetch(`./php/eliminar.php?id=${encodeURIComponent(id)}`, {
            method: 'POST',
            body: fd
          })
          .then(async response => {
            const text = await response.text();
            try {
              const data = JSON.parse(text);
              if (data.success) {
                location.reload();
              } else {
                alert('Error al eliminar el alumno: ' + (data.message || JSON.stringify(data)));
              }
            } catch (e) {
              // Si no es JSON, mostrar cuerpo o recargar si status OK
              if (response.ok) location.reload();
              else alert('Error del servidor al eliminar: ' + text);
            }
          })
          .catch(err => {
            console.error('Eliminar alumno error:', err);
            alert('Error al conectar con el servidor');
          });
        }
      }
      

      /**
       * Abre el modal de modificación y carga los datos del alumno.
       * Rellena el formulario con la información actual y carga los tutores asociados.
       * 
       * @param {string} id - ID del alumno a modificar
       */
      function modificarAlumno(id) {
        console.log('ID del alumno:', id);
        const alumno = todosLosAlumnos.find(a => a.id.toString() === id.toString());
        console.log('Alumno encontrado:', alumno);
        if (alumno) {
          document.getElementById('alumnoId').value = alumno.id;
          document.getElementById('nombre').value = alumno.nombre;
          document.getElementById('apellido').value = alumno.apellido;
          document.getElementById('dni').value = alumno.dni;
          document.getElementById('direccion').value = alumno.direccion;
          document.getElementById('fecha_nacimiento').value = alumno.fecha_nacimiento;

          // Cargar lista de tutores y marcar los asignados
          cargarTutoresParaAlumno(id).then(() => {
            const modal = new bootstrap.Modal(document.getElementById('modalModificarAlumno'));
            modal.show();
          }).catch(err => {
            console.error('Error cargando tutores para alumno:', err);
            alert('Error al cargar los tutores asignados. Revisa la consola.');
          });
        }
      }

      /**
       * Carga la lista de tutores disponibles y marca los que están asignados al alumno.
       * Realiza dos peticiones en paralelo:
       * 1. Obtiene todos los tutores disponibles
       * 2. Obtiene los tutores asignados al alumno específico
       * 
       * @param {string} alumnoId - ID del alumno para cargar sus tutores
       * @returns {Promise} Promesa que se resuelve cuando se cargan los tutores
       */
      async function cargarTutoresParaAlumno(alumnoId) {
        const tutoresContainer = document.getElementById('tutoresSelect');
        tutoresContainer.innerHTML = `
          <div class="alert alert-info m-3" style="background-color: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: white;">
            <i class="bi bi-hourglass-split me-2"></i>Cargando tutores disponibles...
          </div>
        `;

        try {
          // Obtener lista completa de tutores y tutores asignados
          console.log('Cargando tutores para alumno:', alumnoId);
          
          const [allResp, assignedResp] = await Promise.all([
            fetch('./php/obtenerTutores.php'),
            fetch(`./php/getTutoresAlumno.php?alumnoId=${alumnoId}`)
          ]);

          console.log('Respuesta obtenerTutores:', allResp);
          console.log('Respuesta getTutoresAlumno:', assignedResp);

          if (!allResp.ok) throw new Error('Error cargando lista de tutores');
          if (!assignedResp.ok) {
              const errorText = await assignedResp.text();
              console.error('Error respuesta getTutoresAlumno:', errorText);
              try {
                  const errorJson = JSON.parse(errorText);
                  throw new Error(errorJson.message || errorJson.error || 'Error cargando tutores asignados');
              } catch (e) {
                  throw new Error('Error cargando tutores asignados: ' + errorText);
              }
          }

          const allRespText = await allResp.text();
          const assignedRespText = await assignedResp.text();

          console.log('Texto respuesta obtenerTutores:', allRespText);
          console.log('Texto respuesta getTutoresAlumno:', assignedRespText);

          let tutoresData, assignedData;
          
          try {
            tutoresData = JSON.parse(allRespText);
            console.log('tutoresData parseado:', tutoresData);
          } catch (e) {
            console.error('Error parseando tutoresData:', e);
            throw new Error('Error parseando respuesta de tutores');
          }

          try {
            assignedData = JSON.parse(assignedRespText);
            console.log('assignedData parseado:', assignedData);
          } catch (e) {
            console.error('Error parseando assignedData:', e);
            throw new Error('Error parseando respuesta de tutores asignados');
          }

          if (tutoresData.status === 'error') {
            throw new Error(tutoresData.message || 'Error cargando lista de tutores');
          }
          if (assignedData.status === 'error') {
            throw new Error(assignedData.message || assignedData.error || 'Error cargando tutores asignados');
          }

          const tutores = Array.isArray(tutoresData.tutores) ? tutoresData.tutores : [];
          const assigned = Array.isArray(assignedData.tutores) ? assignedData.tutores : [];
          
          const assignedIds = new Set(assigned.map(t => String(t.id)));

          if (!Array.isArray(tutores)) {
            throw new Error("La respuesta de tutores no es un array válido");
          }

          // Limpiar el contenedor
          tutoresContainer.innerHTML = '';

          if (tutores.length === 0) {
            tutoresContainer.innerHTML = `
              <div class="alert alert-warning m-3">
                No hay tutores registrados. <a href="aniadirTutor.html" class="text-white">Añada un tutor primero</a>.
              </div>`;
            return;
          }

          // Crear lista de tutores
          const tutoresList = document.createElement('div');
          tutoresList.className = 'list-group list-group-flush';
          
          tutores.forEach(tutor => {
            const isSelected = assignedIds.has(String(tutor.id));
            const tutorDiv = document.createElement('div');
            tutorDiv.className = 'list-group-item border-0 py-2';
            tutorDiv.innerHTML = `
              <div class="form-check d-flex align-items-center">
                <input class="form-check-input me-3 tutor-checkbox" type="checkbox" 
                       name="tutores[]" value="${tutor.id}" id="tutor${tutor.id}"
                       ${isSelected ? 'checked' : ''}>
                <label class="form-check-label flex-grow-1" for="tutor${tutor.id}">
                  <div class="d-flex justify-content-between align-items-center">
                    <strong>${tutor.nombre} ${tutor.apellido || ''}</strong>
                    ${tutor.telefono ? `<span class="badge bg-light text-dark border"><i class="bi bi-telephone"></i> ${tutor.telefono}</span>` : ''}
                  </div>
                  ${tutor.dni ? `<small class="text-light opacity-75">DNI: ${tutor.dni}</small>` : ''}
                </label>
              </div>`;
            
            tutorDiv.querySelector('.tutor-checkbox').addEventListener('change', validarTutores);
            tutoresList.appendChild(tutorDiv);
          });

          tutoresContainer.appendChild(tutoresList);
        } catch (error) {
          tutoresContainer.innerHTML = `
            <div class="alert alert-danger m-3">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Error al cargar los tutores: ${error.message}
            </div>
          `;
        }
      }

      /**
       * Valida que se haya seleccionado al menos un tutor.
       * Muestra u oculta el mensaje de error según corresponda.
       * 
       * @returns {boolean} true si hay al menos un tutor seleccionado, false en caso contrario
       */
      function validarTutores() {
        const tutoresSeleccionados = document.querySelectorAll('#tutoresSelect .tutor-checkbox:checked');
        const errorTutores = document.getElementById('error-tutores');
        
        if (tutoresSeleccionados.length === 0) {
          errorTutores.style.display = 'block';
          return false;
        } else {
          errorTutores.style.display = 'none';
          return true;
        }
      }

      function guardarModificacion() {
        if (!validarTutores()) {
          return;
        }

        const btn = document.querySelector('#modalModificarAlumno .btn-primary');
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Guardando...';

        const form = document.getElementById('formModificarAlumno');
        const formData = new FormData(form);

        // Limpiar tutores existentes en FormData y añadir los nuevos
        formData.delete('tutores[]');
        const tutoresSeleccionados = document.querySelectorAll('#tutoresSelect .tutor-checkbox:checked');
        const tutoresIds = Array.from(tutoresSeleccionados).map(checkbox => checkbox.value);
        tutoresIds.forEach(tid => formData.append('tutores[]', tid));

        fetch('./php/modificarAlumno.php', {
          method: 'POST',
          body: formData
        })
        .then(async response => {
          const text = await response.text();
          // Intentar parsear JSON; si falla, mostrar respuesta cruda en consola
          try {
            const data = JSON.parse(text);
            return { ok: response.ok, data };
          } catch (e) {
            console.error('Respuesta no JSON al actualizar alumno:', text);
            throw new Error('Respuesta no JSON del servidor: ' + (text ? text.slice(0, 200) : 'vacía'));
          }
        })
        .then(({ ok, data }) => {
          if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarAlumno'));
            modal.hide();

            // Actualizar la lista de alumnos
            fetch('./php/verAlumno.php?ajax=1')
              .then(response => response.json())
              .then(data => {
                todosLosAlumnos = data;
                mostrarAlumnos(todosLosAlumnos);
              });
          } else {
            alert('Error al modificar el alumno: ' + (data.message || 'Error desconocido'));
         }
        }) 
        .catch(error => {
          console.error('Error al guardar modificación:', error);
          alert('Error al conectar con el servidor. Revisa la consola para más detalles.\n' + error.message);
        })
        .finally(() => {
          btn.disabled = false;
          btn.textContent = originalText;
        });
      }
