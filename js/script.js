// Función para obtener datos
function getData() {
  var input = document.getElementById("campo").value
  var content = document.getElementById("alumnosLista")
  var url = "../php/modificarAlumno.php"
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
      content.innerHTML = data
      // Después de cargar el contenido, inicializar los eventos de toggle
      initializeToggleEvents();
    })
    .catch((err) => console.log(err))
}

// Función para inicializar eventos de toggle
function initializeToggleEvents() {
  // Obtener todos los botones de toggle
  const toggleButtons = document.querySelectorAll('.toggle-info');

  // Agregar evento click a cada botón
  toggleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Cerrar todos los paneles de información
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

// Inicializar
getData();
document.getElementById("campo").addEventListener("keyup", getData);
// Inicializar eventos de toggle para el contenido inicial
document.addEventListener('DOMContentLoaded', initializeToggleEvents);