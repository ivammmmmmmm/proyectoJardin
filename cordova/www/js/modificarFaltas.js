console.log('modificarFaltas.js - Iniciando script');

var API_PREFIX = (typeof API_PREFIX !== 'undefined') ? API_PREFIX : ((typeof API_BASE !== 'undefined') ? API_BASE : '../php/');

document.addEventListener('DOMContentLoaded', async function () {
    console.log('modificarFaltas.js - DOM Cargado');
    
    // Referencias a elementos del DOM
    const buscador = document.getElementById('buscador');
    const faltasLista = document.getElementById('faltasLista');
    const contadorResultados = document.getElementById('contadorResultados');
    const filtroAsistencia = document.getElementById('filtroAsistencia');
    const estadoSelect = document.getElementById('estadoSelect');

    // Mostrar mensaje de carga inicial
    if (faltasLista) {
        faltasLista.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-light" role="status"></div><div class="mt-2">Cargando registros...</div></div>';
    }
    
    console.log('Elementos encontrados:', {
        buscador: !!buscador,
        faltasLista: !!faltasLista,
        contadorResultados: !!contadorResultados,
        filtroAsistencia: !!filtroAsistencia
    });

    // Inicializar event listeners
    if (buscador) {
        console.log('Configurando event listener para buscador');
        buscador.addEventListener('input', function() {
            console.log('Evento input en buscador');
            aplicarFiltros();
        });
    }

    if (filtroAsistencia) {
        console.log('Configurando event listener para filtro de estado');
        filtroAsistencia.addEventListener('change', function() {
            console.log('Evento change en filtro de estado');
            aplicarFiltros();
        });
    }

    // Configurar event listener para el cambio de estado en el modal
    if (estadoSelect) {
        console.log('Configurando event listener para cambio de estado en modal');
        estadoSelect.addEventListener('change', async function() {
            try {
                await toggleRazonSelect();
            } catch (error) {
                console.error('Error en el cambio de estado:', error);
            }
        });
    }

    // Cargar datos iniciales
    console.log('Iniciando carga de datos');
    await cargarFaltas();

    // ============================================
    // FUNCIONES
    // ============================================

    // La función cargarSalas ya no es necesaria ya que no tenemos el selector de salas en el modal

    // Función para cargar las razones
    async function cargarRazones() {
        try {
            console.log('Cargando razones...');
            const response = await fetch(API_PREFIX + 'obtenerRazones.php');
            if (!response.ok) throw new Error('Error al obtener razones');
            const data = await response.json();

            let razones = [];
            if (data && Array.isArray(data.datos)) {
                razones = data.datos;
            } else if (Array.isArray(data)) {
                razones = data;
            }

            if (razones.length === 0) throw new Error('No hay razones disponibles.');

            const razonSelect = document.getElementById('razonSelect');
            if (!razonSelect) {
                console.error('No se encontró el elemento razonSelect');
                return;
            }

            razonSelect.innerHTML = '<option value="">Seleccione una razón</option>';
            razones.forEach(razon => {
                const option = document.createElement('option');
                option.value = razon.id;
                option.textContent = razon.descripcion || razon.nombre;
                razonSelect.appendChild(option);
            });

            console.log('Razones cargadas exitosamente');
        } catch (error) {
            console.error('Error al cargar razones:', error);
            const razonSelect = document.getElementById('razonSelect');
            if (razonSelect) {
                razonSelect.innerHTML = '<option value="">Error al cargar razones</option>';
            }
        }
    }

    // Función para cargar las faltas
    async function cargarFaltas() {
        try {
            console.log('Solicitando datos de faltas al servidor...');
            const response = await fetch(API_PREFIX + 'verFaltas.php');
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error del servidor:', response.status, errorText);
                throw new Error(`Error en la respuesta del servidor: ${response.status} - ${errorText}`);
            }
            
            const resultado = await response.json();
            console.log('Datos recibidos del servidor:', resultado);

            // Extraer el array de datos de la respuesta
            let faltas = [];
            if (resultado.data && Array.isArray(resultado.data)) {
                faltas = resultado.data;
                console.log(`Número total de registros: ${resultado.count}`);
            } else if (Array.isArray(resultado)) {
                faltas = resultado;
                console.log(`Número total de registros: ${resultado.length}`);
            } else {
                console.error('Formato de datos recibido:', resultado);
                throw new Error('Formato de datos inesperado');
            }

            mostrarFaltas(faltas);
        } catch (error) {
            console.error('Error al cargar faltas:', error);
            if (faltasLista) {
                faltasLista.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Error al cargar las faltas</h4>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }

    // Hacer accesible la función desde el scope global para llamadas externas
    try {
        window.cargarFaltas = cargarFaltas;
    } catch (e) {
        console.warn('No se pudo exponer cargarFaltas al scope global:', e);
    }

    // Función para mostrar las faltas
    function mostrarFaltas(registros) {
        try {
            if (!Array.isArray(registros)) {
                console.error('Los registros no son un array:', registros);
                throw new Error('Los datos recibidos no tienen el formato esperado');
                return;
            }
            
            console.log(`Procesando ${registros.length} registros...`);

            console.log('Limpiando lista anterior...');
            faltasLista.innerHTML = '';
            
            console.log('Procesando registros...');
            registros.forEach((registro, index) => {
                const div = document.createElement('div');
                div.className = 'list-group-item bg-dark text-light border-secondary';

                // Determinar el estado basado en los datos del registro
                const estado = registro.estado || 'sin_registro';
                div.dataset.estado = estado; // Asignar el estado al dataset inmediatamente
                
                if (index < 5) { // Solo mostramos los primeros 5 para no llenar la consola
                    console.log(`Registro ${index}:`, { 
                        estado: estado,
                        falta_id: registro.falta_id,
                        alumno: registro.alumno_nombre
                    });
                }

                let estadoClase = '';
                let estadoTexto = '';
                if (estado === 'presente') {
                    estadoClase = 'text-success';
                    estadoTexto = 'Presente';
                } else if (estado === 'ausente') {
                    estadoClase = 'text-danger';
                    estadoTexto = `Ausente - ${registro.razon || 'Sin razón especificada'}`;
                } else {
                    estadoClase = 'text-warning';
                    estadoTexto = 'Sin registro';
                }

                const fecha = registro.fecha || null;
                
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${registro.alumno_nombre} ${registro.alumno_apellido}</h5>
                            <small data-fecha="${registro.fecha || ''}">
                                Sala: ${registro.sala_nombre} | 
                                Fecha: ${registro.fecha || 'No disponible'}
                            </small>
                            <br>
                            <small class="${estadoClase}">${estadoTexto}</small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-outline-primary btn-sm" 
                                onclick="abrirModalModificar(${registro.alumno_id}, '${registro.fecha || ''}')"
                                data-alumno-id="${registro.alumno_id}"
                                data-fecha="${registro.fecha || ''}"
                                ${!registro.fecha ? 'disabled' : ''}>
                                <i class="bi bi-pencil"></i> Modificar
                            </button>
                            ${registro.falta_id ? `
                                <button class="btn btn-outline-danger btn-sm" 
                                    onclick="eliminarFalta(${registro.falta_id})"
                                    data-falta-id="${registro.falta_id}"
                                    title="Eliminar registro">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : (registro.alumno_id && registro.fecha ? `
                                <button class="btn btn-outline-danger btn-sm" 
                                    onclick="eliminarFaltaPorAlumnoFecha(${registro.alumno_id}, '${registro.fecha}')"
                                    data-alumno-id="${registro.alumno_id}"
                                    data-fecha="${registro.fecha}"
                                    title="Eliminar registro por alumno y fecha">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : '')}
                        </div>
                    </div>
                `;
                div.dataset.estado = estado;
                faltasLista.appendChild(div);
            });

            actualizarContador();
        } catch (error) {
            console.error('Error al mostrar las faltas:', error);
        }
    }

    // Función para aplicar los filtros y mantener la funcionalidad de los botones
    function aplicarFiltros() {
        try {
            if (!faltasLista || !buscador || !filtroAsistencia) {
                console.error('Elementos del DOM no encontrados');
                return;
            }

            const texto = buscador.value.toLowerCase().trim();
            const estadoSeleccionado = filtroAsistencia.value;
            const items = Array.from(faltasLista.getElementsByClassName('list-group-item'));

            console.log('Aplicando filtros:', {
                texto,
                estadoSeleccionado,
                totalItems: items.length
            });

            let contador = 0;

            // Procesar cada elemento
            items.forEach((item, index) => {
                // Obtener datos del elemento
                const nombre = item.querySelector('h5').textContent.toLowerCase();
                const estado = item.dataset.estado;
                const btnModificar = item.querySelector('.btn-outline-primary');
                
                // Verificar si cumple con los filtros
                const cumpleTexto = nombre.includes(texto);
                const cumpleEstado = estadoSeleccionado === 'todos' || 
                                   (estadoSeleccionado === 'ausentes' && estado === 'ausente') || 
                                   (estadoSeleccionado === 'presentes' && estado === 'presente');
                
                // Actualizar visibilidad
                const mostrar = cumpleTexto && cumpleEstado;
                item.style.display = mostrar ? '' : 'none';
                
                // Mantener el botón habilitado si hay fecha
if (btnModificar) {
    const fecha = btnModificar.dataset.fecha || item.querySelector('[data-fecha]')?.dataset.fecha;
    btnModificar.disabled = !fecha || fecha === '';
}

                
                if (mostrar) contador++;
            });

            // Actualizar contador
            if (contadorResultados) {
                contadorResultados.textContent = `Mostrando ${contador} resultado(s)`;
            }
        } catch (error) {
            console.error('Error al aplicar filtros:', error);
        }
    }

    // Función para actualizar el contador de resultados
    function actualizarContador(cantidad) {
        const total = cantidad ?? faltasLista.querySelectorAll('.list-group-item:not([style*="display: none"])').length;
        contadorResultados.textContent = `Mostrando ${total} resultado(s)`;
    }
});  // Fin del DOMContentLoaded

// ======================================================
// FUNCIONES GLOBALES
// ======================================================

// Función para abrir el modal de modificación
    async function abrirModalModificar(alumnoId, fecha) {
        try {
            if (!alumnoId || !fecha) {
                console.error('ID de alumno o fecha no válidos:', { alumnoId, fecha });
                alert('No se puede modificar este registro: faltan datos necesarios');
                return;
            }

            // Formatear la fecha en el formato YYYY-MM-DD
            const fechaFormateada = fecha.split('T')[0]; // Ya debe venir en formato YYYY-MM-DD
            console.log('Obteniendo datos para modificar:', { alumnoId, fechaFormateada });
            
            const url = API_PREFIX + `obtenerDatos.php?tipo=asistencia&alumnoId=${alumnoId}&fecha=${fechaFormateada}`;
            console.log('URL de solicitud:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error del servidor:', response.status, errorText);
                throw new Error(`Error en la respuesta del servidor: ${response.status}`);
            }        if (!response.ok) {
            console.error('Error en la respuesta del servidor:', response.status, response.statusText);
            throw new Error('Error en la respuesta del servidor');
        }

    const datos = await response.json();
    console.log('Datos de asistencia recibidos (raw):', datos);

    // Compatibilidad: algunos endpoints devuelven { success: true, data: {...} }
    // y otros devuelven el objeto directamente. Unificar en 'payload'.
    const payload = (datos && typeof datos === 'object' && 'data' in datos) ? datos.data : datos;
    console.log('Datos de asistencia procesados (payload):', payload);

        // Obtener la fecha actual si no se proporciona una
        const fechaActual = fecha || (() => {
            const hoy = new Date();
            const año = hoy.getFullYear();
            const mes = String(hoy.getMonth() + 1).padStart(2, '0');
            const dia = String(hoy.getDate()).padStart(2, '0');
            return `${año}-${mes}-${dia}`;
        })();

    // Usar campos seguros y por defecto si faltan.
    // Algunas respuestas pueden devolver 'alumno_nombre'/'alumno_apellido' o simplemente 'nombre'/'apellido'.
    function pickFirstString(o, keys) {
        if (!o || typeof o !== 'object') return '';
        for (const k of keys) {
            if (k in o && o[k] != null) return o[k].toString();
        }
        return '';
    }

    const alumnoNombre = pickFirstString(payload, ['alumno_nombre', 'nombre']);
    const alumnoApellido = pickFirstString(payload, ['alumno_apellido', 'apellido']);

    document.getElementById('alumnoNombre').value = `${alumnoNombre} ${alumnoApellido}`.trim() || 'Sin nombre';
    document.getElementById('alumnoId').value = alumnoId;
    document.getElementById('fechaFalta').value = fechaActual;
    document.getElementById('estadoSelect').value = (payload && payload.estado) ? payload.estado : 'presente';
    document.getElementById('faltaId').value = (payload && payload.falta_id) ? payload.falta_id : '';

        // Manejar el contenedor de razón según el estado
        const razonContainer = document.getElementById('razonContainer');
        if ((payload && payload.estado) === 'ausente') {
            razonContainer.style.display = 'block';
            document.getElementById('razonSelect').value = payload.razon_id || '';
        } else {
            razonContainer.style.display = 'none';
        }

        // Cargar las razones antes de mostrar el modal
        try {
            await cargarRazones();
        } catch (razonError) {
            console.error('Error al cargar razones:', razonError);
            // Continuar mostrando el modal incluso si falla la carga de razones
        }

        const modal = new bootstrap.Modal(document.getElementById('modalModificarFalta'));
        modal.show();
    } catch (error) {
        console.error('Error al obtener datos de la falta:', error);
        alert('Error al cargar los datos de la falta');
    }
}

// Función para cargar las razones desde el servidor
async function cargarRazones() {
    try {
    const response = await fetch(API_PREFIX + 'obtenerRazones.php');
        if (!response.ok) {
            // Intentar leer el cuerpo de la respuesta para obtener más detalles del error del servidor
            let bodyText;
            try {
                bodyText = await response.text();
            } catch (e) {
                bodyText = '<no body available>';
            }
            console.error('Error al solicitar razones. Status:', response.status, 'Body:', bodyText);
            throw new Error(`Error al cargar razones: ${response.status} - ${bodyText}`);
        }

        const data = await response.json();
        console.log('Respuesta obtenerRazones.php:', data);
        if (!data.success) {
            console.error('obtenerRazones.php respondió con success=false:', data);
            throw new Error(data.message || 'Error al cargar las razones');
        }

        const razonSelect = document.getElementById('razonSelect');
        razonSelect.innerHTML = '<option value="">Seleccione una razón</option>';
        
        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(razon => {
                const option = document.createElement('option');
                option.value = razon.id;
                option.textContent = razon.nombre || razon.descripcion || '';
                razonSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar razones:', error);
        throw error;
    }
}

// Función para mostrar/ocultar el selector de razón
async function toggleRazonSelect() {
    const estado = document.getElementById('estadoSelect').value;
    const razonContainer = document.getElementById('razonContainer');
    const razonSelect = document.getElementById('razonSelect');
    
    if (estado === 'ausente') {
        // Si no hay opciones en el select (excepto la opción por defecto), cargar razones
        if (razonSelect.options.length <= 1) {
            try {
                await cargarRazones();
            } catch (error) {
                console.error('Error al cargar razones en toggleRazonSelect:', error);
                alert('Error al cargar las razones. Por favor, intente nuevamente.');
                return;
            }
        }
        
        razonContainer.style.display = 'block';
        razonSelect.required = true;
    } else {
        razonContainer.style.display = 'none';
        razonSelect.required = false;
        razonSelect.value = '';
    }
}

// Función para guardar los cambios
async function guardarModificacion() {
    const estadoSelect = document.getElementById('estadoSelect');
    const razonSelect = document.getElementById('razonSelect');
    const estado = estadoSelect.value;

    // Validar que si es ausente, tenga razón
    if (estado === 'ausente' && !razonSelect.value) {
        razonSelect.classList.add('is-invalid');
        return;
    }

    // Obtener la fecha actual en formato YYYY-MM-DD si no hay fecha seleccionada
    let fecha = document.getElementById('fechaFalta').value;
    if (!fecha) {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        fecha = `${año}-${mes}-${dia}`;
    }

    const formData = new FormData();
    formData.append('alumno_id', document.getElementById('alumnoId').value);
    formData.append('fecha', fecha);
    formData.append('estado', estado);
    formData.append('razon_id', estado === 'ausente' ? razonSelect.value : '');
    formData.append('falta_id', document.getElementById('faltaId').value);

    try {
    const response = await fetch(API_PREFIX + 'modificarFalta.php', {
            method: 'POST',
            body: formData
        });

        // Leer el cuerpo como texto UNA sola vez para diagnóstico y parseo
        let bodyText = '';
        try {
            bodyText = await response.text();
        } catch (e) {
            bodyText = '<no body available>';
        }

        if (!response.ok) {
            console.error('Respuesta no OK modificarFalta.php:', response.status, bodyText);
            throw new Error('Error en la respuesta del servidor: ' + response.status + ' - ' + bodyText);
        }

        // Intentar parsear JSON a partir del texto leído
        let result;
        try {
            result = JSON.parse(bodyText);
        } catch (e) {
            console.error('Respuesta inválida al parsear JSON desde modificarFalta.php:', bodyText);
            throw new Error('Respuesta inválida del servidor: ' + bodyText);
        }
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarFalta'));
            modal.hide();
            await cargarFaltas(); // Recargar los datos sin recargar la página
            alert('Asistencia modificada correctamente');
        } else {
            throw new Error(result.error || 'Error al modificar la asistencia');
        }
    } catch (error) {
        console.error('Error al modificar la asistencia:', error);
        alert('Error al modificar la asistencia: ' + error.message);
    }
}

// Función para eliminar una falta
async function eliminarFalta(faltaId) {
    if (!faltaId) {
        console.error('ID de falta no válido');
        alert('No se puede eliminar: ID de falta no válido');
        return;
    }

    if (!confirm('¿Está seguro que desea eliminar esta falta?')) return;

    try {
        console.log('Eliminando falta:', faltaId);
    const response = await fetch(API_PREFIX + `eliminarFalta.php?id=${faltaId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            console.error('Error al eliminar:', response.status, response.statusText);
            throw new Error('Error en la respuesta del servidor');
        }

        const result = await response.json();
        if (result.success) {
            console.log('Falta eliminada correctamente');
            alert('Falta eliminada correctamente');
            await cargarFaltas(); // Recargar los datos en vez de recargar la página
        } else {
            throw new Error(result.error || 'Error al eliminar la falta');
        }
    } catch (error) {
        console.error('Error al eliminar la falta:', error);
        alert('Error al eliminar la falta: ' + error.message);
    }
}

// Eliminar falta usando alumnoId y fecha cuando no se dispone de falta_id
async function eliminarFaltaPorAlumnoFecha(alumnoId, fecha) {
    if (!alumnoId || !fecha) {
        console.error('Alumno o fecha no válidos para eliminar la falta:', { alumnoId, fecha });
        alert('No se puede eliminar: faltan datos (alumno/fecha)');
        return;
    }

    if (!confirm('¿Está seguro que desea eliminar esta falta para el alumno en la fecha indicada?')) return;

    try {
        console.log('Eliminando falta por alumno y fecha:', { alumnoId, fecha });
        // Llamamos al mismo endpoint pero pasando alumno_id y fecha como parámetros
    const url = API_PREFIX + `eliminarFalta.php?alumno_id=${encodeURIComponent(alumnoId)}&fecha=${encodeURIComponent(fecha)}`;
        const response = await fetch(url, { method: 'DELETE' });

        if (!response.ok) {
            console.error('Error al eliminar por alumno/fecha:', response.status, response.statusText);
            throw new Error('Error en la respuesta del servidor');
        }

        const result = await response.json();
        if (result.success) {
            console.log('Falta eliminada correctamente por alumno/fecha');
            alert('Falta eliminada correctamente');
            await cargarFaltas();
        } else {
            throw new Error(result.error || 'Error al eliminar la falta');
        }
    } catch (error) {
        console.error('Error al eliminar la falta por alumno/fecha:', error);
        alert('Error al eliminar la falta: ' + error.message);
    }
}
