// Variables globales para los gráficos de Chart.js
var API_PREFIX = (typeof API_PREFIX !== 'undefined') ? API_PREFIX : ((typeof API_BASE !== 'undefined') ? API_BASE : '../php/');
let razonesChart = null;
let salasChart = null;
let tendenciaChart = null;


// NOTE: tooltips removed — no elementos usan data-bs-toggle="tooltip" en este diseño.
// Esta función se eliminó para simplificar el código y evitar comportamiento innecesario.

// Función para el buscador de la tabla
function initTableSearch() {
    const searchInput = document.getElementById('searchTable');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const table = document.getElementById('tableFaltas');
            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

            Array.from(rows).forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Indicador de carga
function mostrarCargando() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.className = 'position-fixed top-50 start-50 translate-middle bg-dark bg-opacity-75 p-3 rounded text-white';
    loadingDiv.innerHTML = `<div class="d-flex align-items-center"><div class="spinner-border me-2" role="status"><span class="visually-hidden">Cargando...</span></div><span>Cargando...</span></div>`;
    document.body.appendChild(loadingDiv);
}

function ocultarCargando() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) loadingDiv.remove();
}

// Manejo de errores
function mostrarError(mensaje, detalles = null) {
    console.error('Error:', mensaje, detalles);
    const alertDiv = document.createElement('div');
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `<strong>Error:</strong> ${mensaje} ${detalles ? `<br><small>Detalles: ${typeof detalles === 'string' ? detalles : JSON.stringify(detalles)}</small>` : ''} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    mainElement.insertAdjacentElement('afterbegin', alertDiv);
}

// Función para generar colores aleatorios
function generarColores(cantidad) {
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
        // Generación de colores HSL para mejor contraste
        const hue = (i * 137.5) % 360; 
        colores.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colores;
}

// Genera una leyenda HTML simple: cuadrados de color + etiqueta (+ opcional valor)
function renderLegend(containerId, labels, colors, values) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    labels.forEach((label, i) => {
        const color = colors[i] || '#888';
        const val = values && typeof values[i] !== 'undefined' ? ` — ${values[i]}` : '';

        const item = document.createElement('div');
        item.className = 'd-inline-block me-3 mb-1';
        item.style.whiteSpace = 'nowrap';
        item.innerHTML = `
            <span style="display:inline-block;width:12px;height:12px;background:${color};border-radius:2px;margin-right:6px;vertical-align:middle;border:1px solid rgba(0,0,0,0.1)"></span>
            <span class="text-muted">${label}${val}</span>
        `;
        fragment.appendChild(item);
    });

    container.appendChild(fragment);
}


async function cargarSalas() {
    try {
        console.log('Iniciando carga de salas...');
        // Endpoint para cargar las salas. Ajusta si la ruta es incorrecta.
    const response = await fetch(API_PREFIX + 'obtenerSalasConTurnos.php');

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const data = await response.json();

        // El ID del select es 'salaSelect' según tu HTML
        const selectSala = document.getElementById('salaSelect');
        if (!selectSala) throw new Error('No se encontró el elemento select de salas (salaSelect)');

        selectSala.innerHTML = '<option value="">Todas las salas</option>';
        
        let salas = [];
        if (Array.isArray(data)) {
            // Caso: La respuesta es un array directo de salas
            salas = data;
        } else if (data && data.status === 'success' && Array.isArray(data.datos)) {
            // Caso: La respuesta es {status: 'success', datos: [salas...]}
            salas = data.datos;
        } else if (data && data.datos) {
            // Si data.datos existe pero no es un array, convertirlo en array
            salas = [].concat(data.datos);
        } else {
            console.error('Formato de datos inesperado:', data);
            throw new Error('Los datos de las salas no tienen el formato esperado');
        }

        salas.forEach(sala => {
            if (sala && sala.id && sala.nombre) {
                const option = document.createElement('option');
                option.value = sala.id;
                option.textContent = `Sala ${sala.nombre}${sala.turno ? ` (${sala.turno})` : ''}`;
                selectSala.appendChild(option);
            }
        });

        console.log(`Salas cargadas: ${salas.length}`);
    } catch (error) {
        console.error('Error en cargarSalas:', error);
        mostrarError('Error al cargar la lista de salas para el filtro', error.message);
    }
}



function actualizarGraficoRazones(data) {
    const ctx = document.getElementById('chartRazones');
    if (!ctx) return; // Salir si el elemento no existe

    if (razonesChart) {
        razonesChart.destroy();
    }
    
    const datos = Array.isArray(data.razones) ? data.razones : [];
    const colores = generarColores(datos.length);
    
    razonesChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: datos.map(d => d.nombre),
            datasets: [{
                data: datos.map(d => parseInt(d.total) || 0),
                backgroundColor: colores,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false // usamos leyenda HTML personalizada debajo del gráfico
                },
                title: {
                    display: true,
                    text: 'Distribución de Faltas por Razón',
                    color: '#212529'
                }
            }
        }
    });

    // Renderizar leyenda personalizada (etiquetas + valores)
    renderLegend('legendRazones', datos.map(d => d.nombre), colores, datos.map(d => d.total));
}

function actualizarGraficoSalas(data) {
    const ctx = document.getElementById('chartSalas');
    if (!ctx) return;

    if (salasChart) {
        salasChart.destroy();
    }
    
    const datos = Array.isArray(data.salas) ? data.salas : [];
    const labels = datos.map(d => d.nombre);
    const totales = datos.map(d => parseInt(d.total) || 0);

    salasChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total de Faltas',
                data: totales,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            },
            plugins: {
                legend: { display: false }, // usamos leyenda HTML personalizada
                title: {
                    display: true,
                    text: 'Faltas por Sala',
                    color: '#212529'
                }
            }
        }
    });

    // Generar leyenda simple con valores por sala
    renderLegend('legendSalas', labels, labels.map((_, i) => 'rgba(54, 162, 235, 0.7)'), totales.map(t => t));
}

function actualizarGraficoTendencia(data) {
    const ctx = document.getElementById('chartTendencia');
    if (!ctx) return;

    if (tendenciaChart) {
        tendenciaChart.destroy();
    }
    const datos = Array.isArray(data) ? data : (data.tendencia || []);

    tendenciaChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: datos.map(t => t.label || t.mesLabel || t.mes),
            datasets: [{
                label: 'Faltas por Mes',
                data: datos.map(t => parseInt(t.total) || 0),
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#212529' }
                },
                title: {
                    display: true,
                    text: 'Tendencia Mensual de Faltas',
                    color: '#212529'
                }
            }
        }
    });
}


// Devuelve un array de meses en formato 'YYYY-MM' desde inicio hasta fin (inclusive)
function monthsBetween(startISO, endISO) {
    const partsStart = (startISO || '').split('-');
    const partsEnd = (endISO || '').split('-');
    if (partsStart.length < 2 || partsEnd.length < 2) return [];

    const startYear = parseInt(partsStart[0], 10);
    const startMonth = parseInt(partsStart[1], 10) - 1; // 0-based
    const endYear = parseInt(partsEnd[0], 10);
    const endMonth = parseInt(partsEnd[1], 10) - 1;

    const start = new Date(startYear, startMonth, 1);
    const end = new Date(endYear, endMonth, 1);
    const months = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) {
        const y = cur.getFullYear();
        const m = (cur.getMonth() + 1).toString().padStart(2, '0');
        months.push(`${y}-${m}`);
        cur.setMonth(cur.getMonth() + 1);
    }
    return months;
}

// Map de meses cortos
const SPANISH_SHORT_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function monthLabelSpanish(yyyymm) {
    if (!yyyymm) return yyyymm;
    const parts = yyyymm.split('-');
    if (parts.length !== 2) return yyyymm;
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const name = SPANISH_SHORT_MONTHS[m-1] || parts[1];
    return `${name} ${y}`; // e.g. 'Nov 2025'
}



function actualizarTabla(data) {
    const tbody = document.querySelector('#tableFaltas tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    let totalGlobal = 0;
    data.razones.forEach(razon => totalGlobal += parseInt(razon.total) || 0);

    data.razones.forEach(razon => {
        const row = document.createElement('tr');
        const cantidad = parseInt(razon.total) || 0;
        const porcentaje = totalGlobal > 0 ? ((cantidad / totalGlobal) * 100).toFixed(1) : 0;

        row.innerHTML = `
            <td>${razon.nombre}</td>
            <td class="text-center">${cantidad}</td>
            <td class="text-center">${porcentaje}%</td>
        `;
        tbody.appendChild(row);
    });

    // Actualizar el total en el footer de la tabla
    document.getElementById('totalTabla').textContent = totalGlobal;
    document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
}

// Cargar datos principal
async function cargarDatos(fechaInicio, fechaFin, salaId) {
    try {
        document.querySelectorAll('.alert').forEach(a => a.remove());
        mostrarCargando();

        const params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        // Si salaId tiene valor (no es "" o null), se incluye para el filtro
        if (salaId) params.append('salaId', salaId); 

        const url = API_PREFIX + `estadisticasFaltas.php?${params.toString()}`;
        console.log('Intentando conectar a:', url);

        const response = await fetch(url);
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Respuesta: ${errorText.substring(0, 100)}...`);
        }

        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError(`Respuesta no es JSON: ${contentType}`);
        }

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        // Actualizar estadísticas rápidas (cards)
        const totalFaltas = data.razones.reduce((sum, item) => sum + parseInt(item.total || 0), 0);
        document.getElementById('totalFaltas').textContent = totalFaltas;
        
        // Calcular promedio de faltas por sala
        const promedioFaltas = (data.salas.length > 0) ? 
            (totalFaltas / data.salas.length).toFixed(1) : '0';
        document.getElementById('promedioFaltas').textContent = promedioFaltas;
        
        // Rellenar meses faltantes en tendencia entre las fechas solicitadas
        const tendenciaRaw = Array.isArray(data.tendencia) ? data.tendencia : [];
        const mesesContinuos = monthsBetween(fechaInicio, fechaFin);
        const mapa = {};
        tendenciaRaw.forEach(t => { mapa[String(t.mes)] = parseInt(t.total) || 0; });

        const tendenciaCompleta = mesesContinuos.map(mes => ({
            mes: mes,
            total: mapa[mes] || 0,
            mesLabel: monthLabelSpanish(mes)
        }));

        // Calcular porcentaje respecto al mes anterior (con meses faltantes rellenados)
        const mesesTendencia = tendenciaCompleta.length;
        if (mesesTendencia >= 2) {
            const mesActual = tendenciaCompleta[mesesTendencia - 1].total;
            const mesAnterior = tendenciaCompleta[mesesTendencia - 2].total;
            let porcentajeText = '0%';
            if (mesAnterior == 0) {
                if (mesActual == 0) porcentajeText = '0%';
                else porcentajeText = '∞'; // aumento infinito (antes 0)
            } else {
                const porcentaje = ((mesActual - mesAnterior) / mesAnterior * 100).toFixed(1);
                porcentajeText = porcentaje + '%';
            }
            document.getElementById('porcentajeFaltas').textContent = porcentajeText;
        } else {
            document.getElementById('porcentajeFaltas').textContent = '0%';
        }

        // Actualizar gráficos (pasamos tendenciaCompleta para que incluya labels)
        actualizarGraficoRazones(data);
        actualizarGraficoSalas(data);
        actualizarGraficoTendencia(tendenciaCompleta);
        
        // Actualizar tabla
        actualizarTabla(data);

    } catch (error) {
        console.error('Error detallado:', error);
        mostrarError(`Error al conectar con el servidor: ${error.message}`);
    } finally {
        ocultarCargando();
    }
}


function exportarExcel() {
    if (typeof XLSX === 'undefined') {
        mostrarError('La librería de exportación (XLSX) no está cargada.');
        return;
    }

    const table = document.getElementById('tableFaltas');
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    const data = [headers];

    table.querySelectorAll('tbody tr').forEach(row => {
        const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
        data.push(rowData);
    });
    
    // Incluir la fila de total del tfoot
    const tfootRow = table.querySelector('tfoot tr');
    const totalRowData = Array.from(tfootRow.querySelectorAll('td')).map(td => td.textContent.trim());
    data.push(totalRowData);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();

    // Ajuste de ancho de columnas
    ws['!cols'] = headers.map((_, i) => ({ wch: Math.max(...data.map(r => String(r[i]).length + 2)) }));

    XLSX.utils.book_append_sheet(wb, ws, 'Estadísticas_Faltas');
    XLSX.writeFile(wb, `Estadisticas_Faltas_${fecha}.xlsx`);
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const hoy = new Date();
        
        // 1. Referencias a elementos del DOM
        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        const salaSelect = document.getElementById('salaSelect');
        const aplicarFiltrosBtn = document.getElementById('aplicarFiltros');
        
        // 2. Inicializar componentes
    // initTooltips removed (no tooltips used)
    initTableSearch();
        
        // 3. Configurar fecha inicial
        // Por defecto: primer día del mes hasta hoy
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        const hoyString = hoy.toISOString().split('T')[0];
        
        if (fechaInicio) fechaInicio.value = inicioMes;
        if (fechaFin) fechaFin.value = hoyString;
        
        // 4. Cargar la lista de salas (Crucial para el filtro)
        await cargarSalas(); 

        // 5. Cargar datos iniciales
        // Se carga con las fechas del mes actual y sin filtro de sala
        await cargarDatos(inicioMes, hoyString, ''); 

        // 6. Configurar event listener para el botón Aplicar
        if (aplicarFiltrosBtn) {
            aplicarFiltrosBtn.addEventListener('click', async function() {
                this.disabled = true;
                const inicio = fechaInicio.value;
                const fin = fechaFin.value;
                const sala = salaSelect.value || ''; // Usar '' si es null/undefined
                
                try {
                    await cargarDatos(inicio, fin, sala); 
                } catch (error) {
                    mostrarError('Error al cargar los datos filtrados');
                } finally {
                    setTimeout(() => this.disabled = false, 300);
                }
            });
        }
        
        // 7. Configurar la exportación a Excel
        const exportExcelButton = document.getElementById('exportExcel');
        if (exportExcelButton) {
            exportExcelButton.addEventListener('click', exportarExcel);
        }

    } catch (error) {
        console.error('Error en la inicialización:', error);
        mostrarError('Error al inicializar la página');
    }
});
