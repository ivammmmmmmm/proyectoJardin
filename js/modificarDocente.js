      let todosLosDocentes = []; // Variable global para almacenar todos los docentes

      // Función para cargar los docentes desde el servidor
      async function cargarDocentes() {
        try {
          // Primero verificamos la conexión
          const testConn = await fetchWithErrorHandling('/proyectoJardin/php/test_connection.php');
          console.log('Test de conexión:', testConn);

          // Si la conexión está bien, cargamos los docentes
          const data = await fetchWithErrorHandling('/proyectoJardin/php/verDocentes.php');
          console.log('Docentes cargados:', data);
          
          todosLosDocentes = data.docentes || data;
          if (!Array.isArray(todosLosDocentes)) {
            throw new Error('Formato de respuesta inválido - no es un array de docentes');
          }
          
          mostrarDocentes(todosLosDocentes);
        } catch (error) {
          console.error('Error cargando docentes:', error);
          document.getElementById('docentesLista').innerHTML = 
            `<div class="alert alert-danger">
              Error al cargar los docentes: ${error.message}
              <br>
              <button class="btn btn-outline-danger mt-2" onclick="cargarDocentes()">
                Intentar de nuevo
              </button>
            </div>`;
        }
      }

      function filtrarDocentes(terminoBusqueda) {
        const termino = (terminoBusqueda || '').toString().toLowerCase();
        return (todosLosDocentes || []).filter(docente => {
          if (!docente || typeof docente !== 'object') return false;
          const nombreRaw = (typeof docente.nombre !== 'undefined' && docente.nombre !== null) ? String(docente.nombre) : '';
          const apellidoRaw = (typeof docente.apellido !== 'undefined' && docente.apellido !== null) ? String(docente.apellido) : '';
          const dniRaw = (typeof docente.dni !== 'undefined' && docente.dni !== null) ? String(docente.dni) : '';

          const nombre = (nombreRaw + ' ' + apellidoRaw).toLowerCase();
          const dni = dniRaw.toLowerCase();

          return nombre.includes(termino) || dni.includes(termino);
        });
      }

      function mostrarDocentes(docentes) {
        const listaDocentes = document.getElementById('docentesLista');
        listaDocentes.innerHTML = '';
        
        document.getElementById('contadorResultados').textContent = 
          `Mostrando ${docentes.length} ${docentes.length === 1 ? 'docente' : 'docentes'}`;

        if (docentes.length === 0) {
          listaDocentes.innerHTML = '<div class="alert alert-info">No se encontraron docentes que coincidan con la búsqueda.</div>';
          return;
        }

        docentes.forEach((docente, idx) => {
          const item = document.createElement('div');
          item.className = 'list-group-item bg-dark text-light mb-2';
          item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="bi bi-person fs-3 me-3 text-light"></i>
                <div>
                  <h6 class="mb-0 text-light">${docente.nombre} ${docente.apellido}</h6>
                  <!-- materia removed -->
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-danger btn-sm" onclick="eliminarDocente('${docente.id}')">Eliminar</button>
                <button class="btn btn-secondary btn-sm" onclick="modificarDocente('${docente.id}')">Modificar</button>
                <button class="btn btn-info btn-sm text-white"
                        data-bs-toggle="collapse"
                        data-bs-target="#infoDocente${idx}"
                        aria-expanded="false"
                        aria-controls="infoDocente${idx}">
                  Ver Info.
                </button>
              </div>
            </div>

            <!-- Info oculta -->
            <div class="collapse mt-3" id="infoDocente${idx}" data-bs-parent="#docentesLista">
              <div class="p-3 bg-secondary rounded">
                <p><strong>DNI:</strong> ${docente.dni}</p>
                <p><strong>Teléfono:</strong> ${docente.telefono}</p>
                <p><strong>Dirección:</strong> ${docente.direccion}</p>
                <!-- materia removed from details -->
              </div>
            </div>
          `;
          listaDocentes.appendChild(item);
        });
      }

      document.addEventListener('DOMContentLoaded', function() {
        // Pre-inicializar el modal para evitar problemas de timing
        const modalElement = document.getElementById('modalModificarDocente');
        if (modalElement) {
          new bootstrap.Modal(modalElement);
        }

        // Configurar buscador nativo (debounce)
        const buscador = document.getElementById('buscador');
        if (buscador) {
          let debounceTimer = null;
          buscador.addEventListener('input', function (e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              const termino = e.target.value || '';
              const resultados = filtrarDocentes(termino);
              mostrarDocentes(resultados);
            }, 120);
          });
        } else {
          console.debug('modificarDocente.js: #buscador no presente en esta página');
        }

        // Cargar docentes
        fetch('/proyectoJardin/php/verDocentes.php?ajax=1')
          .then(async response => {
            if (!response.ok) {
              throw new Error('Error en la respuesta del servidor: ' + response.status);
            }
            const text = await response.text();
            console.log('Respuesta de verDocentes:', text); // Para depuración
            
            try {
              const data = JSON.parse(text);
              if (!Array.isArray(data)) {
                throw new Error('Formato de respuesta inválido');
              }
              todosLosDocentes = data;
              mostrarDocentes(todosLosDocentes);
            } catch (e) {
              throw new Error('Error procesando la respuesta: ' + e.message);
            }
          })
          .catch(error => {
            document.getElementById('docentesLista').innerHTML = 
              `<div class="alert alert-danger">
                Error al cargar los docentes: ${error.message}
              </div>`;
            console.error('Error cargando docentes:', error);
          });
      });

      function eliminarDocente(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este docente?')) {
          const fd = new FormData();
          fd.append('id', id);
          fetch(`/proyectoJardin/php/eliminarDocente.php?id=${encodeURIComponent(id)}`, {
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
                alert('Error al eliminar el docente: ' + (data.message || JSON.stringify(data)));
              }
            } catch (e) {
              if (response.ok) location.reload();
              else alert('Error del servidor al eliminar: ' + text);
            }
          })
          .catch(err => {
            console.error('Eliminar docente error:', err);
            alert('Error al conectar con el servidor');
          });
        }
      }

      function modificarDocente(id) {
        console.log('ID del docente:', id);
        const docente = todosLosDocentes.find(d => d.id.toString() === id.toString());
        console.log('Docente encontrado:', docente);
        if (docente) {
          document.getElementById('docenteId').value = docente.id;
          document.getElementById('nombre').value = docente.nombre;
          document.getElementById('apellido').value = docente.apellido;
          document.getElementById('dni').value = docente.dni;
          document.getElementById('telefono').value = docente.telefono;
          document.getElementById('direccion').value = docente.direccion;
          document.getElementById('mail').value = docente.mail || '';
          
          // Cargar salas disponibles y las asignadas al docente
          cargarSalasParaDocente(docente.id);
          
          const modal = new bootstrap.Modal(document.getElementById('modalModificarDocente'));
          modal.show();
        }
      }

      let todasLasSalas = [];
      let salasSeleccionadas = new Set();
      
      async function cargarSalasParaDocente(docenteId) {
        const salasList = document.getElementById('salasList');
        try {
          await mostrarSalas(docenteId);
        } catch (error) {
          console.error('Error al cargar salas:', error);
          salasList.innerHTML = '<div class="alert alert-danger">Error al cargar las salas</div>';
        }
      }

      async function mostrarSalas(docenteId) {
        const salasMañana = document.getElementById('salasMañana');
        const salasTarde = document.getElementById('salasTarde');
        salasMañana.innerHTML = '';
        salasTarde.innerHTML = '';
        
        try {
          // Obtener todas las salas con información de docentes asignados
          const response = await fetch(`/proyectoJardin/php/obtenerSalas.php?tipo=con_docentes`);
          if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.status);
          }
          const text = await response.text();
          console.log('Respuesta del servidor:', text); // Para depuración
          const data = JSON.parse(text);
          
          if (!data || data.status !== 'success' || !Array.isArray(data.salas)) {
            console.error('Respuesta inválida:', data);
            throw new Error('Formato de respuesta inválido');
          }
          
          // Separar salas por turno
          data.salas.forEach(sala => {
            const contenedor = sala.idTurno === 1 ? salasMañana : salasTarde;
            const isAsignadaAEsteDocente = sala.docente_asignado_id === docenteId;
            
            const item = document.createElement('div');
            item.className = 'form-check mb-2';
            item.innerHTML = `
              <input class="form-check-input" type="radio" name="sala_turno_${sala.idTurno}" 
                     value="${sala.id}" id="sala${sala.id}" data-turno="${sala.idTurno}"
                     ${isAsignadaAEsteDocente ? 'checked' : ''}>
              <label class="form-check-label" for="sala${sala.id}">
                ${sala.nombre}
                ${sala.docente_asignado_id && !isAsignadaAEsteDocente ? 
                  `<span class="text-warning">(Asignada a ${sala.docente_nombre} ${sala.docente_apellido})</span>` : ''}
              </label>
            `;
            
            contenedor.appendChild(item);
          });
          
        } catch (error) {
          console.error('Error al cargar salas:', error);
          salasMañana.innerHTML = '<div class="alert alert-danger">Error al cargar las salas</div>';
          salasTarde.innerHTML = '<div class="alert alert-danger">Error al cargar las salas</div>';
        }
      }

      function validarSeleccionSala(checkbox) {
        const turnoSeleccionado = checkbox.dataset.turno;
        const errorDiv = document.getElementById('errorSalas');
        
        if (checkbox.checked) {
          // Verificar si ya hay una sala seleccionada del mismo turno
          const checkboxes = document.querySelectorAll('#salasList input[type="checkbox"]:checked');
          for (const otherCheckbox of checkboxes) {
            if (otherCheckbox !== checkbox && otherCheckbox.dataset.turno === turnoSeleccionado) {
              checkbox.checked = false;
              errorDiv.style.display = 'block';
              return;
            }
          }
        }
        
        errorDiv.style.display = 'none';
        // Actualizar el conjunto de salas seleccionadas
        if (checkbox.checked) {
          salasSeleccionadas.add(parseInt(checkbox.value));
        } else {
          salasSeleccionadas.delete(parseInt(checkbox.value));
        }
      }

      // Nota: la inicialización y el setup del buscador ya se realiza en el DOMContentLoaded
      // definido más arriba; evitamos duplicar listeners o cargar dos veces los datos.

      async function guardarModificacion() {
        try {
          const formData = new FormData(document.getElementById('formModificarDocente'));
          
          // Recolectar las salas seleccionadas de ambos turnos
          const salasMañana = document.querySelector('input[name="sala_turno_1"]:checked');
          const salasTarde = document.querySelector('input[name="sala_turno_2"]:checked');
          
          const salasSeleccionadas = [];
          if (salasMañana) salasSeleccionadas.push(salasMañana.value);
          if (salasTarde) salasSeleccionadas.push(salasTarde.value);
          
          formData.append('salas', JSON.stringify(salasSeleccionadas));
          
          console.log('Enviando datos:', {
            id: formData.get('id'),
            nombre: formData.get('nombre'),
            salas: salasSeleccionadas
          });
          
          const response = await fetch('/proyectoJardin/php/modificarDocente.php', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.status}`);
          }
          
          const text = await response.text();
          console.log('Respuesta del servidor:', text);
          
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            throw new Error('Respuesta del servidor no es JSON válido: ' + text);
          }
          
          if (!data || typeof data.success === 'undefined') {
            throw new Error('Formato de respuesta inválido');
          }
          
          if (data.success) {
            // Cerrar el modal y recargar la lista de docentes
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarDocente'));
            modal.hide();
            await cargarDocentes();
          } else {
            throw new Error(data.message || 'Error desconocido al modificar el docente');
          }
        } catch (error) {
          console.error('Error al guardar:', error);
          alert('Error al modificar el docente: ' + error.message);
        }
      }