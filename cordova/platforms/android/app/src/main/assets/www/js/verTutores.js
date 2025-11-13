        document.addEventListener('DOMContentLoaded', function() {
            fetch('../php/verTutores.php?ajax=1')
                .then(response => response.json())
                .then(data => {
                    const accordion = document.getElementById('accordionTutores');
                    accordion.innerHTML = '';
                    if (Array.isArray(data) && data.length > 0) {
                        data.forEach((tutor, idx) => {
                            const item = document.createElement('div');
                            item.className = 'accordion-item';
                            item.innerHTML = `
                              <h2 class="accordion-header" id="heading${idx}">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="false" aria-controls="collapse${idx}">
                                  ID: ${tutor.id} - Nombre: ${tutor.nombre} - Apellido: ${tutor.apellido}
                                </button>
                              </h2>
                              <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#accordionTutores">
                                <div class="accordion-body">
                                  <strong>Apellido:</strong> ${tutor.apellido}<br>
                                  <strong>Teléfono:</strong> ${tutor.telefono}<br>
                                  <strong>Dirección:</strong> ${tutor.direccion}<br>
                                  <strong>Email:</strong> ${tutor.mail}
                                </div>
                              </div>
                            `;
                            accordion.appendChild(item);
                        });
                    } else {
                        accordion.innerHTML = '<div class="alert alert-info">No hay tutores registrados.</div>';
                    }
                })
                .catch(() => {
                    document.getElementById('accordionTutores').innerHTML = '<div class="alert alert-danger">No se pudo conectar con el servidor.</div>';
                });
         });
