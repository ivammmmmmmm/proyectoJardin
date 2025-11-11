// Copiado desde /js/aniadirFaltas.js (sin modificaciones de endpoints)
document.addEventListener('DOMContentLoaded', function() {
    // API prefix: if API_BASE is provided (from config.js) use it, otherwise fall back to relative PHP folder
    const API_PREFIX = (typeof API_BASE !== 'undefined') ? API_BASE : '../php/';
    const form = document.getElementById('formAgregarFalta');
    const salaSelect = document.getElementById('salaSelect');
    const alumnosContainer = document.getElementById('alumnosContainer');
    const listaAlumnos = document.getElementById('listaAlumnos');
    const submitButton = form.querySelector('button[type="submit"]');

    form.classList.remove('needs-validation');

    const initForm = () => {
        salaSelect.disabled = false;
        salaSelect.classList.remove('is-invalid');
        listaAlumnos.innerHTML = '';
        alumnosContainer.classList.add('d-none');
        submitButton.disabled = false;
    };

    initForm();
    cargarSalas();

    salaSelect.addEventListener('change', async function() {
        salaSelect.classList.remove('is-invalid');
        listaAlumnos.innerHTML = '';
        alumnosContainer.classList.add('d-none');

        if (this.value) {
            try {
                submitButton.disabled = true;
                await cargarAlumnosPorSala(this.value);
            } catch (error) {
                console.error('Error al cargar alumnos:', error);
                mostrarError(`Error al cargar los alumnos: ${error.message}`, form);
            } finally {
                submitButton.disabled = false;
                salaSelect.disabled = false;
            }
        }
    });

    window.marcarTodos = function(presentes) {
        const checkboxes = listaAlumnos.querySelectorAll('input[type="checkbox"].custom-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = !presentes;
            const alumnoId = checkbox.value;
            const evento = new Event('change');
            checkbox.dispatchEvent(evento);
            toggleRazonSelect(alumnoId);
        });
    };

    async function cargarSalas() {
        let salas = [];
        try {
            const data = await fetchWithErrorHandling(API_PREFIX + 'obtenerSalasConTurnos.php');
            if (data && Array.isArray(data)) {
                salas = data;
            } else if (data && typeof data === 'object' && Array.isArray(data.datos)) {
                salas = data.datos;
            }

            if (salas.length === 0) {
                mostrarError('No hay salas disponibles', salaSelect.parentNode);
                return;
            }

            salaSelect.innerHTML = '<option value="">Seleccione una sala</option>';
            salas.forEach(sala => {
                const option = document.createElement('option');
                option.value = sala.id;
                let textoOpcion = `Sala ${sala.nombre}`;
                if (sala.turno) textoOpcion += ` - ${sala.turno}`;
                option.textContent = textoOpcion;
                salaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar salas:', error);
            mostrarError(`Error al cargar las salas: ${error.message}`, salaSelect.parentNode);
        }
    }

    async function cargarAlumnosPorSala(idSala) {
        try {
            const data = await fetchWithErrorHandling(`${API_PREFIX}verAlumno.php?idSala=${idSala}&simple=1`);
            if (!data.success || !Array.isArray(data.alumnos)) {
                throw new Error(data.error || 'Error al cargar alumnos');
            }

            if (data.alumnos.length === 0) {
                mostrarError('No hay alumnos registrados en esta sala', alumnosContainer);
                alumnosContainer.classList.add('d-none');
                return;
            }

            listaAlumnos.innerHTML = '';
            data.alumnos.forEach(alumno => {
                const div = document.createElement('div');
                div.className = 'list-group-item bg-dark text-light d-flex align-items-center border-secondary';
                div.innerHTML = `
                    <div class="d-flex flex-grow-1 align-items-center gap-4">
                        <div class="d-flex align-items-center gap-3">
                            <input class="custom-checkbox" type="checkbox" 
                                   value="${alumno.id}" 
                                   id="alumno_${alumno.id}" 
                                   name="alumnos[]" 
                                   onchange="toggleRazonSelect('${alumno.id}')">
                            <span class="fs-6">${alumno.apellido}, ${alumno.nombre}</span>
                        </div>
                        <div class="d-flex align-items-center">
                            <small class="badge bg-success presente-badge" title="Presente"><i class="bi bi-check-lg"></i></small>
                            <small class="badge bg-danger ausente-badge d-none" title="Ausente"><i class="bi bi-x-lg"></i></small>
                        </div>
                        <div class="razon-select-container d-none" id="razon_container_${alumno.id}">
                            <select class="form-select form-select-sm bg-dark text-light" 
                                    id="razon_${alumno.id}" 
                                    name="razon_${alumno.id}"
                                    style="width: 200px;">
                                <option value="">Seleccione una razón</option>
                                <option value="1">Enfermedad</option>
                                <option value="2">Viaje</option>
                                <option value="3">Trámites</option>
                                <option value="4">Otros</option>
                            </select>
                        </div>
                    </div>
                `;
                listaAlumnos.appendChild(div);

                const presenteBadge = div.querySelector('.presente-badge');
                const ausenteBadge = div.querySelector('.ausente-badge');
                const checkbox = div.querySelector('.custom-checkbox');

                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        presenteBadge.classList.add('d-none');
                        ausenteBadge.classList.remove('d-none');
                    } else {
                        presenteBadge.classList.remove('d-none');
                        ausenteBadge.classList.add('d-none');
                    }
                });
            });

            alumnosContainer.classList.remove('d-none');
        } catch (error) {
            console.error('Error:', error);
            mostrarError(`Error al cargar los alumnos de la sala: ${error.message}`, alumnosContainer);
            alumnosContainer.classList.add('d-none');
        }
    }

    window.toggleRazonSelect = function(alumnoId) {
        const checkbox = document.getElementById(`alumno_${alumnoId}`);
        const razonContainer = document.getElementById(`razon_container_${alumnoId}`);
        const razonSelect = document.getElementById(`razon_${alumnoId}`);

        if (checkbox.checked) {
            razonContainer.classList.remove('d-none');
            razonSelect.required = true;
        } else {
            razonContainer.classList.add('d-none');
            razonSelect.required = false;
            razonSelect.value = '';
        }
    };

    function validarFormulario() {
        let isValid = true;
        if (!salaSelect.value) {
            isValid = false;
            salaSelect.classList.add('is-invalid');
            mostrarError('Por favor seleccione una sala', form);
            salaSelect.focus();
        } else {
            salaSelect.classList.remove('is-invalid');
        }
        if (!isValid) return false;

        const alumnosConError = [];
        const checkboxes = listaAlumnos.querySelectorAll('input[type="checkbox"]:checked');
        const faltas = Array.from(checkboxes)
            .map(checkbox => {
                const alumnoId = parseInt(checkbox.value, 10);
                const razonSelect = document.getElementById(`razon_${alumnoId}`);
                const razon = parseInt(razonSelect?.value, 10);
                const alumnoNombre = checkbox.closest('.d-flex').querySelector('span').textContent;

                if (!razon) {
                    razonSelect.classList.add('is-invalid');
                    alumnosConError.push(alumnoNombre);
                    return null;
                }

                razonSelect.classList.remove('is-invalid');
                return { alumno_id: alumnoId, razon_id: razon };
            })
            .filter(f => f !== null);

        if (alumnosConError.length > 0) {
            mostrarError(`Debe seleccionar una razón para: ${alumnosConError.join(', ')}`, form);
            return false;
        }

        return faltas;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (submitButton.disabled) return;

        const faltas = validarFormulario();
        if (!faltas) return;

        const presentes = Array.from(listaAlumnos.querySelectorAll('input[type="checkbox"].custom-checkbox'))
            .filter(checkbox => !checkbox.checked)
            .map(checkbox => ({ alumno_id: parseInt(checkbox.value, 10) }));

        const formData = new FormData();
        formData.append('sala', salaSelect.value);
        formData.append('fecha', new Date().toISOString().split('T')[0]);
        formData.append('faltas', JSON.stringify(faltas));
        formData.append('presentes', JSON.stringify(presentes));

        const originalText = submitButton.innerHTML;

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Guardando...';

            const responsefaltas = await fetch(API_PREFIX + 'aniadirFalta.php', { method: 'POST', body: formData });
            const responseTextFaltas = await responsefaltas.text();
            let resultFaltas;
            try {
                resultFaltas = JSON.parse(responseTextFaltas);
            } catch (e) {
                console.error('Respuesta faltas (no JSON):', responseTextFaltas);
                throw new Error('La respuesta del servidor para faltas no es JSON válido');
            }

            if (!resultFaltas.success) throw new Error(resultFaltas.error || 'Error al guardar las faltas');

const responsePresentes = await fetch(API_PREFIX + 'aniadirPresente.php', {
    method: 'POST',
    body: formData
});
const responseTextPresentes = await responsePresentes.text();
let resultPresentes;
try {
    resultPresentes = JSON.parse(responseTextPresentes);
    console.log('✅ RESULT FALTAS =', JSON.stringify(resultFaltas, null, 2));
    console.log('✅ RESULT PRESENTES =', JSON.stringify(resultPresentes, null, 2));
} catch (e) {
    console.error('Error al parsear respuesta:', responseTextPresentes);
    throw new Error('Error en la respuesta del servidor: ' + responseTextPresentes);
}

            if (!resultPresentes.success) throw new Error(resultPresentes.error || 'Error al guardar los presentes');

            // --- LOG: ver exactamente lo que devolvió el servidor
            console.info('resultFaltas:', resultFaltas);
            console.info('resultPresentes:', resultPresentes);

            // Combinar información útil
            const combinedConflicts = [];
            if (Array.isArray(resultFaltas.conflicts)) combinedConflicts.push(...resultFaltas.conflicts);
            if (Array.isArray(resultPresentes.conflicts)) combinedConflicts.push(...resultPresentes.conflicts);

            const rawCombinedText = JSON.stringify({ faltas: resultFaltas, presentes: resultPresentes }).toLowerCase();

            const duplicateKeywords = ['duplic', 'repet', 'ya registrado', 'ya existe', 'already', 'exist', 'duplicate', 'repetido'];

            let hasDuplicate = false;
            const posibleDuplicados = [];

            if (combinedConflicts.length) {
                combinedConflicts.forEach(c => {
                    const msg = (c.message || '').toString().toLowerCase();
                    if (duplicateKeywords.some(k => msg.includes(k)) || c.duplicate || c.type === 'duplicate') {
                        let nombre = null;
                        if (c.alumno_id) {
                            const checkbox = document.getElementById(`alumno_${c.alumno_id}`);
                            try {
                                if (checkbox) {
                                    const span = checkbox.closest('.d-flex').querySelector('span');
                                    if (span) nombre = span.textContent.trim();
                                }
                            } catch (ee) {}
                        }
                        if (!nombre && (c.nombre || c.name)) nombre = c.nombre || c.name;
                        if (!nombre) {
                            const match = (c.message || '').toString().match(/([A-Za-zÁÉÍÓÚáéíóúñÑ ,]{3,})/);
                            if (match) nombre = match[1].trim();
                        }
                        if (!nombre) nombre = c.message || `ID ${c.alumno_id || '??'}`;
                        posibleDuplicados.push(nombre);
                        hasDuplicate = true;
                    }
                });
            }

            if (!hasDuplicate && duplicateKeywords.some(k => rawCombinedText.includes(k))) {
                hasDuplicate = true;
                const posibles = [];
                (resultFaltas.conflicts || []).forEach(c => posibles.push(c.message || c.nombre || c.name || ''));
                (resultPresentes.conflicts || []).forEach(c => posibles.push(c.message || c.nombre || c.name || ''));
                posibles.push(resultFaltas.message || '');
                posibles.push(resultPresentes.message || '');
                posibles.forEach(txt => {
                    const match = (txt || '').toString().match(/([A-Za-zÁÉÍÓÚáéíóúñÑ ,]{3,})/);
                    if (match) posibleDuplicados.push(match[1].trim());
                });
            }

            const duplicadosUnicos = Array.from(new Set(posibleDuplicados.map(s => (s || '').trim()).filter(Boolean)));

            if (duplicadosUnicos.length) {
                const fecha = new Date().toLocaleDateString('es-ES');
                duplicadosUnicos.forEach(nombre => {
                    _createToast(`El alumno <strong>${nombre}</strong> fue registrado el día <strong>${fecha}</strong>.`, { type: 'warning', delay: 8000 });
                });
            }

            const otros = [];
            combinedConflicts.forEach(c => {
                const msg = (c.message || '').toString();
                const lower = msg.toLowerCase();
                if (!duplicateKeywords.some(k => lower.includes(k))) {
                    otros.push(msg || `ID ${c.alumno_id || '??'} conflicto`);
                }
            });
            if (otros.length) {
                const html = `<strong>Otros conflictos:</strong><ul>${otros.map(m => `<li>${m}</li>`).join('')}</ul>`;
                _createToast(html, { type: 'danger', delay: 10000 });
            }

            if (!hasDuplicate && !duplicadosUnicos.length) {
                mostrarMensajeExito(`${resultFaltas.message || 'Faltas procesadas.'}\n${resultPresentes.message || 'Presentes registrados.'}`, form);
            }

            form.reset();
            listaAlumnos.innerHTML = '';
            alumnosContainer.classList.add('d-none');
            await cargarSalas();

        } catch (error) {
            console.error('Error:', error);
            mostrarError(`Error al guardar las faltas: ${error.message}`, form);
            salaSelect.disabled = false;
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
});

// ---- TOAST HELPERS (igual que antes) ----
function _getToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = 1080;
        document.body.appendChild(container);
    }
    return container;
}

function _clearAlerts(container) {
    try {
        if (!container) return;
        const alerts = container.querySelectorAll('.alert');
        alerts.forEach(a => a.remove());
    } catch (e) {}
}

function _createToast(htmlContent, options = {}) {
    const container = _getToastContainer();
    const toastEl = document.createElement('div');
    const typeClass = options.type === 'success' ? 'text-bg-success' : (options.type === 'danger' ? 'text-bg-danger' : 'text-bg-warning');
    toastEl.className = `toast align-items-center ${typeClass} border-0 mb-2`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${htmlContent}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>`;
    container.appendChild(toastEl);
    try {
        const toast = new bootstrap.Toast(toastEl, { delay: options.delay || 6000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    } catch {
        alert(htmlContent.replace(/<[^>]*>?/gm, ''));
        toastEl.remove();
    }
}

function mostrarMensajeExito(text, container) {
    try {
        _clearAlerts(container);
        const html = `<div>${text.replace(/\n/g, '<br>')}</div>`;
        _createToast(html, { type: 'success', delay: 6000 });
    } catch (e) {
        alert(text);
    }
}
