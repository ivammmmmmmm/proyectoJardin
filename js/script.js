getData();

document.getElementById("campo").addEventListener("keyup", getData)

function getData() {
  var input = document.getElementById("campo").value
  var content = document.getElementById("alumnosLista")
  var url = "php/modificarAlumno.php"
  var formData = new FormData()
  formData.append("campo", input)

  fetch(url, {
    method: "POST",
    body: formData,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      content.innerHTML = data;
      // Después de cargar el contenido, inicializar los paneles
      setupInfoPanels();
    }).catch(err => console.log(err))
}

// Función para manejar los paneles de información
function setupInfoPanels() {
  const toggleButtons = document.querySelectorAll('.toggle-info');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      // Cerrar todos los paneles excepto el actual
      document.querySelectorAll('.info-content').forEach(content => {
        if (content !== this.closest('.list-group-item').querySelector('.info-content')) {
          content.classList.remove('show');
        }
      });
      // Toggle el panel actual
      const infoContent = this.closest('.list-group-item').querySelector('.info-content');
      infoContent.classList.toggle('show');
    });
  });
}

// Inicializar paneles de información cuando se carga la página
document.addEventListener('DOMContentLoaded', setupInfoPanels);