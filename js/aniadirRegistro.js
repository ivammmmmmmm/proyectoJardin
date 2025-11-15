        // Función para cargar datos en un select
        async function cargarSelect(tipo, selectId, nombreCompleto = false) {
            try {
                console.log(`Cargando datos para ${tipo} en ${selectId}...`);
                
                // Endpoint para obtener datos
                const endpoint = `../php/obtenerDatos.php?tipo=${tipo}`;
                console.log('Endpoint:', endpoint);

                const response = await fetch(endpoint);
                const responseText = await response.text();
                console.log(`Respuesta cruda para ${tipo}:`, responseText);
                
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}. Respuesta: ${responseText}`);
                }

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error('Error al parsear JSON:', e);
                    console.error('Texto recibido:', responseText);
                    throw new Error('Error al procesar la respuesta del servidor');
                }
                
                console.log(`Datos recibidos para ${tipo}:`, data);
                
                const select = document.getElementById(selectId);
                if (!select) {
                    throw new Error(`No se encontró el elemento select con ID: ${selectId}`);
                }

                // Limpiar opciones existentes
                select.innerHTML = '<option value="">Seleccione una opción</option>';

                // Verificar si tenemos datos válidos
                if (!Array.isArray(data)) {
                    throw new Error('Los datos recibidos no son un array válido');
                }

                // Agregar nuevas opciones
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    
                    // Formatear el texto según el tipo y los datos disponibles
                    if (item.apellido) {
                        // Para alumnos, tutores y docentes que tienen nombre y apellido
                        option.textContent = `${item.apellido}, ${item.nombre}`;
                    } else {
                        // Para salas y otros que solo tienen nombre
                        option.textContent = item.nombre;
                    }
                    
                    select.appendChild(option);
                });

                console.log(`Datos cargados exitosamente para ${tipo}: `, data);
            } catch (error) {
                console.error(`Error cargando ${tipo}:`, error);
                alert(`Error al cargar ${tipo}: ${error.message}`);
            }
        }

        // Cuando el documento esté listo
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Iniciando carga de datos...');
            
            // Configurar el botón de prueba de conexión (si existe)
            const testBtn = document.getElementById('testConnection');
            if (testBtn) {
                testBtn.addEventListener('click', async function() {
                    try {
                        this.disabled = true;
                        this.textContent = 'Probando conexión...';
                        
                        const response = await fetch('../php/test_connection.php');
                        const data = await response.json();
                        
                        if (data.success) {
                            let message = 'Conexión exitosa!\n\nRegistros en las tablas:\n';
                            for (const [table, info] of Object.entries(data.tables)) {
                                message += `\n${table}: ${info.status === 'ok' ? info.registros : 'Error - ' + info.mensaje}`;
                            }
                            alert(message);
                            
                            // Si la conexión es exitosa, intentar cargar los datos nuevamente
                            console.log('Reintentando cargar los datos...');
                            await Promise.all([
                                cargarSelect('alumnos', 'selectAlumno', true),
                                cargarSelect('docentes', 'selectDocente', true),
                                cargarSelect('salas', 'selectSala')
                            ]);
                        } else {
                            alert('Error al probar conexión: ' + data.message);
                        }
                    } catch (error) {
                        console.error('Error al probar conexión:', error);
                        alert('Error al probar la conexión: ' + error.message);
                    } finally {
                        this.disabled = false;
                        this.textContent = 'Probar Conexión';
                    }
                });
            }
            
            // Cargar datos iniciales para los selects
            Promise.all([
                cargarSelect('alumnos', 'selectAlumno', true),
                cargarSelect('docentes', 'selectDocente', true),
                cargarSelect('salas', 'selectSala')
            ]).then(() => {
                console.log('Todos los datos cargados exitosamente');
            }).catch(error => {
                console.error('Error en la carga inicial de datos:', error);
                alert('Error al cargar los datos necesarios. Por favor, recargue la página.');
            });

            // Cuando se selecciona un alumno, cargar automáticamente sus tutores (si existen los elementos)
            const selectAlumnoEl = document.getElementById('selectAlumno');
            if (selectAlumnoEl) {
                selectAlumnoEl.addEventListener('change', function() {
                    const alumnoId = this.value;
                    const tutorSelect = document.getElementById('selectTutor');

                    console.log('Alumno seleccionado:', alumnoId);

                    if (!tutorSelect) {
                        console.warn('Elemento selectTutor no encontrado en la página. No se cargarán tutores.');
                        return;
                    }

                    tutorSelect.innerHTML = '<option value="">Seleccione un tutor</option>';

                    if (!alumnoId) {
                        return;
                    }

                    console.log('Cargando tutores para alumno:', alumnoId);
                    fetch(`../php/getTutoresAlumno.php?alumnoId=${alumnoId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Error HTTP: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Respuesta de tutores:', data);
                            if (data.tutores && Array.isArray(data.tutores)) {
                                data.tutores.forEach(tutor => {
                                    const option = document.createElement('option');
                                    option.value = tutor.id;
                                    option.textContent = `${tutor.apellido}, ${tutor.nombre}`;
                                    tutorSelect.appendChild(option);
                                });
                            } else {
                                console.error('Formato de respuesta inválido:', data);
                            }
                        })
                        .catch(err => {
                            console.error('Error cargando tutores del alumno:', err);
                            alert('Error al cargar los tutores: ' + err.message);
                        });
                });
            } else {
                console.warn('Elemento selectAlumno no encontrado en la página. No se adjuntará listener de cambio.');
            }

            // Manejar el envío del formulario (si existe)
            const formEl = document.querySelector('form');
            if (formEl) {
                formEl.addEventListener('submit', function(e) {
                    e.preventDefault();
                
                const formData = new FormData(this);
                fetch('../php/aniadirRegistro.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        alert('Registro guardado correctamente');
                        window.location.href = 'verRegistros.html';
                    } else {
                        // Mostrar mensaje de error detallado
                        const errorMessage = result.message || 'Error desconocido';
                        const errorDetails = result.error_details ? JSON.stringify(result.error_details, null, 2) : '';
                        console.error('Error del servidor:', errorMessage, '\nDetalles:', errorDetails);
                        alert(`Error: ${errorMessage}\n\nDetalles: ${errorDetails}`);
                        throw new Error(errorMessage);
                    }
                })
                .catch(error => {
                    console.error('Error completo:', error);
                    if (error.name === 'SyntaxError') {
                        console.error('Error al procesar la respuesta del servidor. Revisa los logs del servidor.');
                    }
                    alert('Error: ' + error.message);
                });
                });
            } else {
                console.warn('No se encontró el formulario en la página. No se manejará el submit.');
            }
        });
