function alumnosAcordeon(){
    $.ajax({
        url: '../php/modificarAlumno.php',
        type: 'POST',

        success: function(respuesta){
            $('#alumnosLista').html(respuesta);
        }
    })
}