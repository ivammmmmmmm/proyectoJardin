<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <?php
    include("conexion.php");

    $nombre = $_POST['nombre'];
    $apellido = $_POST['apellido'];
    $dni = $_POST['dni'];
    $direccion = $_POST['direccion'];
    $nacimiento = $_POST['nacimiento'];
    $localidad = $_POST['localidad'];

    mysqli_query($conexion, "insert into table alumno (nombre,apellido,dni,direccion,fecha_nacimiento,idLocalidad) values ('$nombre','$apellido',$dni,'$direccion','$nacimiento',$localidad);");

    mysqli_close($conexion);
    ?>
</body>

</html>