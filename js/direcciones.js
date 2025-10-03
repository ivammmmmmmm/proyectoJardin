document.addEventListener("DOMContentLoaded", () => {
  const selProvincia = document.getElementById("provincia");
  const selPartido = document.getElementById("partido");
  const selLocalidad = document.getElementById("localidad");

  // 🔹 Función para limpiar duplicados y ordenar por nombre
  function limpiar(lista) {
    const unicos = new Map();
    lista.forEach(item => {
      // 🟢 CORRECCIÓN: Usar item.id para la clave en el Map
      if (!unicos.has(item.id)) {
        unicos.set(item.id, item); 
      }
    });
    return Array.from(unicos.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }

  // 🔹 Cargar provincias
  //limpia los selects
  selPartido.innerHTML = '<option value="">Seleccione un partido</option>';
  selLocalidad.innerHTML = '<option value="">Seleccione una localidad</option>';
  selPartido.innerHTML = '<option value="">Seleccione un partido</option>';
  selPartido.disabled = true;
  selLocalidad.disabled = true;
  selLocalidad.disabled = true;

  // Limpia todas las opciones menos la primera (por defecto)
  selProvincia.innerHTML = '';
  const defaultProvincia = document.createElement('option');
  defaultProvincia.value = '';
  defaultProvincia.textContent = 'Seleccione una provincia';
  selProvincia.appendChild(defaultProvincia);

  fetch("https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre&max=100")
    .then(r => r.json())
    .then(data => {
      // ❗ Los datos están en data.provincias
      limpiar(data.provincias).forEach(p => {
        // Evita agregar si ya existe una opción con ese id
        if (!selProvincia.querySelector(`option[value='${p.id}']`)) {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = p.nombre;
          selProvincia.appendChild(opt);
        }
      });
    });

  // 🔹 Al cambiar provincia → cargar partidos
  selProvincia.addEventListener("change", () => {
    // Limpia todas las opciones menos la primera (por defecto)
    selPartido.innerHTML = '';
    const defaultPartido = document.createElement('option');
    defaultPartido.value = '';
    defaultPartido.textContent = 'Seleccione un partido';
    selPartido.appendChild(defaultPartido);
    selLocalidad.innerHTML = '';
    const defaultLocalidad = document.createElement('option');
    defaultLocalidad.value = '';
    defaultLocalidad.textContent = 'Seleccione una localidad';
    selLocalidad.appendChild(defaultLocalidad);
    selPartido.disabled = true;
    selLocalidad.disabled = true;

    if (!selProvincia.value) return;

    fetch(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${selProvincia.value}&max=5000&campos=id,nombre&orden=nombre`)
      .then(r => r.json())
      .then(data => {
        // ❗ Los datos están en data.departamentos
        limpiar(data.departamentos).forEach(d => { 
          if (!selPartido.querySelector(`option[value='${d.id}']`)) {
            const opt = document.createElement("option");
            opt.value = d.id;
            opt.textContent = d.nombre;
            selPartido.appendChild(opt);
          }
        });
        selPartido.disabled = false;
      });
  });

  // 🔹 Al cambiar partido → cargar localidades
  selPartido.addEventListener("change", () => {
    // Limpia todas las opciones menos la primera (por defecto)
    // Refuerzo: limpiar completamente el select antes de agregar opciones
    while (selLocalidad.options.length > 0) {
      selLocalidad.remove(0);
    }
    const defaultLocalidad = document.createElement('option');
    defaultLocalidad.value = '';
    defaultLocalidad.textContent = 'Seleccione una localidad';
    selLocalidad.appendChild(defaultLocalidad);
    selLocalidad.disabled = true;

    if (!selPartido.value) return;

    fetch(`https://apis.datos.gob.ar/georef/api/localidades?departamento=${selPartido.value}&max=5000&campos=id,nombre&orden=nombre`)
      .then(r => r.json())
      .then(data => {
        // ❗ Los datos están en data.localidades
        // Filtrar duplicados por nombre ANTES de limpiar
        const nombresSet = new Set();
        let localidadesFiltradas = data.localidades.filter(l => {
          if (nombresSet.has(l.nombre)) return false;
          nombresSet.add(l.nombre);
          return true;
        });

          // Restaurar definición de localidadesExtra
          const localidadesExtra = {
            'malvinas argentinas|buenos aires': [
              { id: 'extra-1', nombre: 'Tierras Altas' }
            ],
            'tigre|buenos aires': [
              { id: 'extra-3', nombre: 'Nuevo Delta' },
              { id: 'extra-4', nombre: 'Delta Islas' }
            ],
            'la matanza|buenos aires': [
              { id: 'extra-7', nombre: 'Villa Madero' },
              { id: 'extra-8', nombre: 'Villa Celina' }
            ],
            'general san martín|buenos aires': [
              { id: 'extra-25', nombre: 'José León Suárez' }
            ]
          };
      
        const partidoNombre = selPartido.options[selPartido.selectedIndex].text.trim().toLowerCase();
        const provinciaNombre = selProvincia.options[selProvincia.selectedIndex].text.trim().toLowerCase();
        const clave = partidoNombre + '|' + provinciaNombre;
        if (localidadesExtra[clave]) {
          localidadesFiltradas = localidadesFiltradas.concat(localidadesExtra[clave]);
        }

          // --- INTEGRACIÓN NOMINATIM ---
          // Si no hay localidades, buscar en Nominatim
          if (localidadesFiltradas.length === 0) {
            // Consultar Nominatim por partido y provincia
            const nominatimUrl = `https://nominatim.openstreetmap.org/search?country=Argentina&state=${encodeURIComponent(provinciaNombre)}&county=${encodeURIComponent(partidoNombre)}&format=json&limit=20`;
            fetch(nominatimUrl, { headers: { 'Accept-Language': 'es' } })
              .then(r => r.json())
              .then(nominatimData => {
                // Mapear resultados de Nominatim a formato compatible
                const localidadesNominatim = nominatimData.map((item, idx) => ({
                  id: 'nom-' + idx,
                  nombre: item.display_name.split(',')[0]
                }));
                // Evitar duplicados
                const nombresExistentes = new Set(localidadesFiltradas.map(l => l.nombre.toLowerCase()));
                const nuevasLocalidades = localidadesNominatim.filter(l => !nombresExistentes.has(l.nombre.toLowerCase()));
                localidadesFiltradas = localidadesFiltradas.concat(nuevasLocalidades);
                limpiar(localidadesFiltradas).forEach(l => {
                  const opt = document.createElement("option");
                  opt.value = l.id;
                  opt.textContent = l.nombre;
                  selLocalidad.appendChild(opt);
                });
                selLocalidad.disabled = false;
              })
              .catch(() => {
                // Si Nominatim falla, dejar el select vacío
                selLocalidad.disabled = true;
              });
          } else {
            limpiar(localidadesFiltradas).forEach(l => {
              const opt = document.createElement("option");
              opt.value = l.id;
              opt.textContent = l.nombre;
              selLocalidad.appendChild(opt);
            });
            selLocalidad.disabled = false;
          }
      });
  });
});