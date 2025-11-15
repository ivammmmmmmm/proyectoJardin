        document.addEventListener('DOMContentLoaded', function() {
            fetch('/proyectoJardin/php/verAlumno.php?ajax=1')
                .then(response => response.json())
                .then(data => {
                    const accordion = document.getElementById('accordionAlumnos');
                    accordion.innerHTML = '';
                    if (Array.isArray(data) && data.length > 0) {
                        data.forEach((alumno, idx) => {
                            const item = document.createElement('div');
                            item.className = 'accordion-item';
                            item.innerHTML = `
                              <h2 class="accordion-header" id="heading${idx}">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
                                  ID: ${alumno.id} - Nombre: ${alumno.nombre} - Apellido: ${alumno.apellido}
                                </button>
                              </h2>
                              <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#accordionAlumnos">
                                <div class="accordion-body">
                                  <strong>Apellido:</strong> ${alumno.apellido}<br>
                                  <strong>DNI:</strong> ${alumno.dni}<br>
                                  <strong>Dirección:</strong> ${alumno.direccion}<br>
                                  <strong>Fecha de Nacimiento:</strong> ${alumno.fecha_nacimiento}<br>
                                  <strong>Tutores:</strong> ${alumno.tutores || 'Sin tutores asignados'}
                                </div>
                              </div>
                            `;
                            accordion.appendChild(item);
                        });
                    } else {
                        accordion.innerHTML = '<div class="alert alert-info">No hay alumnos registrados.</div>';
                    }
                })
                .catch(() => {
                    document.getElementById('accordionAlumnos').innerHTML = '<div class="alert alert-danger">No se pudo conectar con el servidor.</div>';
                });
        });
