// modificarRegistro.js
// Maneja la lógica para modificar y eliminar registros
      let todosLosRegistros = [];
      let alumnos = [];
      let tutores = [];
      let docentes = [];
      let salas = [];

      // Filtrado para registros: busca en varios campos relevantes
      function filtrarRegistros(terminoBusqueda) {
        const termino = (terminoBusqueda || '').toString().toLowerCase();
        const filtroDocente = (document.getElementById('filtroDocente')?.value || '').toString();
        const filtroSala = (document.getElementById('filtroSala')?.value || '').toString();

        return (todosLosRegistros || []).filter(r => {
          if (!r || typeof r !== 'object') return false;

          // Filtro por docente
          if (filtroDocente !== '' && String(r.docente_id) !== filtroDocente) {
            return false;
          }

          // Filtro por sala
          if (filtroSala !== '' && String(r.sala_id) !== filtroSala) {
            return false;
          }

          // Filtro por búsqueda de texto
          if (termino) {
            const alumno = (typeof r.alumno_nombre !== 'undefined' && r.alumno_nombre !== null) ? String(r.alumno_nombre) : '';
            const tutor = (typeof r.tutor_nombre !== 'undefined' && r.tutor_nombre !== null) ? String(r.tutor_nombre) : '';
            const docente = (typeof r.docente_nombre !== 'undefined' && r.docente_nombre !== null) ? String(r.docente_nombre) : '';
            const fecha = (typeof r.fecha !== 'undefined' && r.fecha !== null) ? String(r.fecha) : '';

            return alumno.toLowerCase().includes(termino) ||
                   tutor.toLowerCase().includes(termino) ||
                   docente.toLowerCase().includes(termino) ||
                   fecha.toLowerCase().includes(termino);
          }

          return true;
        });
      }

      // Cargar datos al iniciar
      document.addEventListener('DOMContentLoaded', function() {
        console.log('Iniciando carga de datos...');
        // Pre-inicializar el modal
        const modalElement = document.getElementById('modalModificarRegistro');
        if (modalElement) {
          new bootstrap.Modal(modalElement);
          console.log('Modal inicializado');
        }

        // Cargar datos necesarios
        // Array para mapear índices a nombres de endpoints
        const endpoints = [
          'verRegistros.php',
          'obtenerDatos.php?tipo=alumnos',
          'obtenerDatos.php?tipo=tutores',
          'obtenerDatos.php?tipo=docentes',
          'obtenerDatos.php?tipo=salas'
        ];

        Promise.all([
          fetch('../php/verRegistros.php'),
          fetch('../php/obtenerDatos.php?tipo=alumnos'),
          fetch('../php/obtenerDatos.php?tipo=tutores'),
          fetch('../php/obtenerDatos.php?tipo=docentes'),
          fetch('../php/obtenerDatos.php?tipo=salas')
        ])
        .then(responses => {
          console.log('Respuestas recibidas:', responses.map(r => r.status));
          return Promise.all(responses.map((r, i) => 
            r.text().then(text => {
              try {
                // Intentar parsear como JSON
                return JSON.parse(text);
              } catch (e) {
                // Mostrar qué endpoint falló y su respuesta
                console.error(`Error en ${endpoints[i]}:`, text);
                throw new Error(`Error en ${endpoints[i]}: ${text.substring(0, 150)}...`);
              }
            })
          ));
        })
        .then(([registrosData, alumnosData, tutoresData, docentesData, salasData]) => {
          console.log('Datos cargados:', {
            registros: registrosData?.length || 0,
            alumnos: alumnosData?.length || 0,
            tutores: tutoresData?.length || 0,
            docentes: docentesData?.length || 0,
            salas: salasData?.length || 0
          });
          
          todosLosRegistros = Array.isArray(registrosData) ? registrosData : [];
          alumnos = Array.isArray(alumnosData) ? alumnosData : [];
          tutores = Array.isArray(tutoresData) ? tutoresData : [];
          docentes = Array.isArray(docentesData) ? docentesData : [];
          salas = Array.isArray(salasData) ? salasData : [];

          // Llenar selects
          llenarSelect('alumno', alumnos, 'nombre', 'apellido');
          llenarSelect('tutor', tutores, 'nombre', 'apellido');
          llenarSelect('docente', docentes, 'nombre', 'apellido');
          llenarSelect('sala', salas, 'nombre');

          // Llenar filtros laterales
          llenarSelectFiltro('filtroDocente', docentes, 'nombre', 'apellido');
          llenarSelectFiltro('filtroSala', salas, 'nombre');

          mostrarRegistros(todosLosRegistros);

          // Configurar listeners de filtros
          const filtroDocente = document.getElementById('filtroDocente');
          const filtroSala = document.getElementById('filtroSala');
          if (filtroDocente) filtroDocente.addEventListener('change', aplicarFiltros);
          if (filtroSala) filtroSala.addEventListener('change', aplicarFiltros);
        })
        .catch(err => {
          console.error('Error cargando datos:', err);
          alert('Error al cargar los datos necesarios');
        });
          // Configurar buscador nativo (debounce)
          const buscador = document.getElementById('buscador');
          if (buscador) {
            let debounceTimer = null;
            buscador.addEventListener('input', function (e) {
              clearTimeout(debounceTimer);
              debounceTimer = setTimeout(() => {
                aplicarFiltros();
              }, 120);
            });
          } else {
            console.debug('modificarRegistro.js: #buscador no presente en esta página');
          }
      });

      // Función para aplicar todos los filtros
      function aplicarFiltros() {
        const termino = (document.getElementById('buscador')?.value || '').toLowerCase();
        const resultados = filtrarRegistros(termino);
        mostrarRegistros(resultados);
      }

      function llenarSelectFiltro(selectId, datos, nombreProp, apellidoProp = null) {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        
        // Limpiar opciones excepto la primera
        while (select.options.length > 1) {
          select.remove(1);
        }
        
        datos.forEach(dato => {
          const option = document.createElement('option');
          option.value = dato.id;
          option.textContent = apellidoProp ? 
            `${dato[nombreProp]} ${dato[apellidoProp]}` : 
            dato[nombreProp];
          select.appendChild(option);
        });

        // Restaurar el valor anterior si existe
        select.value = currentValue;
      }

      function llenarSelect(selectId, datos, nombreProp, apellidoProp = null) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Seleccione una opción</option>';
        
        datos.forEach(dato => {
          const option = document.createElement('option');
          option.value = dato.id;
          option.textContent = apellidoProp ? 
            `${dato[nombreProp]} ${dato[apellidoProp]}` : 
            dato[nombreProp];
          select.appendChild(option);
        });
      }

      function mostrarRegistros(registros) {
        const listaRegistros = document.getElementById('registrosLista');
        document.getElementById('contadorResultados').textContent = 
          `Mostrando ${registros.length} ${registros.length === 1 ? 'registro' : 'registros'}`;

        if (registros.length === 0) {
          listaRegistros.innerHTML = '<div class="alert alert-info">No se encontraron registros que coincidan con la búsqueda.</div>';
          return;
        }

        listaRegistros.innerHTML = '';
        
        registros.forEach((registro, idx) => {
          const item = document.createElement('div');
          item.className = 'list-group-item bg-dark text-light mb-2';
          item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="bi bi-journal-text fs-3 me-3 text-light"></i>
                <div>
                  <h6 class="mb-0 text-light">${registro.alumno_nombre}</h6>
                  <small class="text-muted">${registro.fecha}</small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-danger btn-sm" onclick="eliminarRegistro('${registro.id}')">Eliminar</button>
                <button class="btn btn-secondary btn-sm" onclick="modificarRegistro('${registro.id}')">Modificar</button>
                <button class="btn btn-info btn-sm text-white"
                        data-bs-toggle="collapse"
                        data-bs-target="#infoRegistro${idx}"
                        aria-expanded="false"
                        aria-controls="infoRegistro${idx}">
                  Ver Info
                </button>
              </div>
            </div>

            <!-- Info oculta -->
            <div class="collapse mt-3" id="infoRegistro${idx}" data-bs-parent="#registrosLista">
              <div class="p-3 bg-secondary rounded">
                <p><strong>Tutor:</strong> ${registro.tutor_nombre}</p>
                <p><strong>Docente:</strong> ${registro.docente_nombre}</p>
                <p><strong>Sala:</strong> ${registro.sala_nombre}</p>
                <p><strong>Medio Utilizado:</strong> ${registro.medioUtilizado}</p>
                <p><strong>Causa:</strong> ${registro.causa}</p>
                <p><strong>Desarrollo:</strong> ${registro.desarrollo || 'No especificado'}</p>
              </div>
            </div>
          `;
          listaRegistros.appendChild(item);
        });
      }

 
      

      function eliminarRegistro(id) {
        if (!confirm('¿Está seguro que desea eliminar este registro?')) return;

        fetch(`../php/eliminarRegistro.php?id=${id}`, {
          method: 'POST'
        })
        .then(async response => {
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            if (data.success) {
              location.reload();
            } else {
              alert('Error al eliminar el registro: ' + (data.message || JSON.stringify(data)));
            }
          } catch (e) {
            if (response.ok) location.reload();
            else alert('Error del servidor al eliminar: ' + text);
          }
        })
        .catch(err => {
          console.error('Eliminar registro error:', err);
          alert('Error al conectar con el servidor');
        });
      }

     function modificarRegistro(id) {
  const registro = todosLosRegistros.find(r => r.id.toString() === id.toString());
  if (registro) {
    document.getElementById('registroId').value = registro.id;
    // helper para asignar select solo si la opción existe
    const setSelectValue = (selectId, value) => {
      const sel = document.getElementById(selectId);
      if (!sel) return;
      if (!value) {
        sel.value = '';
        sel.selectedIndex = 0;
        return;
      }
      const opt = sel.querySelector(`option[value="${value}"]`);
      if (opt) {
        sel.value = value;
      } else {
        // si la opción no existe, dejar el placeholder seleccionado
        sel.value = '';
        sel.selectedIndex = 0;
      }
    };

    setSelectValue('alumno', registro.alumno_id);
    setSelectValue('tutor', registro.tutor_id);
    setSelectValue('docente', registro.docente_id);
    setSelectValue('sala', registro.sala_id);
    
    document.getElementById('medioUtilizado').value = registro.medioUtilizado || '';
    document.getElementById('causa').value = registro.causa || '';
    document.getElementById('desarrollo').value = registro.desarrollo || '';

    const modal = new bootstrap.Modal(document.getElementById('modalModificarRegistro'));
    modal.show();
  }
}

      function guardarModificacion() {
        const formData = new FormData(document.getElementById('formModificarRegistro'));

        fetch('../php/modificarRegistro.php', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarRegistro'));
            modal.hide();
            
            // Actualizar la lista de registros
            fetch('../php/verRegistros.php?ajax=1')
              .then(response => response.json())
              .then(data => {
                todosLosRegistros = data;
                mostrarRegistros(todosLosRegistros);
              });
          } else {
            alert('Error al modificar el registro: ' + (data.message || 'Error desconocido'));
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al conectar con el servidor');
        });
      }
