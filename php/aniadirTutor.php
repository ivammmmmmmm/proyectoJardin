<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
        include('conexion.php');

        $nombre=$_POST['nombre'];
        $apellido=$_POST['apellido'];
        $telefono=$_POST['telefono'];
        $direccion=$_POST['direccion'];
        $localidad=$_POST['localidad'];
        $mail=$_POST['mail'];

        mysqli_query("insert into padretutor (nombre,apellido,telefono,direccion,idLocalidad,mail) values ('$nombre','$apellido',$telefono,$direccion,'$mail');");

        mysqli_close($conexion);
    ?>
</body>
</html>