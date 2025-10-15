getData();

document.getElementById("campo").addEventListener("keyup", getData)

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
    })
    .catch((err) => console.log(err))
}