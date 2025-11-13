// Variables globales
var API_PREFIX = (typeof API_PREFIX !== 'undefined') ? API_PREFIX : ((typeof API_BASE !== 'undefined') ? API_BASE : '../php/');
let comunicadosChart = null;

function mostrarCargando() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.className = 'position-fixed top-50 start-50 translate-middle bg-dark bg-opacity-75 p-3 rounded text-white';
    loadingDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border me-2" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <span>Cargando...</span>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

function ocultarCargando() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) loadingDiv.remove();
}

function mostrarError(mensaje, detalles = null) {
    console.error('Error:', mensaje, detalles);
    const alertDiv = document.createElement('div');
    const mainElement = document.querySelector('main');
    if (!mainElement) {
        console.error('No se encontró el elemento <main> para mostrar el error.');
        return;
    }

    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Error:</strong> ${mensaje}
        ${detalles ? `<br><small>Detalles: ${typeof detalles === 'string' ? detalles : JSON.stringify(detalles)}</small>` : ''}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    mainElement.insertAdjacentElement('afterbegin', alertDiv);
}

function actualizarGrafico(datos) {
    const ctxEl = document.getElementById('chartComunicados');
    if (!ctxEl) return;
    const ctx = ctxEl.getContext('2d');

    if (comunicadosChart) {
        comunicadosChart.destroy();
        comunicadosChart = null;
    }

    // Asegurar que los datos sean numéricos
    const datosNumericos = (datos.datasets || []).map(dataset => ({
        ...dataset,
        data: (dataset.data || []).map(v => Number(v) || 0)
    }));

    const config = {
        type: 'bar',
        data: {
            labels: datos.labels || [],
            datasets: datosNumericos
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutCubic' },
            plugins: {
                title: { display: true, text: 'Comunicados por Sala', color: '#212529', font: { size: 16 } },
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { ticks: { color: '#212529' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                y: { beginAtZero: true, ticks: { color: '#212529' }, grid: { color: 'rgba(0,0,0,0.05)' } }
            }
        }
    };

    comunicadosChart = new Chart(ctx, config);
    // No se muestra leyenda de colores para este gráfico (diseño simplificado)
}


function actualizarTabla(datos) {
    const tbody = document.querySelector('#tableSalas tbody');
    tbody.innerHTML = '';

    datos.forEach(sala => {
        const row = document.createElement('tr');
        const alumnos = sala.alumnos_con_comunicados || 0;
        const totales = sala.total_comunicados || 0;
        const porcentaje = totales > 0 ? ((alumnos / totales) * 100).toFixed(1) : 0;

        row.innerHTML = `
            <td>${sala.id}</td>
            <td>Sala ${sala.nombre}</td>
            <td>${alumnos}</td>
            <td>${totales}</td>
            <td>${porcentaje}%</td>
            <td>${new Date().toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

async function cargarSalas() {
    try {
    const response = await fetch(API_PREFIX + 'obtenerSalasConTurnos.php');

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const data = await response.json();

        const selectSala = document.getElementById('selectSala');
        if (!selectSala) throw new Error('No se encontró el elemento select de salas (selectSala)');

        // Limpiar y añadir la opción por defecto
        selectSala.innerHTML = '<option value="">Todas las salas</option>';

        if (data && Array.isArray(data)) {
            // Caso: Respuesta es un array directo de salas
            data.forEach(sala => {
                if (sala && sala.id && sala.nombre) {
                    const option = document.createElement('option');
                    option.value = sala.id;
                    option.textContent = `Sala ${sala.nombre}${sala.turno ? ` (${sala.turno})` : ''}`;
                    selectSala.appendChild(option);
                }
            });
        } else if (data && data.status === 'success' && Array.isArray(data.datos)) {
            // Caso: Respuesta es {status: 'success', datos: [salas...]}
            data.datos.forEach(sala => {
                if (sala && sala.id && sala.nombre) {
                    const option = document.createElement('option');
                    option.value = sala.id;
                    option.textContent = `Sala ${sala.nombre}${sala.turno ? ` (${sala.turno})` : ''}`;
                    selectSala.appendChild(option);
                }
            });
        } else {
             console.warn('Formato de respuesta de salas inesperado:', data);
             // Si el formato es inesperado, se muestra un error, pero el script sigue
             mostrarError('Error: El formato de datos de salas es inválido.');
        }

    // salas cargadas
    } catch (error) {
        console.error('Error en cargarSalas:', error);
        mostrarError('Error al cargar la lista de salas', error.message);
    }
}


async function cargarDatos(mes = null, anio = null, sala = null) {
    try {
        document.querySelectorAll('.alert').forEach(a => a.remove());
        mostrarCargando();

        const params = new URLSearchParams();
        if (mes) params.append('mes', mes);
        if (anio) params.append('anio', anio);
        // Solo enviar sala si tiene un valor (no es nulo o cadena vacía)
        if (sala && sala !== "") params.append('sala', sala); 

    const url = API_PREFIX + `estadisticasSalas.php?${params.toString()}`;

        const response = await fetch(url);
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            // Intenta obtener el texto de error del PHP
            let errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, Respuesta: ${errorText.substring(0, 100)}...`);
        }

        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError(`Respuesta no es JSON: ${contentType}`);
        }

    const data = await response.json();

        if (data.status === 'success') {
            if (!data.datos || data.datos.length === 0) {
                mostrarError('No se encontraron datos para el período seleccionado');
                return;
            }

            actualizarGrafico(data.grafico);
            actualizarTabla(data.datos);
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
        } else {
            mostrarError(data.message || 'Error al cargar los datos');
        }

    } catch (error) {
        console.error('Error detallado:', error);
        mostrarError(`Error al conectar con el servidor: ${error.message}`);
    } finally {
        ocultarCargando();
    }
}


function exportarExcel() {
    // Se asume que la librería XLSX (SheetJS) está cargada en el HTML
    if (typeof XLSX === 'undefined') {
        mostrarError('La librería de exportación (XLSX) no está cargada.');
        return;
    }

    const table = document.getElementById('tableSalas');
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    const data = [headers];

    table.querySelectorAll('tbody tr').forEach(row => {
        const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
        data.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();

    ws['!cols'] = headers.map((_, i) => ({ wch: Math.max(...data.map(r => String(r[i]).length + 2)) }));

    XLSX.utils.book_append_sheet(wb, ws, 'Estadísticas');
    XLSX.writeFile(wb, `Estadisticas_Salas_${fecha}.xlsx`);
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const hoy = new Date();
        
        // 1. Configurar fecha por defecto
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        
        if (dateFrom) dateFrom.value = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        if (dateTo) dateTo.value = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

        // 2. Cargar la lista de salas para el filtro
        await cargarSalas();

        // 3. Cargar datos iniciales
        // Usamos solo el mes y año iniciales
        await cargarDatos(hoy.getMonth() + 1, hoy.getFullYear());

        // 4. Configurar event listeners
        const applyFiltersButton = document.getElementById('applyFilters');
        if (applyFiltersButton) {
            applyFiltersButton.addEventListener('click', async function() {
                const fechaDesde = new Date(document.getElementById('dateFrom').value);
                const sala = document.getElementById('selectSala') ? document.getElementById('selectSala').value : null;
                
                this.disabled = true;
                try {
                    await cargarDatos(
                        fechaDesde.getMonth() + 1,
                        fechaDesde.getFullYear(),
                        sala 
                    );
                } catch (error) {
                    mostrarError('Error al cargar los datos filtrados');
                } finally {
                    setTimeout(() => this.disabled = false, 300);
                }
            });
        }

        const exportExcelButton = document.getElementById('exportExcel');
        if (exportExcelButton) {
            exportExcelButton.addEventListener('click', exportarExcel);
        }

    } catch (error) {
        console.error('Error en la inicialización:', error);
        mostrarError('Error al inicializar la página');
    }
});
