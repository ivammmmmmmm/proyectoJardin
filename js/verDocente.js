        document.addEventListener('DOMContentLoaded', function() {
            fetch('../php/verDocentes.php?ajax=1')
                .then(response => response.json())
                .then(data => {
                    const accordion = document.getElementById('accordionDocentes');
                    accordion.innerHTML = '';
                    if (Array.isArray(data) && data.length > 0) {
                        data.forEach((docente, idx) => {
                            const item = document.createElement('div');
                            item.className = 'accordion-item';
                            item.innerHTML = `
                              <h2 class="accordion-header" id="heading${idx}">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
                                  ID: ${docente.id} - Nombre: ${docente.nombre} - Apellido: ${docente.apellido}
                                </button>
                              </h2>
                              <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#accordionDocentes">
                                <div class="accordion-body">
                                  <strong>Apellido:</strong> ${docente.apellido}<br>
                                  <strong>DNI:</strong> ${docente.dni}<br>
                                  <strong>Dirección:</strong> ${docente.direccion}<br>
                                  <strong>Fecha de Nacimiento:</strong> ${docente.fecha_nacimiento}
                                </div>
                              </div>
                            `;
                            accordion.appendChild(item);
                        });
                    } else {
                        accordion.innerHTML = '<div class="alert alert-info">No hay docentes registrados.</div>';
                    }
                })
                .catch(() => {
                    document.getElementById('accordionDocentes').innerHTML = '<div class="alert alert-danger">No se pudo conectar con el servidor.</div>';
                });
        });