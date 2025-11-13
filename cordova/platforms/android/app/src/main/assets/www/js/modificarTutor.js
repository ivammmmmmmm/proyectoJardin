      let todosLosTutores = []; // Variable global para almacenar todos los tutores

      // Helper: parsear JSON de forma segura desde una Response
      async function parseJSONSafe(response) {
        const ct = response.headers.get('content-type') || '';
        const text = await response.text();

        if (!response.ok) {
          // Incluir el cuerpo en el mensaje para facilitar debugging
          const cuerpo = text ? `\nRespuesta del servidor: ${text}` : '';
          throw new Error(`Error del servidor (${response.status})${cuerpo}`);
        }

        if (!ct.includes('application/json')) {
          if (!text) {
            throw new Error('Respuesta vacía del servidor (no JSON)');
          }
          try {
            // A veces servidores devuelven JSON sin header correcto
            return JSON.parse(text);
          } catch (e) {
            console.error('Respuesta no JSON recibida:', text);
            throw new Error('El servidor no devolvió JSON válido');
          }
        }

        // Intentar parsear JSON normalmente
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('Error al parsear JSON:', text);
          throw new Error('Error al procesar la respuesta JSON del servidor');
        }
      }

      function filtrarTutores(terminoBusqueda) {
        const termino = (terminoBusqueda || '').toString().toLowerCase();
        return (todosLosTutores || []).filter(tutor => {
          // ignorar entradas no-objetos
          if (!tutor || typeof tutor !== 'object') return false;

          const nombreRaw = (typeof tutor.nombre !== 'undefined' && tutor.nombre !== null) ? String(tutor.nombre) : '';
          const apellidoRaw = (typeof tutor.apellido !== 'undefined' && tutor.apellido !== null) ? String(tutor.apellido) : '';
          const dniRaw = (typeof tutor.dni !== 'undefined' && tutor.dni !== null) ? String(tutor.dni) : '';

          const nombre = (nombreRaw + ' ' + apellidoRaw).toLowerCase();
          const dni = dniRaw.toLowerCase();

          return nombre.includes(termino) || dni.includes(termino);
        });
      }

      function mostrarTutores(tutores) {
        const listaTutores = document.getElementById('tutoresLista');
        listaTutores.innerHTML = '';
        
        document.getElementById('contadorResultados').textContent = 
          `Mostrando ${tutores.length} ${tutores.length === 1 ? 'tutor' : 'tutores'}`;

        if (tutores.length === 0) {
          listaTutores.innerHTML = '<div class="alert alert-info">No se encontraron tutores que coincidan con la búsqueda.</div>';
          return;
        }

        tutores.forEach((tutor, idx) => {
          const item = document.createElement('div');
          item.className = 'list-group-item bg-dark text-light mb-2';
          item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="bi bi-person fs-3 me-3 text-light"></i>
                <div>
                  <h6 class="mb-0 text-light">${tutor.nombre} ${tutor.apellido}</h6>
                  <small class="text-light">ID: ${tutor.id}</small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-danger btn-sm" onclick="eliminarTutor('${tutor.id}')">Eliminar</button>
                <button class="btn btn-secondary btn-sm" onclick="modificarTutor('${tutor.id}')">Modificar</button>
                <button class="btn btn-info btn-sm text-white"
                        data-bs-toggle="collapse"
                        data-bs-target="#infoTutor${idx}"
                        aria-expanded="false"
                        aria-controls="infoTutor${idx}">
                  Ver Info.
                </button>
              </div>
            </div>

            <!-- Info oculta -->
            <div class="collapse mt-3" id="infoTutor${idx}" data-bs-parent="#tutoresLista">
              <div class="p-3 bg-secondary rounded">
                <p><strong>DNI:</strong> ${tutor.dni}</p>
                <p><strong>Teléfono:</strong> ${tutor.telefono}</p>
                <p><strong>Dirección:</strong> ${tutor.direccion}</p>
                <p><strong>Alumnos a cargo:</strong> ${tutor.alumnos_a_cargo || 'Ninguno'}</p>
              </div>
            </div>
          `;
          listaTutores.appendChild(item);
        });
      }

      document.addEventListener('DOMContentLoaded', function() {
        const buscador = document.getElementById('buscador');
        if (buscador) {
          let debounceTimer = null;
          buscador.addEventListener('input', function (e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              const termino = e.target.value || '';
              const resultados = filtrarTutores(termino);
              mostrarTutores(resultados);
            }, 120);
          });
        } else {
          console.debug('modificarTutor.js: #buscador no presente en esta página');
        }

        // Cargar tutores
        (async () => {
          try {
            const resp = await fetch('./php/verTutores.php?ajax=1');
            const data = await parseJSONSafe(resp);
            todosLosTutores = Array.isArray(data) ? data : (data.tutores || []);
            mostrarTutores(todosLosTutores);
          } catch (error) {
            console.error('Error al cargar tutores:', error);
            const lista = document.getElementById('tutoresLista');
            if (lista) lista.innerHTML = `<div class="alert alert-danger">Error al cargar los tutores: ${error.message}<br><small>Por favor, recargue la página o contacte al administrador.</small></div>`;
          }
        })();
      });

      async function eliminarTutor(id) {
        try {
          // Primero verificar si el tutor es el único para algún alumno
          const verificacionResp = await fetch(`./php/verificarTutorUnico.php?tutorId=${encodeURIComponent(id)}`);
          
          let verificacionData;
          const contentType = verificacionResp.headers.get("content-type");
          
          try {
            if (!verificacionResp.ok) {
              const text = await verificacionResp.text();
              throw new Error(`Error del servidor (${verificacionResp.status}): ${text}`);
            }
            
            if (!contentType || !contentType.includes("application/json")) {
              const text = await verificacionResp.text();
              console.error('Respuesta no JSON:', text);
              throw new Error('El servidor no devolvió una respuesta JSON válida');
            }
            
            verificacionData = await parseJSONSafe(verificacionResp);
          } catch (e) {
            if (e.name === 'SyntaxError') {
              throw new Error('Error al procesar la respuesta JSON del servidor');
            }
            throw e;
          }
          
          if (verificacionData.success && verificacionData.alumnosUnicos.length > 0) {
            // Hay alumnos que quedarían sin tutor
            const alumnosAfectados = verificacionData.alumnosUnicos;
            
            // Mostrar modal de asignación de tutor
            const asignarModal = new bootstrap.Modal(document.getElementById('asignarTutorModal'));
            
            // Mostrar lista de alumnos afectados
            const listaAlumnos = document.getElementById('alumnosSinTutorList');
            listaAlumnos.innerHTML = '<ul class="list-unstyled mb-0">' + 
              alumnosAfectados.map(alumno => 
                `<li class="d-flex align-items-center mb-2">
                   <i class="bi bi-person-fill me-2"></i>
                   ${alumno.nombre} ${alumno.apellido}
                 </li>`
              ).join('') + '</ul>';
            
            // Cargar tutores disponibles
            const tutoresResp = await fetch('./php/obtenerTutores.php');
            const tutoresData = await parseJSONSafe(tutoresResp);
            const tutores = Array.isArray(tutoresData) ? tutoresData : tutoresData.tutores;
            
            const tutoresContainer = document.getElementById('tutoresDisponibles');
            tutoresContainer.innerHTML = '';
            
            if (tutores.length <= 1) { // Si solo está el tutor que vamos a eliminar
              tutoresContainer.innerHTML = `
                <div class="alert alert-warning m-3">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  No hay otros tutores disponibles. 
                  <a href="aniadirTutor.html" class="alert-link text-white">Añada un nuevo tutor</a> antes de continuar.
                </div>`;
              document.getElementById('btnAsignarTutor').disabled = true;
              asignarModal.show();
              return;
            }
            
            // Mostrar lista de tutores disponibles (excluyendo el que se va a eliminar)
            const tutoresDisponibles = tutores.filter(t => t.id != id);
            tutoresContainer.innerHTML = `
              <div class="list-group list-group-flush">
                ${tutoresDisponibles.map(tutor => `
                  <div class="list-group-item border-0 py-2">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="tutorNuevo" 
                             value="${tutor.id}" id="tutor${tutor.id}">
                      <label class="form-check-label w-100" for="tutor${tutor.id}">
                        <div class="d-flex justify-content-between align-items-center">
                          <span>${tutor.nombre} ${tutor.apellido}</span>
                          ${tutor.telefono ? `<small class="text-muted">${tutor.telefono}</small>` : ''}
                        </div>
                      </label>
                    </div>
                  </div>
                `).join('')}
              </div>`;
            
            // Configurar el botón de asignar
            const btnAsignar = document.getElementById('btnAsignarTutor');
            btnAsignar.onclick = async () => {
              const tutorSeleccionado = document.querySelector('input[name="tutorNuevo"]:checked');
              if (!tutorSeleccionado) {
                alert('Por favor, seleccione un tutor');
                return;
              }
              
              btnAsignar.disabled = true;
              btnAsignar.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Asignando...';
              
              try {
                // Primero reasignar los alumnos al nuevo tutor
                for (const alumno of alumnosAfectados) {
                  const formData = new FormData();
                  formData.append('alumnoId', alumno.id);
                  formData.append('tutorId', tutorSeleccionado.value);
                  
                  await fetch('./php/asignarTutor.php', {
                    method: 'POST',
                    body: formData
                  });
                }
                
                // Luego eliminar el tutor original
                const fd = new FormData();
                fd.append('id', id);
                fd.append('force', '1');
                const eliminarResp = await fetch('./php/eliminarTutor.php', {
                  method: 'POST',
                  body: fd
                });
                const eliminarData = await parseJSONSafe(eliminarResp);
                
                if (eliminarData.success) {
                  asignarModal.hide();
                  
                  // Actualizar la lista de tutores sin recargar la página
                  const response = await fetch('./php/verTutores.php?ajax=1');
                  const data = await parseJSONSafe(response);
                  todosLosTutores = data;
                  mostrarTutores(todosLosTutores);
                } else {
                  throw new Error(eliminarData.message || 'Error al eliminar el tutor');
                }
              } catch (error) {
                console.error('Error:', error);
                alert('Error al reasignar tutores: ' + error.message);
              } finally {
                btnAsignar.disabled = false;
                btnAsignar.innerHTML = 'Asignar tutor';
              }
            };
            
            asignarModal.show();
          } else {
            // Si no hay alumnos que quedarían sin tutor, proceder con la eliminación normal
            if (confirm('¿Estás seguro de que deseas eliminar este tutor?')) {
              const fd = new FormData();
              fd.append('id', id);
              const response = await fetch('./php/eliminarTutor.php', {
                method: 'POST',
                body: fd
              });
              const data = await parseJSONSafe(response);
              if (data.success) {
                // Actualizar la lista de tutores sin recargar la página
                const tutoresResp = await fetch('./php/verTutores.php?ajax=1');
                const tutoresData = await parseJSONSafe(tutoresResp);
                todosLosTutores = Array.isArray(tutoresData) ? tutoresData : (tutoresData.tutores || []);
                mostrarTutores(todosLosTutores);
              } else {
                alert('Error al eliminar el tutor: ' + (data.message || 'Error desconocido'));
              }
            }
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Error al procesar la solicitud: ' + error.message);
        }
      }

      function modificarTutor(id) {
        console.log('ID del tutor:', id);
        const tutor = todosLosTutores.find(t => t.id.toString() === id.toString());
        console.log('Tutor encontrado:', tutor);
        if (tutor) {
          document.getElementById('tutorId').value = tutor.id;
          document.getElementById('nombre').value = tutor.nombre;
          document.getElementById('apellido').value = tutor.apellido;
          document.getElementById('dni').value = tutor.dni;
          document.getElementById('telefono').value = tutor.telefono;
          document.getElementById('direccion').value = tutor.direccion;
          
          const modal = new bootstrap.Modal(document.getElementById('modalModificarTutor'));
          modal.show();
        }
      }

      function guardarModificacion() {
        const form = document.getElementById('formModificarTutor');
        const formData = new FormData(form);
        const btn = form.querySelector('button.btn-primary') || document.querySelector('#modalModificarTutor .btn-primary');
        if (btn) btn.disabled = true;

        fetch('./php/modificarTutor.php', {
          method: 'POST',
          body: formData
        })
        .then(async response => {
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            // Respuesta no JSON (posible warning/HTML). Mostrar contenido para depuración.
            if (btn) btn.disabled = false;
            console.error('Respuesta no JSON al modificar tutor:', text);
            alert('Respuesta inesperada del servidor:\n' + text);
            return;
          }

          if (btn) btn.disabled = false;

          if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarTutor'));
            if (modal) modal.hide();

            // Actualizar la lista de tutores
            (async () => {
              try {
                const resp = await fetch('./php/verTutores.php?ajax=1');
                const refreshed = await parseJSONSafe(resp);
                todosLosTutores = Array.isArray(refreshed) ? refreshed : (refreshed.tutores || []);
                mostrarTutores(todosLosTutores);
              } catch (e) {
                console.error('Error al refrescar la lista de tutores:', e);
              }
            })();
          } else {
            alert('Error al modificar el tutor: ' + (data.message || 'Error desconocido'));
          }
        })
        .catch(error => {
          if (btn) btn.disabled = false;
          console.error('Error:', error);
          alert('Error al conectar con el servidor');
        });
      }
