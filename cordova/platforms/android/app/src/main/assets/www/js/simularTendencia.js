(function(){
  // Detecta ?simular=1 en la URL
  const params = new URLSearchParams(window.location.search);
  if (!params.get('simular') && !params.get('sim')) return;

  // Datos de ejemplo (enero-noviembre 2025)
  const ejemploTendencia = [
    { mes: '2025-01', total: 12, mesLabel: 'Ene 2025' },
    { mes: '2025-02', total: 8,  mesLabel: 'Feb 2025' },
    { mes: '2025-03', total: 0,  mesLabel: 'Mar 2025' },
    { mes: '2025-04', total: 5,  mesLabel: 'Abr 2025' },
    { mes: '2025-05', total: 0,  mesLabel: 'May 2025' },
    { mes: '2025-06', total: 3,  mesLabel: 'Jun 2025' },
    { mes: '2025-07', total: 7,  mesLabel: 'Jul 2025' },
    { mes: '2025-08', total: 0,  mesLabel: 'Ago 2025' },
    { mes: '2025-09', total: 10, mesLabel: 'Sep 2025' },
    { mes: '2025-10', total: 14, mesLabel: 'Oct 2025' },
    { mes: '2025-11', total: 9,  mesLabel: 'Nov 2025' }
  ];

  // Intentar aplicar después de carga
  function apply() {
    try {
      if (typeof actualizarGraficoTendencia === 'function') {
        actualizarGraficoTendencia(ejemploTendencia);
      }

      // Calcular variación entre últimos dos meses
      const n = ejemploTendencia.length;
      let porcentajeText = '0%';
      if (n >= 2) {
        const actual = ejemploTendencia[n-1].total;
        const anterior = ejemploTendencia[n-2].total;
        if (anterior == 0) {
          porcentajeText = actual == 0 ? '0%' : '∞';
        } else {
          porcentajeText = (((actual - anterior)/anterior)*100).toFixed(1) + '%';
        }
      }
      const el = document.getElementById('porcentajeFaltas');
      if (el) el.textContent = porcentajeText;

      // También actualizar tarjetas rápidas si existen
      const total = ejemploTendencia.reduce((s,t)=>s+(parseInt(t.total)||0),0);
      const totalEl = document.getElementById('totalFaltas');
      if (totalEl) totalEl.textContent = total;

      // Promedio por sala: ejemplo simple
      const promEl = document.getElementById('promedioFaltas');
      if (promEl) promEl.textContent = (total / 2).toFixed(1); // suponer 2 salas

      // Actualizar tabla de razones/salas si las funciones existen
      if (typeof actualizarGraficoRazones === 'function') {
        const fakeRazones = { razones: [ { nombre: 'Enfermedad', total: 6 }, { nombre: 'Familia', total: 4 } ] };
        actualizarGraficoRazones(fakeRazones);
        actualizarTabla(fakeRazones);
      }
      if (typeof actualizarGraficoSalas === 'function') {
        const fakeSalas = { salas: [ { nombre: '1', total: 6 }, { nombre: '2', total: 4 } ] };
        actualizarGraficoSalas(fakeSalas);
      }

      console.info('Simulación aplicada: ejemploTendencia');
    } catch (e) {
      console.error('No se pudo inyectar simulación:', e);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(apply, 100);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(apply, 100));
  }
})();
