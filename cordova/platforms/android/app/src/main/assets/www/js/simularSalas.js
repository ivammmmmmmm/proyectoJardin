// Simulación de datos para Estadísticas Salas
(function() {
    const params = new URLSearchParams(window.location.search);
    if (!(params.get('simular') === '1' || params.get('sim') === '1')) return;

    function runSimulation() {
        // Datos de ejemplo para el gráfico
        const simGrafico = {
            labels: ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4'],
            datasets: [{
                label: 'Comunicados',
                data: [12, 8, 5, 3]
            }]
        };

        // Datos de ejemplo para la tabla (coincidir con las labels)
        const simDatos = [
            { id: 1, nombre: '1', alumnos_con_comunicados: 9, total_comunicados: 12 },
            { id: 2, nombre: '2', alumnos_con_comunicados: 5, total_comunicados: 8 },
            { id: 3, nombre: '3', alumnos_con_comunicados: 4, total_comunicados: 5 },
            { id: 4, nombre: '4', alumnos_con_comunicados: 2, total_comunicados: 3 }
        ];

        // Esperar a que las funciones del script principal estén disponibles
        const attempt = () => {
            if (typeof window.actualizarGrafico === 'function' || typeof window.actualizarTabla === 'function' || window.comunicadosChart !== undefined) {
                try {
                    if (typeof actualizarGrafico === 'function') actualizarGrafico(simGrafico);
                    if (typeof actualizarTabla === 'function') actualizarTabla(simDatos);
                    const last = document.getElementById('lastUpdated');
                    if (last) last.textContent = 'Simulado: ' + new Date().toLocaleString();
                } catch (e) {
                    // no bloquear
                    console.error('Error al inyectar datos simulados:', e);
                }
            } else {
                // reintentar brevemente si las funciones aún no están cargadas
                setTimeout(attempt, 120);
            }
        };

        attempt();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runSimulation);
    else runSimulation();
})();
