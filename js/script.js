$(document).ready(function (){
    $.ajax({
        url: '../php/modificarAlumno.php',
        type: 'POST',
        dataType:'json',
        
        success: function(respuesta){
            $('#alumnosLista').html(respuesta);
        },

        error: function(xhr, status, error){
                // La función se ejecuta si hay un error
                console.error("Error al obtener los datos: " + error);
                $('#contenedor-registros').html('<p>Ocurrió un error al cargar los datos.</p>');
        }
    })
});